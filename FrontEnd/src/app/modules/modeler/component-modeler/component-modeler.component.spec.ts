import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentModelerComponent } from './component-modeler.component';

describe('ModelerComponent', () => {
  let component: ComponentModelerComponent;
  let fixture: ComponentFixture<ComponentModelerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponentModelerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentModelerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
