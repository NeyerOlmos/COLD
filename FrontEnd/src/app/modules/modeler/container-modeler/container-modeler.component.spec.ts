import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerModelerComponent } from './container-modeler.component';

describe('ModelerComponent', () => {
  let component: ContainerModelerComponent;
  let fixture: ComponentFixture<ContainerModelerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContainerModelerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerModelerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
