import { ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as go from 'gojs';
import { DataSyncService, DiagramComponent, PaletteComponent } from 'gojs-angular';
import produce from "immer";
import { CookieService } from 'ngx-cookie-service';
import { DiagramLinkData } from 'src/app/models/diagram-link-data';
import { DiagramNodeData } from 'src/app/models/diagram-node-data';
import { ModelerWebSocketService } from './modeler-web-socket.service';
@Component({
  selector: 'app-modeler',
  templateUrl: './modeler.component.html',
  styleUrls: ['./modeler.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ModelerComponent implements OnInit {
  
  @ViewChild('myDiagram', { static: true }) public myDiagramComponent!: DiagramComponent;
  @ViewChild('myPalette', { static: true }) public myPaletteComponent!: PaletteComponent;
  @ViewChild('myContenedorPalette', { static: true }) public myContenedorPaletteComponent!: PaletteComponent;
  myDiagram:any;
  public nodeDataArray: Array<go.ObjectData> = new Array<go.ObjectData>();
  // Big object that holds app-level state data
  // As of gojs-angular 2.0, immutability is expected and required of state for ease of change detection.
  // Whenever updating state, immutability must be preserved. It is recommended to use immer for this, a small package that makes working with immutable data easy.
  public state = {
    diagramNodeData: [],
    diagramLinkData: [],
    diagramModelData: { prop: 'value' },
    skipsDiagramUpdate: false,
    selectedNodeData: {id:'',text:'',color:''}, // used by InspectorComponent

    // Palette state props
    paletteNodeData: [
      { key:"App",
        source:"./../../../../assets/img/application.png",
        width: 55, 
        height: 55,
        alignmentText: new go.Spot(0.5,1,0, 20),
        zOrder:0,
        // position: new go.Point(0,0)
      },
      { key:"DataStore",
      source:"./../../../../assets/img/DataStore.png",
      width: 55, 
      height: 55,
      alignmentText: new go.Spot(0.5, 1,0, 20),
      zOrder:0,
      // position: new go.Point(0,0)
      },
      { key:"Container",
      sourceMenu:"./../../../../assets/img/ContainerMini.png",
      source:"./../../../../assets/img/Container.png",
      width: 500,
      height: 500,
      isGroup: true,
      alignment: go.Spot.Center,
      alignmentText: new go.Spot(0.5, 0.09),
      zOrder:0
      },
    ],
    paletteModelData: { prop: 'val' }


  };
  
  public diagramDivClassName: string = 'myDiagramDiv';
  public paletteDivClassName = 'myPaletteDiv';
  public contenedorPaletteDivClassName = 'myContenedorPaletteDiv';
  getJsonDiagram(){
    this.cookieService.set("diagramState",this.myDiagramComponent.diagram.model.toJson());
    //console.log(this.myDiagramComponent.diagram.model.toJson())
  }
  loadJsonDiagram(){
   // console.log(this.cookieService.get("diagramState"))
    this.myDiagramComponent.diagram.model = go.Model.fromJson(this.cookieService.get("diagramState"));
  }
  emitJsonDiagram(){
    this.webSocketService.emit("eventModeler",this.cookieService.get("diagramState"));
  }
  // initialize diagram / templates
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
          linkKeyProperty: 'key' // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
        }
      )
    });

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
    var diagramMenu =  // context menu for each Node
    $("ContextMenu",
    $("ContextMenuButton",
         $(go.TextBlock, "Pegar"),
         { click: function(e, obj) { e.diagram.commandHandler.pasteSelection(e.diagram.toolManager.contextMenuTool.mouseDownPoint);  } }),
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
    //dia.contextMenu = myContextMenu;
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
            //console.log(obj.ports)
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
        // new go.Binding("loc","position"),
          $(go.Panel,  'Spot',
            $(go.Picture, {name:"nodePicture", alignment: go.Spot.Center, imageStretch: go.GraphObject.Fill }, 
                new go.Binding("source", "source").makeTwoWay(),
                new go.Binding("width").makeTwoWay(),
                new go.Binding("height").makeTwoWay(),
                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)
            ), 
            $(go.TextBlock, 
              { margin: 8, editable: true },
                new go.Binding('text','key').makeTwoWay(),
                new go.Binding('alignment','alignmentText').makeTwoWay()
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
          $(go.Panel,  'Spot',
            $(go.Picture, { name: "containerPicture", alignment: go.Spot.Center, imageStretch: go.GraphObject.Fill }, 
                new go.Binding("source", "source").makeTwoWay(),
                 new go.Binding("width").makeTwoWay(),
                 new go.Binding("height").makeTwoWay(),
                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)
              ), 
                $(go.TextBlock, 
                  { margin: 8, editable: true },
                    new go.Binding('text','key').makeTwoWay(),
                    new go.Binding('alignment','alignmentText').makeTwoWay()
                ),
          )
        );

        this.myDiagram.contextMenu = diagramMenu;
    return this.myDiagram;
  }

  // When the diagram model changes, update app data to reflect those changes. Be sure to use immer's "produce" function to preserve immutability
  public diagramModelChange = (changes: go.IncrementalData) => {
    const appComp = this;
    this.state = produce(this.state, draft => {
      // set skipsDiagramUpdate: true since GoJS already has this update
      // this way, we don't log an unneeded transaction in the Diagram's undoManager history
      draft.skipsDiagramUpdate = true;
      // DataSyncService.syncNodeData(changes, draft.diagramNodeData, appComp.observedDiagram.model).every(objectData =>{
      //   // draft.diagramNodeData.push(objectData);
      //   console.log(objectData);
      //   //console.log(this.state)
      // });
      
      //console.log(draft.diagramNodeData);
      // draft.diagramLinkData = DataSyncService.syncLinkData(changes, draft.diagramLinkData, appComp.observedDiagram.model);
      // draft.diagramModelData = DataSyncService.syncModelData(changes, draft.diagramModelData);
      
      
      
      // draft.diagramNodeData = DataSyncService.syncNodeData(changes, draft.diagramNodeData, appComp.observedDiagram.model);
      // draft.diagramLinkData = DataSyncService.syncLinkData(changes, draft.diagramLinkData, appComp.observedDiagram.model);
      // draft.diagramModelData = DataSyncService.syncModelData(changes, draft.diagramModelData);
    });
  };

  public initPalette(): go.Palette {
    const $ = go.GraphObject.make;
    const palette = $(go.Palette);
      palette.nodeTemplate =  
        $(go.Part, 'Vertical',
        //{contextMenu:myContextMenu}
            $(go.Picture, { alignment: go.Spot.Center, width: 55, height: 55 , imageStretch: go.GraphObject.Fill },
              new go.Binding("source").makeTwoWay()
            ),
            $(go.TextBlock, { margin: 8, editable: true },
              new go.Binding('text','key').makeTwoWay(),
              new go.Binding('position','positionText').makeTwoWay()
            )
      )      
      
        palette.groupTemplate = 
        $(go.Group, "Vertical",
          { selectionObjectName: "Picture",
            locationObjectName: "Picture",
            resizable: true,
            resizeObjectName: "Picture" },
          new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            $(go.Panel,  'Spot',
              $(go.Picture, { name: "Picture", width: 55, height: 55 , imageStretch: go.GraphObject.Fill}, 
                  new go.Binding("source","sourceMenu").makeTwoWay(),
                  // new go.Binding("width").makeTwoWay(),
                  // new go.Binding("height").makeTwoWay(),
                  new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)
                ), 
                  $(go.TextBlock, 
                    { margin: 8, editable: true },
                      new go.Binding('text','key').makeTwoWay(),
                      new go.Binding('alignment','alignmentText').makeTwoWay()
                  ),
            )
          );
  
    palette.model = $(go.GraphLinksModel);
    return palette;
  }
  
  roomModeler: string = '';
  constructor(private cdr: ChangeDetectorRef,  private webSocketService: ModelerWebSocketService, private router: ActivatedRoute, private cookieService: CookieService ) {

    this.webSocketService.connect();
    this.webSocketService.callback.subscribe(res=>{
      //console.log(res);
      //this.writeSingle(prevPos,false);
      this.loadDiagramFromServer(res, false)
    })
   }
   ngOnInit(): void {
    this.roomModeler = this.router.snapshot.paramMap.get('room') as string;

    //console.log(this.roomModeler)
    this.cookieService.set('roomModeler', this.roomModeler);
  }

  private loadDiagramFromServer = (prevData: any, emit: boolean = true) => {
    if(emit){
      this.webSocketService.emitEventModeler({ prevData } );
    }else{
      this.myDiagramComponent.diagram.model = go.Model.fromJson(prevData);
      //this.myDiagramComponent.diagram.isModified = false;
      // this.myDiagramComponent.diagram.model.
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

    const appComp: ModelerComponent = this;
    // listener for inspector
    this.myDiagramComponent.diagram.addDiagramListener('ChangedSelection', (e) => {
      if (e.diagram.selection.count === 0) {
        appComp.selectedNodeData = null;
      }
      const node = e.diagram.selection.first();
      appComp.state = produce(appComp.state, draft => {
        // console.log(draft.diagramNodeData.length);
        // console.log(draft.diagramLinkData.length);
        // console.log(draft.diagramModelData.prop);
        // if (node instanceof go.Node) {
        //   console.log(draft.diagramNodeData);
        //   console.log(node);
        //   // var idx = draft.diagramNodeData.findIndex(nd => nd.id == node.data.id);
        //   // var nd = draft.diagramNodeData[idx];
        //   // draft.selectedNodeData = nd;
        // } else {
        //   draft.selectedNodeData = {id:'',text:'',color:''};
        // }
      });
    });

    // listener for modified
// this.myDiagramComponent.diagram.addDiagramListener('SelectionMoved', (e) =>{
//   console.log(e);
// });
// this.myDiagramComponent.diagram.addChangedListener((e) =>{
//   //console.log(e.diagram?.model.toIncrementalJson(e))
//   //if (e.modelChange !== "nodeDataArray") return;
//  // console.log(e.propertyName);
//   // if(e.propertyName == "data"){
//     //console.log(e.getValue(false))
//     // console.log(e.diagram.)
//     //console.log({old:e.oldValue});
//     //console.log({new:e.newValue});
  
//   //  if(e.propertyName == "location"){
//   //    console.log(e.getValue(false))
//   //  }
//   //  if(e.propertyName == "position"){
//   //    console.log(e.getValue(false))
//   //  }
// });
this.myDiagramComponent.diagram.addModelChangedListener((evt)=>{
  
  if (!evt.isTransactionFinished) return;
  if(evt.model){
    var json = evt.model.toJson();
    //console.log(json)
    //this.webSocketService.emit("eventModeler",json);
  }
  // if (!evt.isTransactionFinished) return;
  // var txn = evt.object;  // a Transaction
  // if (txn === null) return;
  // // ignore unimportant Transaction events
  // if (!evt.isTransactionFinished) return;
  // var txn = evt.object;  // a Transaction
  // if (txn === null) return;
  // // iterate over all of the actual ChangedEvents of the Transaction
  // txn.changes.each(function(e:any) {
  //   // record node insertions and removals
  //   if (e.change === go.ChangedEvent.Property) {
  //     if (e.modelChange === "linkFromKey") {
  //       console.log(evt.propertyName + " changed From key of link: " +
  //                   e.object + " from: " + e.oldValue + " to: " + e.newValue);
  //     } else if (e.modelChange === "linkToKey") {
  //       console.log(evt.propertyName + " changed To key of link: " +
  //                   e.object + " from: " + e.oldValue + " to: " + e.newValue);
  //     }
  //   } else if (e.change === go.ChangedEvent.Insert && e.modelChange === "linkDataArray") {
  //     console.log(evt.propertyName + " added link: " + e.newValue);
  //   } else if (e.change === go.ChangedEvent.Remove && e.modelChange === "linkDataArray") {
  //     console.log(evt.propertyName + " removed link: " + e.oldValue);
  //   }
  // });
  
})

// window.addEventListener('DOMContentLoaded', this.initDiagram);
} // end ngAfterViewInit


  /**
   * Update a node's data based on some change to an inspector row's input
   * @param changedPropAndVal An object with 2 entries: "prop" (the node data prop changed), and "newVal" (the value the user entered in the inspector <input>)
   */
  public handleInspectorChange(changedPropAndVal: { prop: any; newVal: any; }) {
    // console.log(changedPropAndVal.prop);
    // console.log(changedPropAndVal.newVal);








    // const path = changedPropAndVal.prop;
    // const value = changedPropAndVal.newVal;

    // this.state = produce(this.state, draft => {
    //   var data = draft.selectedNodeData;
    //   data[path] = value;
    //   const key = data.id;
    //   const idx = draft.diagramNodeData.findIndex(nd => nd.id == key);
    //   if (idx >= 0) {
    //     draft.diagramNodeData[idx] = data;
    //     draft.skipsDiagramUpdate = false; // we need to sync GoJS data with this new app state, so do not skips Diagram update
    //   }
    // });
  }

}
