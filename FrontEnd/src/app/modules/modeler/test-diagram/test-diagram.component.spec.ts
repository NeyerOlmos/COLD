import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestDiagramComponent } from './test-diagram.component';

describe('TestDiagramComponent', () => {
  let component: TestDiagramComponent;
  let fixture: ComponentFixture<TestDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestDiagramComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
