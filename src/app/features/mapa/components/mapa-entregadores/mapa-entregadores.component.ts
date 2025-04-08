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

  private iconeInicio = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3177/3177361.png', // ícone de bandeira ou casa
    iconSize: [28, 28],
    iconAnchor: [14, 28]
  });
  
  private iconeParada = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/252/252025.png', // ponto intermediário
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  });
  
  private iconeFim = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1912/1912207.png', // ícone de chegada, ex: bandeira de chegada
    iconSize: [40, 40],
    iconAnchor: [14, 28]
  });
  

  entregadoresVisiveis: Entregador[] = [];

  entregadorSelecionadoId: string | null = null;

  private entregadoresMock: Entregador[] = [];

  private mapa!: L.Map;

  // private marcadorEntregador!: L.Marker;
  // private trechoPercorrido: L.Polyline | null = null;

  // private pontosPercorridos: L.LatLng[] = [];

  private trechosPercorridos: { [id: string]: L.Polyline } = {};
  private pontosPercorridosMap: { [id: string]: L.LatLng[] } = {};

  filtrosAtuais: { status: string; raioKm: number } = { status: 'todos', raioKm: 50 };


  constructor(
    private socketService: SocketService,
    private entregadorService: EntregadorService
  ) {}

  ngOnInit(): void {
    this.inicializarMapa();
    this.carregarEntregadores();
    
    this.socketService.escutarLocalizacaoAtualizada().subscribe((dados: any) => {
      this.atualizarOuAdicionarEntregador(dados);
    });
  }

  inicializarMapa(): void {
    this.mapa = L.map('mapa').setView([-23.56, -46.63], 13); // centro inicial

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.mapa);
    
    // Render inicial sem filtro (todos)
    this.filtrarEntregadores({ status: 'todos', raioKm: 50 });
  }

  //Filtro Opcional com base em status e Raio(Km)
  filtrarEntregadores(filtros: { status: string; raioKm: number }) {
    console.log('Filtros recebidos:', filtros);
  
    this.filtrosAtuais = filtros; // <-- salvar os filtros

    const pontoCentral = L.latLng(-23.56, -46.63);
    const raioEmMetros = filtros.raioKm * 1000;
  
    const filtrados = this.entregadoresMock.filter(ent => {
      const dentroRaio = ent.localizacao.distanceTo(pontoCentral) <= raioEmMetros;
      const statusOk = filtros.status === 'todos' || ent.status === filtros.status;
      return dentroRaio && statusOk;
    });
  
    this.entregadoresVisiveis.forEach(e => {
      if (e.marcador) this.mapa.removeLayer(e.marcador);
    });
  
    this.entregadoresVisiveis = filtrados;
  
    this.entregadoresVisiveis.forEach(ent => {
      if (ent.marcador) ent.marcador.addTo(this.mapa);
    });
    
  }

  focarEntregador(entregador: Entregador) {
    this.entregadorSelecionadoId = entregador.id;

    this.mapa.flyTo(entregador.localizacao, 16, {
      animate: true,
      duration: 1
    });
  
    if (entregador.marcador) {
      entregador.marcador.openPopup();
    }
  }
  verTodos() {
    this.entregadorSelecionadoId = null;
    this.mapa.setView([-23.56, -46.63], 13);
  }
  
  atualizarOuAdicionarEntregador(dados: any) {
    const entregador = this.entregadoresMock.find(e => e.id === dados.id);
    const novaPos = L.latLng(dados.lat, dados.lng);

    if (entregador) {
      entregador.localizacao = novaPos;
      entregador.status = dados.status;

      if (entregador.marcador) {
        entregador.marcador.setLatLng(novaPos);
      }

      // Adiciona novo ponto e atualiza a linha azul
      this.pontosPercorridosMap[dados.id].push(novaPos);
      const linha = this.trechosPercorridos[dados.id];
      linha.setLatLngs(this.pontosPercorridosMap[dados.id]);

    } else {
      this.entregadorService.buscar(dados.id).subscribe((entregadorDetalhado: any) => {
        this.desenharRotaCompleta(entregadorDetalhado);
      
        const marker = L.marker(novaPos, {
          icon: L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/16422/16422519.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32]
          })
        }).addTo(this.mapa).bindPopup(dados.nome);
      
        const novoEntregador: Entregador = {
          id: dados.id,
          nome: dados.nome,
          status: dados.status,
          localizacao: novaPos,
          marcador: marker
        };
      
        this.entregadoresMock.push(novoEntregador);
        this.pontosPercorridosMap[dados.id] = [novaPos];
        this.trechosPercorridos[dados.id] = L.polyline([novaPos], {
          color: 'blue',
          weight: 5
        }).addTo(this.mapa);
      
        this.entregadoresVisiveis = [...this.entregadoresMock];
      });
    }

    // this.entregadoresVisiveis = [...this.entregadoresMock];
    this.filtrarEntregadores(this.filtrosAtuais);
  }

  carregarEntregadores(): void {
    this.entregadorService.listar().subscribe(entregadores => {
      entregadores.forEach(e => {
        
        this.desenharRotaCompleta(e);
    
        const localizacao = L.latLng(e.localizacaoAtual.latitude, e.localizacaoAtual.longitude);
    
        const marker = L.marker(localizacao, {
          icon: L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/16422/16422519.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32]
          })
        }).addTo(this.mapa).bindPopup(e.nome);
    
        this.entregadoresMock.push({
          id: e.id,
          nome: e.nome,
          status: e.status,
          localizacao,
          marcador: marker
        });
    
        // Inicializa o trajeto percorrido para esse entregador
        this.pontosPercorridosMap[e.id] = [localizacao];
        this.trechosPercorridos[e.id] = L.polyline([localizacao], {
          color: 'blue',
          weight: 5
        }).addTo(this.mapa);
      });
    
      this.entregadoresVisiveis = [...this.entregadoresMock];
    });
    

  }

  private desenharRotaCompleta(entregador: any): void {
    const inicio = L.latLng(entregador.pontoInicio.latitude, entregador.pontoInicio.longitude);
    const fim = L.latLng(entregador.pontoFim.latitude, entregador.pontoFim.longitude);
    const paradas = entregador.pontosParada.map((p: any) => L.latLng(p.latitude, p.longitude));
  
    // Adiciona linha cinza da rota
    const rota = [inicio, ...paradas, fim];
    L.polyline(rota, {
      color: 'gray',
      weight: 4,
      dashArray: '5,10'
    }).addTo(this.mapa);
  
    // Marcador de início
    L.marker(inicio, { icon: this.iconeInicio })
      .addTo(this.mapa)
      .bindPopup(`Início: ${entregador.nome}`);
  
    // Marcadores de parada
    paradas.forEach((parada: L.LatLngExpression, index: number) => {
      L.marker(parada, { icon: this.iconeParada })
        .addTo(this.mapa)
        .bindPopup(`Parada ${index + 1}: ${entregador.nome}`);
    });
  
    // Marcador de fim
    L.marker(fim, { icon: this.iconeFim })
      .addTo(this.mapa)
      .bindPopup(`Destino final: ${entregador.nome}`);
  }
  
  
  
}
