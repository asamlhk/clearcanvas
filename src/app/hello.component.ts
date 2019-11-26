import {
  Component,
  Input,
  ViewChild,
  OnInit,
  HostListener
} from "@angular/core";
import trimCanvas from "trim-canvas";

@Component({
  selector: "hello",
  template: `
    <br /><br /><br /><br />
    <canvas
      #sigPad
      width="300"
      height="150"
      (mousedown)="onMouseDown($event)"
      (mousemove)="onMouseMove($event)"
    ></canvas>
    <br />
    <button (click)="clear()">clear</button>
    <button (click)="save()">save</button>
    
    <br />
    <img *ngIf="img" [src]="img" id="img"/>
    <br />
    <span>{{ img }}</span>
  `,
  styles: [
    `
      canvas {
        border: 1px solid #000;
      }
      span {
        width: 300px;
      }
      #img {
        width: 100px;
        border: 1px;
        border-style: solid;
      }
    `
  ]
})
export class HelloComponent implements OnInit {
  @Input() name: string;
  @ViewChild("sigPad") sigPad;
  sigPadElement;
  context;
  isDrawing = false;
  img;

  ngOnInit() {
    this.sigPadElement = this.sigPad.nativeElement;
    this.context = this.sigPadElement.getContext("2d");
    this.context.strokeStyle = "#3742fa";
  }

  @HostListener("document:mouseup", ["$event"])
  onMouseUp(e) {
    this.isDrawing = false;
  }

  onMouseDown(e) {
    this.isDrawing = true;
    const coords = this.relativeCoords(e);
    this.context.moveTo(coords.x, coords.y);
  }

  onMouseMove(e) {
    if (this.isDrawing) {
      const coords = this.relativeCoords(e);
      this.context.lineTo(coords.x, coords.y);
      this.context.stroke();
    }
  }

  private relativeCoords(event) {
    const bounds = event.target.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    return { x: x, y: y };
  }

  trim() {
    const oldCanvas = this.sigPad.nativeElement;

    const newCanvas = document.createElement("canvas");
    const transformCanvas = document.createElement("canvas");
    const context = newCanvas.getContext("2d");

    //set dimensions
    newCanvas.width = this.sigPad.nativeElement.width;
    newCanvas.height = this.sigPad.nativeElement.height;

    //apply the old canvas to the new one
    context.drawImage(this.sigPad.nativeElement, 0, 0);

    trimCanvas(newCanvas);
    const ratio = Math.min(
      oldCanvas.height / newCanvas.height,
      oldCanvas.width / newCanvas.width
    );

    transformCanvas.getContext("2d").scale(ratio, ratio);
    transformCanvas.getContext("2d").drawImage(newCanvas, 0, 0);
    const w = (transformCanvas.width - newCanvas.width * ratio) / 2;
    const h = (transformCanvas.height - newCanvas.height * ratio) / 2;

    oldCanvas
      .getContext("2d")
      .clearRect(0, 0, oldCanvas.width, oldCanvas.height);
    oldCanvas.getContext("2d").drawImage(transformCanvas, w, h);
  }

  clear() {
    this.context.clearRect(
      0,
      0,
      this.sigPadElement.width,
      this.sigPadElement.height
    );
    this.context.beginPath();
  }

  save() {
    this.trim();
    this.img = this.sigPadElement.toDataURL("image/png");
    console.log(this.img);
    this.clear();
  }
}
