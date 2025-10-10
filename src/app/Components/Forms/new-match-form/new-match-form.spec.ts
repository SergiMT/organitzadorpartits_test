import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { EquipsService } from '../../../Core/Services/equips.service';
import { NewMatchForm } from './new-match-form';

class EquipsServiceStub {
  getEquips() {
    return of([]);
  }
}

describe('NewMatchForm', () => {
  let component: NewMatchForm;
  let fixture: ComponentFixture<NewMatchForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewMatchForm],
      providers: [{ provide: EquipsService, useClass: EquipsServiceStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(NewMatchForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
