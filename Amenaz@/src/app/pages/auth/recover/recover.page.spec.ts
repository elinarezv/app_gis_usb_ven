import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RecoverPage } from './recover.page';

describe('RecoverPage', () => {
  let component: RecoverPage;
  let fixture: ComponentFixture<RecoverPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecoverPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RecoverPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
