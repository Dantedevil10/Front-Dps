import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltrosMapaComponent } from './filtros-mapa.component';

describe('FiltrosMapaComponent', () => {
  let component: FiltrosMapaComponent;
  let fixture: ComponentFixture<FiltrosMapaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FiltrosMapaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltrosMapaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
