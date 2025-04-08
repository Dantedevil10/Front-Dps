import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaEntregadoresComponent } from './mapa-entregadores.component';

describe('MapaEntregadoresComponent', () => {
  let component: MapaEntregadoresComponent;
  let fixture: ComponentFixture<MapaEntregadoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapaEntregadoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaEntregadoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
