import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyaccountPage } from './myaccount.page';

describe('MyaccountPage', () => {
  let component: MyaccountPage;
  let fixture: ComponentFixture<MyaccountPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyaccountPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MyaccountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
