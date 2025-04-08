import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-filtros-mapa',
  templateUrl: './filtros-mapa.component.html',
  styleUrls: ['./filtros-mapa.component.sass']
})
export class FiltrosMapaComponent {
  statusSelecionado: string = 'todos';
  raioKm: number = 5;

  @Output() filtrosAlterados = new EventEmitter<{ status: string; raioKm: number }>();

  aplicarFiltros() {
    this.filtrosAlterados.emit({
      status: this.statusSelecionado,
      raioKm: this.raioKm
    });
  }
}
