import { Node } from './Node';
import { Color } from './Color';

export class Link {

    color?: Color;
    merge = false;
    source: Node;
    target: Node;

    constructor(source: Node, target: Node) {
        this.source = source;
        this.target = target;
    }
}
