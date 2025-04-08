import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { SocketService } from '../../../../core/services/socket.service';
import { EntregadorService } from '../../../../core/services/entregador.service';

type Entregador = {
  id: string;
  nome: string;
  status: 'ativo' | 'inativo';
  localizacao: L.LatLng;
  marcador?: L.Marker;
};

@Component({
  selector: 'app-mapa-entregadores',
  templateUrl: './mapa-entregadores.component.html',
  styleUrls: ['./mapa-entregadores.component.sass']
})
export class MapaEntregadoresComponent implements OnInit {
  private icones = {
    inicio: L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/3177/3177361.png',
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    }),
    parada: L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/252/252025.png',
      iconSize: [24, 24],
      iconAnchor: [12, 24]
    }),
    fim: L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/1912/1912207.png',
      iconSize: [40, 40],
      iconAnchor: [14, 28]
    }),
    entregador: L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/16422/16422519.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    })
  };

  entregadoresVisiveis: Entregador[] = [];
  entregadorSelecionadoId: string | null = null;
  private entregadores: Entregador[] = [];
  private mapa!: L.Map;
  private trechosPercorridos: { [id: string]: L.Polyline } = {};
  private pontosPercorridos: { [id: string]: L.LatLng[] } = {};
  filtrosAtuais = { status: 'todos', raioKm: 50 };

  constructor(
    private socketService: SocketService,
    private entregadorService: EntregadorService
  ) {}

  ngOnInit(): void {
    this.inicializarMapa();
    this.carregarEntregadores();
    this.socketService.escutarLocalizacaoAtualizada().subscribe(dados => {
      this.atualizarOuAdicionarEntregador(dados);
    });
    this.socketService.escutarStatusAtualizado().subscribe((dados: any) => {
      this.atualizarStatusEntregador(dados);
    });
    
  }

  atualizarStatusEntregador(dados: { id: string; status: 'ativo' | 'inativo' }): void {
    const entregador = this.entregadores.find(e => e.id === dados.id);
    if (entregador) {
      entregador.status = dados.status;
      this.filtrarEntregadores(this.filtrosAtuais);
    }
  }
  

  inicializarMapa(): void {
    this.mapa = L.map('mapa').setView([-23.56, -46.63], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.mapa);
    this.filtrarEntregadores(this.filtrosAtuais);
  }

  filtrarEntregadores(filtros: { status: string; raioKm: number }): void {
    this.filtrosAtuais = filtros;
    const centro = L.latLng(-23.56, -46.63);
    const raioMetros = filtros.raioKm * 1000;
    const filtrados = this.entregadores.filter(ent => {
      const distanciaValida = ent.localizacao.distanceTo(centro) <= raioMetros;
      const statusValido = filtros.status === 'todos' || ent.status === filtros.status;
      return distanciaValida && statusValido;
    });
    // Remove markers dos entregadores não filtrados
    this.entregadoresVisiveis.forEach(e => {
      if (e.marcador) this.mapa.removeLayer(e.marcador);
    });
    this.entregadoresVisiveis = filtrados;
    // Adiciona markers dos entregadores filtrados
    this.entregadoresVisiveis.forEach(ent => {
      if (ent.marcador) ent.marcador.addTo(this.mapa);
    });
  }

  focarEntregador(entregador: Entregador): void {
    this.entregadorSelecionadoId = entregador.id;
    this.mapa.flyTo(entregador.localizacao, 16, { animate: true, duration: 1 });
    if (entregador.marcador) {
      entregador.marcador.openPopup();
    }
  }

  verTodos(): void {
    this.entregadorSelecionadoId = null;
    this.mapa.setView([-23.56, -46.63], 13);
  }

  atualizarOuAdicionarEntregador(dados: any): void {
    const posicao = L.latLng(dados.lat, dados.lng);
    const index = this.entregadores.findIndex(e => e.id === dados.id);
    
    if (index > -1) {
      const entregador = this.entregadores[index];
      entregador.localizacao = posicao;
      entregador.status = dados.status;
      if (entregador.marcador) {
        entregador.marcador.setLatLng(posicao);
      }
      this.pontosPercorridos[dados.id].push(posicao);
      this.trechosPercorridos[dados.id].setLatLngs(this.pontosPercorridos[dados.id]);
    } else {
      this.entregadorService.buscar(dados.id).subscribe(entregadorDetalhado => {
        this.desenharRotaCompleta(entregadorDetalhado);
        const marker = L.marker(posicao, { icon: this.icones.entregador })
                        .addTo(this.mapa)
                        .bindPopup(dados.nome);
        const novoEntregador: Entregador = {
          id: dados.id,
          nome: dados.nome,
          status: dados.status,
          localizacao: posicao,
          marcador: marker
        };
        this.entregadores.push(novoEntregador);
        this.pontosPercorridos[dados.id] = [posicao];
        this.trechosPercorridos[dados.id] = L.polyline([posicao], { color: 'blue', weight: 5 }).addTo(this.mapa);
        this.entregadoresVisiveis = [...this.entregadores];
      });
    }
    this.filtrarEntregadores(this.filtrosAtuais);
  }

  carregarEntregadores(): void {
    this.entregadorService.listar().subscribe(entregadoresList => {
      entregadoresList.forEach(e => {
        this.desenharRotaCompleta(e);
        const localizacao = L.latLng(e.localizacaoAtual.latitude, e.localizacaoAtual.longitude);
        const marker = L.marker(localizacao, { icon: this.icones.entregador })
                        .addTo(this.mapa)
                        .bindPopup(e.nome);
        const entregador: Entregador = {
          id: e.id,
          nome: e.nome,
          status: e.status,
          localizacao,
          marcador: marker
        };
        this.entregadores.push(entregador);
        this.pontosPercorridos[e.id] = [localizacao];
        this.trechosPercorridos[e.id] = L.polyline([localizacao], { color: 'blue', weight: 5 }).addTo(this.mapa);
      });
      this.entregadoresVisiveis = [...this.entregadores];
    });
  }

  private desenharRotaCompleta(entregador: any): void {
    const inicio = L.latLng(entregador.pontoInicio.latitude, entregador.pontoInicio.longitude);
    const fim = L.latLng(entregador.pontoFim.latitude, entregador.pontoFim.longitude);
    const paradas = entregador.pontosParada.map((p: any) => L.latLng(p.latitude, p.longitude));
    const rota = [inicio, ...paradas, fim];
    L.polyline(rota, { color: 'gray', weight: 4, dashArray: '5,10' }).addTo(this.mapa);

    L.marker(inicio, { icon: this.icones.inicio })
      .addTo(this.mapa)
      .bindPopup(`Início: ${entregador.nome}`);

    paradas.forEach((parada: L.LatLngExpression, index: number) => {
      L.marker(parada, { icon: this.icones.parada })
        .addTo(this.mapa)
        .bindPopup(`Parada ${index + 1}: ${entregador.nome}`);
    });

    L.marker(fim, { icon: this.icones.fim })
      .addTo(this.mapa)
      .bindPopup(`Destino final: ${entregador.nome}`);
  }
}
