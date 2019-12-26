import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThreatEnvPage } from './threat-env.page';

describe('ThreatEnvPage', () => {
  let component: ThreatEnvPage;
  let fixture: ComponentFixture<ThreatEnvPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThreatEnvPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThreatEnvPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
