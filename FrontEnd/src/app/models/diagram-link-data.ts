export class DiagramLinkData  {
    Key:string;
    From:string;
    To:string;
    FromPort:string;
    ToPort:string;
    constructor(key: string, from:string, to:string, fromPort:string, toPort:string){
        this.Key = key;
        this.From = from;
        this.To = to;
        this.FromPort = fromPort;
        this.ToPort = toPort;
    }
}
