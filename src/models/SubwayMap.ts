import { Node } from "./Node";
import { Link } from "./Link";

export interface IGraph {
  nodes: Node[];
  links: Link[];
  nodeDict: any;
}

export class SubwayMap {
  public nodes: Node[] = [];
  public links: Link[] = [];
  public nodeDict: any;
  public width = 0;
  constructor(nodes: Node[], nodeDict: any) {
    this.nodes = nodes;
    this.nodeDict = nodeDict;
  }

  updateCommitStatus(commit: string, status: string) {
    if (this.nodeDict[commit]) {
      this.nodeDict[commit].commit.ci = status;
    }
  }
}
