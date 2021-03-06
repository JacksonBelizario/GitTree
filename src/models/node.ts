import { ICommit } from "../Support/Interfaces";
import { Color } from "./Color";

export class Node {
  static height = 27;

  commit?: ICommit;
  x: number = 0;
  y: number = 0;
  color?: Color;
  secondColor?: Color;
  id: string;
  processed = false;
  x_order = 0;

  constructor(id: string) {
    this.id = id;
  }

  setVertice(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
