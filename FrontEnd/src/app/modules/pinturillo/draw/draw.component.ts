import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { SocketWebService } from '../socket-web.service';

@Component({
  selector: 'app-draw',
  templateUrl: './draw.component.html',
  styleUrls: ['./draw.component.scss']
})
export class DrawComponent implements OnInit, AfterViewInit {

  @ViewChild('canvasRef', {static:false}) canvasRef:any;
  public width = 800;
  public height = 800;

  isAvailable:boolean = false;
  private cx: CanvasRenderingContext2D | null ;

  private points: Array<any> = [];

  @HostListener('document:mousedown',['$event'])
  onMouseDown = (e:any)=>{
    if(e.target.id === 'canvasId' ){
     this.isAvailable = true;
    }
  }
  @HostListener('document:mousemove',['$event'])
  onMouseMove = (e:any)=>{
    if(e.target.id === 'canvasId' && this.isAvailable ){
       this.paint(e);
    }
  }
  @HostListener('document:mouseup',['$event'])
  onMouseUp = (e:any)=>{
    if(e.target.id === 'canvasId' ){
      this.isAvailable = false;
    }
  }

  private paint(e:any){
    this.write(e);
  }
  constructor( private socketService:SocketWebService) { 
    this.socketService.connect();

    this.socketService.callback.subscribe(res=>{
      const {prevPos} = res;
      this.writeSingle(prevPos,false);
    })
    this.cx = null;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit():void {
    this.render();
  }

  private render(): any{
    const canvasEl = this.canvasRef.nativeElement;
    this.cx = canvasEl.getContext('2d');
    canvasEl.width = this.width;
    canvasEl.height = this.height;
    if(this.cx){
      this.cx.lineWidth = 3;
      this.cx.lineCap = 'round';
      this.cx.strokeStyle = '#000';
    }
  }

  private write(res:any):any{
    const canvasEl:any = this.canvasRef.nativeElement;
    const rect = canvasEl.getBoundingClientRect();
    const prevPos = {
      x: res.clientX - rect.left,
      y: res.clientY - rect.top
    };
    this.writeSingle(prevPos);
  }

  private writeSingle = (prevPos: any, emit: boolean = true)=>{
    this.points.push(prevPos);
    if(this.points.length > 3){
      const prevPos = this.points[this.points.length - 1]
      const currentPos = this.points[this.points.length - 2]

      this.drawOnCanvas(prevPos,currentPos);
      if(emit){
        this.socketService.emitEvent({ prevPos } );
      }

    }
  }


    private drawOnCanvas(prevPos:any, currentPos:any){
        if(!this.cx){
          return;
        }

        this.cx.beginPath();
        if(prevPos){
          this.cx.moveTo(prevPos.x,prevPos.y);
          this.cx.lineTo(currentPos.x,currentPos.y);
          this.cx.stroke();
        }
    }

    public clearZone(){
      this.points = [];
      this.cx?.clearRect(0, 0, this.width, this.height);
    }
}
