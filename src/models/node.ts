import { ICommit } from "../utils/interfaces";
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
}
