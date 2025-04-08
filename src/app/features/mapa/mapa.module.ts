import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapaEntregadoresComponent } from './components/mapa-entregadores/mapa-entregadores.component';
import { FiltrosMapaComponent } from './components/filtros-mapa/filtros-mapa.component';
import { FormsModule } from '@angular/forms';





@NgModule({
  declarations: [
    MapaEntregadoresComponent,
    FiltrosMapaComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
  ],
  exports: [MapaEntregadoresComponent]
})
export class MapaModule { }
