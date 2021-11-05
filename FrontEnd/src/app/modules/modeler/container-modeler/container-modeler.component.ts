import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation  } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import * as go from 'gojs';
import { DataSyncService, DiagramComponent, PaletteComponent } from 'gojs-angular';
import produce from "immer";
import { CookieService } from 'ngx-cookie-service';
import { DiagramLinkData } from 'src/app/models/diagram-link-data';
import { DiagramModelData } from 'src/app/models/diagram-model-data';
import { DiagramNodeData } from 'src/app/models/diagram-node-data';
import { ModelerWebSocketService } from '../modeler-web-socket.service';
@Component({
  selector: 'app-container-modeler',
  templateUrl: './container-modeler.component.html',
  styleUrls: ['./container-modeler.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})

export class ContainerModelerComponent implements OnInit {
  
  @ViewChild('myDiagram', { static: true }) public myDiagramComponent!: DiagramComponent;
  @ViewChild('myPalette', { static: true }) public myPaletteComponent!: PaletteComponent;
  @ViewChild('myContenedorPalette', { static: true }) public myContenedorPaletteComponent!: PaletteComponent;
  myDiagram:any;
  public nodeDataArray: Array<go.ObjectData> = new Array<go.ObjectData>();
  // Big object that holds app-level state data
  // As of gojs-angular 2.0, immutability is expected and required of state for ease of change detection.
  // Whenever updating state, immutability must be preserved. It is recommended to use immer for this, a small package that makes working with immutable data easy.
  public state = {
    diagramNodeData: new Array<go.ObjectData>(),
    diagramLinkData:  new Array<go.ObjectData>(),
    diagramModelData:  new DiagramModelData(),
    skipsDiagramUpdate: true,
    selectedNodeData: {key:'App'}, // used by InspectorComponent

    // Palette state props
    paletteNodeData: [
      { id:-1,
        key:"App",
        source:"./../../../../assets/img/application.png",
        width: 55, 
        height: 55,
        alignmentText: new go.Spot(0.5,1, 0, 20),
        positionText: new go.Point(0,100),
        zOrder:0,
      },
      { id:-2,
        key:"DataStore",
      source:"./../../../../assets/img/DataStore.png",
      width: 55, 
      height: 55,
      alignmentText: new go.Spot(0.5, 1, 0, 20),
      positionText: new go.Point(100,100),
      zOrder:0,
    },
    { id:-3,
      key:"Container",
    sourceMenu:"./../../../../assets/img/ContainerMini.png",
    source:"./../../../../assets/img/Container.png",
    width: 500,
    height: 500,
    isGroup: true,
    alignmentText: new go.Spot(1, 1),
    positionText: new go.Point(100,100),
      zOrder:0
      },
    { id:-4,
      key:"Container 2",
    sourceMenu:"./../../../../assets/img/ContainerMini2.png",
    source:"./../../../../assets/img/Container2.png",
    width: 500,
    height: 500,
    isGroup: true,
    alignmentText: new go.Spot(1, 1),
    positionText: new go.Point(100,100),
      zOrder:0
      },
    { id:-5,
      key:"User",
    sourceMenu:"./../../../../assets/img/User.png",
    source:"./../../../../assets/img/User.png",
    width: 55,
    height: 55,
    //isGroup: true,
    alignmentText: new go.Spot(1, 1),
    positionText: new go.Point(0,100),
      zOrder:0
      },
    ],
    paletteModelData: { prop: 'val' }


  };
  
  public diagramDivClassName: string = 'myDiagramDiv';
  public paletteDivClassName = 'myPaletteDiv';
  public contenedorPaletteDivClassName = 'myContenedorPaletteDiv';
  showJsonDiagram(){
    console.log(this.myDiagramComponent.diagram.model.toJson());
    console.log(this.state)
  }
  getJsonDiagram(){
    this.cookieService.set("diagramState",this.myDiagramComponent.diagram.model.toJson());
  }
  loadJsonDiagram(){
    this.myDiagramComponent.diagram.model = go.Model.fromJson(this.cookieService.get("diagramState"));
  }
  emitJsonDiagram(){
    this.webSocketService.emitEventJsonModeler(this.myDiagramComponent.diagram.model.toJson());
  }
  exportJsonDiagram(){
    //this.dataUri();
  }
  public updateModel(jsonDiagram:any){
    this.myDiagramComponent.diagram.model = go.Model.fromJson(jsonDiagram);
  }
  public jsonObj:Object = {};
  onFileLoad (event:any) {
    const f = event.target.files[0];
    const reader = new FileReader();
    let dia = this.myDiagram;
    var model;
  reader.readAsText(f, 'UTF-8');
  reader.onload = () => {
    //console.log(fileReader.result.toString());
    if(reader.result){
      this.jsonObj=(JSON.parse(reader.result.toString()));
      this.updateModel(this.jsonObj)
    }

  }
  }
  // initialize diagram / templates
   public get dataUri(): SafeUrl {
    
    const jsonData = this.myDiagramComponent?.diagram?.model?.toJson();
    const uri = 'data:application/json;charset=UTF-8,' + encodeURIComponent(jsonData);
    return this.sanitizer.bypassSecurityTrustUrl(uri);
  }
  public initDiagram(): go.Diagram {

    const $ = go.GraphObject.make;
    this.myDiagram = $(go.Diagram, {
      'undoManager.isEnabled': true,
      'clickCreatingTool.archetypeNodeData': { source:"./../../../../assets/img/application.png", key: 'new app', width: 55, height: 55, alignmentText: new go.Spot(0.5, 1,0, 20)},
      model: $(go.GraphLinksModel,
        {
          nodeKeyProperty: 'id',
          linkToPortIdProperty: 'toPort',
          linkFromPortIdProperty: 'fromPort',
          linkKeyProperty: 'key', // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
          linkDataArray: new Array<go.ObjectData>(),
          modelData: new DiagramModelData(),
          nodeDataArray: new Array<go.ObjectData>()
        }),
    }
    );

    const makePort = function(id: string, spot: go.Spot) {
      return $(go.Shape, 'Circle',
        {
          opacity: 0,
          fill: 'gray', strokeWidth: 0, desiredSize: new go.Size(8, 8),
          portId: id, alignment: spot,
          fromLinkable: true, toLinkable: true
        }
      );
    }
    this.myDiagram.commandHandler.archetypeGroupData = { key: 'Group', isGroup: true };
    
    var nodeMenu =  // context menu for each Node
    $("ContextMenu",
       $("ContextMenuButton",
         $(go.TextBlock, "Copiar"),
         { click: function(e, obj) { e.diagram.commandHandler.copySelection(); } }),
       $("ContextMenuButton",
         $(go.TextBlock, "Cortar"),
         { click: function(e, obj) { e.diagram.commandHandler.cutSelection(); } }),
       $("ContextMenuButton",
         $(go.TextBlock, "Pegar"),
         { click: function(e, obj) { e.diagram.commandHandler.pasteSelection(e.diagram.toolManager.contextMenuTool.mouseDownPoint);  } }),
       $("ContextMenuButton",
         $(go.TextBlock, "Eliminar"),
         { click: function(e, obj) { e.diagram.commandHandler.deleteSelection();  } }),
       $("ContextMenuButton",
         $(go.TextBlock, "Traer al frente"),
         { click: function(e, obj) {   changeZOrder(1, obj, e.diagram); } }),
       $("ContextMenuButton",
         $(go.TextBlock, "Llevar atras"),
         { click: function(e, obj) { changeZOrder(-1, obj, e.diagram); } }),
       $("ContextMenuButton",
         $(go.TextBlock, "Deshacer"),
         { click: function(e, obj) { e.diagram.commandHandler.undo(); } }),
       $("ContextMenuButton",
         $(go.TextBlock, "Rehacer"),
         { click: function(e, obj) { e.diagram.commandHandler.redo();  } }),
      );
    

     function changeZOrder(amt:any, obj:any, dia:any) {
        dia.commit(function(d:any) {
          var data = obj.part.data;
          if(data.zOrder){
            d.model.set(data, "zOrder", data.zOrder + amt);
          }else{
            d.model.set(data, "zOrder", amt);
          }

        }, 'modified zOrder');
      }
    // define the Node template
    this.myDiagram.nodeTemplate =
      $(go.Node, 'Spot',
        {contextMenu: nodeMenu},
        {selectionObjectName: "nodePicture",
         locationObjectName: "nodePicture"},
        {
          click: function(e, obj:any) { 
            obj.findPort("TopCenter").opacity = 1;
            obj.findPort("Left").opacity = 1;
            obj.findPort("Right").opacity = 1;
            obj.findPort("BottomCenter").opacity = 1;
            obj.findPort("TopRight").opacity = 1;
            obj.findPort("TopLeft").opacity = 1;
            obj.findPort("BottomLeft").opacity = 1;
            obj.findPort("BottomRight").opacity = 1;
           },
          selectionChanged: function(part:any) {
              var shape = part.elt(0);
              shape.fill = part.isSelected ? "red" : "white";
              part.findPort("TopCenter").opacity = 0;
              part.findPort("Left").opacity = 0;
              part.findPort("Right").opacity = 0;
              part.findPort("BottomCenter").opacity = 0;
              part.findPort("TopRight").opacity = 0;
              part.findPort("TopLeft").opacity = 0;
              part.findPort("BottomLeft").opacity = 0;
              part.findPort("BottomRight").opacity = 0;
            }
        },
        new go.Binding("zOrder"),
         
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
          $(go.Panel,  'Vertical',
            $(go.Picture, {name:"nodePicture", alignment: go.Spot.Center, imageStretch: go.GraphObject.Fill }, 
                new go.Binding("source", "source").makeTwoWay(),
                new go.Binding("width").makeTwoWay(),
                new go.Binding("height").makeTwoWay(),
                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)
            ), 
            $(go.TextBlock, 
              { margin: 8, editable: true },
                new go.Binding('text','key').makeTwoWay(),
            ),
          ),
        // Ports
        makePort('TopCenter', go.Spot.TopCenter),
        makePort('Left', go.Spot.Left),
        makePort('Right', go.Spot.Right),
        makePort('BottomCenter', go.Spot.BottomCenter),
        makePort('TopRight',go.Spot.TopRight),
        makePort('TopLeft', go.Spot.TopLeft),
        makePort('BottomLeft', go.Spot.BottomLeft),
        makePort('BottomRight', go.Spot.BottomRight),
      );
      this.myDiagram.linkTemplate =
      $(go.Link,
        { relinkableFrom: true, relinkableTo: true },
        $(go.Shape),
        $(go.Shape, { toArrow: "Standard" })
      );

      this.myDiagram.groupTemplate = 
      $(go.Group, "Vertical",
        { selectionObjectName: "containerPicture",
          locationObjectName: "containerPicture",
          resizable: true,
          resizeObjectName: "containerPicture",
          contextMenu:nodeMenu
        },
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
        new go.Binding("zOrder"),
          $(go.Panel, go.Panel.Spot,
            $(go.Picture, { name: "containerPicture", imageStretch: go.GraphObject.Fill }, 
                new go.Binding("source", "source").makeTwoWay(),
                 new go.Binding("width").makeTwoWay(),
                 new go.Binding("height").makeTwoWay(),
                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)
              ), 
                $(go.TextBlock, 
                  { margin: 8, editable: true, alignment: new go.Spot(0.5, 0.09) },
                    new go.Binding('text','key').makeTwoWay()
                ),
          )
        );
        this.myDiagram.contextMenu = nodeMenu;
    return this.myDiagram;
  }

  // When the diagram model changes, update app data to reflect those changes. Be sure to use immer's "produce" function to preserve immutability
  public diagramModelChange = (changes: go.IncrementalData) => {
    const appComp = this;
    this.state = produce(this.state, draft => {
      // set skipsDiagramUpdate: true since GoJS already has this update
      // this way, we don't log an unneeded transaction in the Diagram's undoManager history
      draft.skipsDiagramUpdate = true;
      

      draft.diagramNodeData = DataSyncService.syncNodeData(changes, draft.diagramNodeData, appComp.observedDiagram.model);
      draft.diagramLinkData = DataSyncService.syncLinkData(changes, draft.diagramLinkData, appComp.observedDiagram.model);
      draft.diagramModelData = DataSyncService.syncModelData(changes, draft.diagramModelData);
      //console.log(changes)
    });
    this.myDiagramComponent.diagram.model.mergeNodeDataArray(this.state.diagramNodeData);
  };

  // When the diagram model changes, update app data to reflect those changes. Be sure to use immer's "produce" function to preserve immutability
  public diagramJsonModelChange = (changes: string) => {
    // const appComp = this;
    // this.state = produce(this.state, draft => {
    //   // set skipsDiagramUpdate: true since GoJS already has this update
    //   // this way, we don't log an unneeded transaction in the Diagram's undoManager history
    //   draft.skipsDiagramUpdate = true;
    // });
    //this.myDiagramComponent.diagram.model.mergeNodeDataArray(this.state.diagramNodeData);
    //console.log(changes);
    this.myDiagramComponent.diagram.model.applyIncrementalJson(changes);
  };

  public initPalette(): go.Palette {
    const $ = go.GraphObject.make;
    const palette = $(go.Palette);
      palette.nodeTemplate =  
        $(go.Part, 'Vertical',
            $(go.Picture, { alignment: go.Spot.Center, width: 55, height: 55 , imageStretch: go.GraphObject.Fill },
              new go.Binding("source").makeTwoWay()
            ),
            $(go.TextBlock, { margin: 8, editable: true },
              new go.Binding('text','key').makeTwoWay(),
            )
      )      
      
        palette.groupTemplate = 
        $(go.Group, "Vertical",
          { selectionObjectName: "Picture",
            locationObjectName: "Picture",
            resizable: true,
            resizeObjectName: "Picture" },
          new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            $(go.Panel, go.Panel.Vertical,
              $(go.Picture, { name: "Picture", width: 55, height: 55 , imageStretch: go.GraphObject.Fill}, 
                  new go.Binding("source","sourceMenu").makeTwoWay(),
                  new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)
                ), 
                  $(go.TextBlock, 
                    { margin: 8, editable: true },
                      new go.Binding('text','key').makeTwoWay(),
                  ),
            )
          );
  
    palette.model = $(go.GraphLinksModel);
    return palette;
  }
  
  roomModeler: string = '';
  constructor(private cdr: ChangeDetectorRef,  private webSocketService: ModelerWebSocketService, private router: ActivatedRoute, private cookieService: CookieService, private sanitizer:DomSanitizer ) {

    //this.webSocketService.connect();
    this.webSocketService.callback.subscribe(res => {
      if(typeof(res) == "string"){

        this.loadDiagramJsonFromServer(res, false);
      }else{

        this.loadDiagramFromServer(res, false);
      }


    })
   }
   ngOnInit(): void {
    this.roomModeler = this.router.snapshot.paramMap.get('room') as string;
    this.cookieService.set('roomModeler', this.roomModeler);
  }

  private loadDiagramFromServer = (prevData: go.IncrementalData, emit: boolean = true) => {
    if(emit){
      this.webSocketService.emitEventModeler( prevData );
    }else{
      this.diagramModelChange(prevData);
    }
  }
  private loadDiagramJsonFromServer = (prevData: string, emit: boolean = true) => {
    if(emit){
      this.webSocketService.emitEventJsonModeler( prevData );
    }else{
      this.diagramJsonModelChange(prevData);
    }
  }

  // Overview Component testing
  public oDivClassName = 'myOverviewDiv';
  public initOverview(): go.Overview {
    const $ = go.GraphObject.make;
    const overview = $(go.Overview);
    return overview;
  }
  public observedDiagram:any = null;

  // currently selected node; for inspector
  public selectedNodeData: go.ObjectData | null= null;

  public ngAfterViewInit() {
    if (this.observedDiagram) return;
    this.observedDiagram = this.myDiagramComponent.diagram;
    this.cdr.detectChanges(); // IMPORTANT: without this, Angular will throw ExpressionChangedAfterItHasBeenCheckedError (dev mode only)

    this.myDiagramComponent.diagram.addModelChangedListener((evt)=>{
      if (!evt.isTransactionFinished) return;
      if(evt.model){
        if(evt.getValue(true) == "Linking" || evt.getValue(true) == "Relinking" ){
        var incrementalJson = evt.model.toIncrementalJson(evt);
        this.loadDiagramJsonFromServer(incrementalJson, true);
        }else{
          var incrementalData = evt.model.toIncrementalData(evt);
          this.loadDiagramFromServer(incrementalData, true);
        }
        
      
      }
})

// window.addEventListener('DOMContentLoaded', this.initDiagram);
} // end ngAfterViewInit


  /**
   * Update a node's data based on some change to an inspector row's input
   * @param changedPropAndVal An object with 2 entries: "prop" (the node data prop changed), and "newVal" (the value the user entered in the inspector <input>)
   */
  public handleInspectorChange(changedPropAndVal: { prop: any; newVal: any; }) {
    
  }

}
