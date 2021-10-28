import { Component, EventEmitter, Input, Output } from '@angular/core';
//import * as go from 'gojs';

@Component({
  selector: 'app-inspector',
  templateUrl: './inspector.component.html',
  styleUrls: ['./inspector.component.scss']
})
export class InspectorComponent  {

  @Input()
  public nodeData: go.ObjectData;

  @Output()
  public onInspectorChange: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
    this.nodeData = {key:'',value:''};
   }

  public onInputChange(propAndValObj: any) {
    this.onInspectorChange.emit(propAndValObj);
  }
}
