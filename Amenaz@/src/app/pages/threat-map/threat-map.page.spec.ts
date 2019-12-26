import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThreatMapPage } from './threat-map.page';

describe('ThreatMapPage', () => {
  let component: ThreatMapPage;
  let fixture: ComponentFixture<ThreatMapPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThreatMapPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThreatMapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
