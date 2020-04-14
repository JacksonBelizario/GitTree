import { ICommit } from "../utils/interfaces";
import { Color } from "./color";

export class Node {

    static height = 26;

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
