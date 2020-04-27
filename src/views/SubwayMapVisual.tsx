import React, { useState } from "react";
import { ICommit } from "../utils/interfaces";
import { Node } from "../models/Node";
import { Link } from "../models/Link";
import { Color, colors } from "../models/Color";
import { SubwayMap, IGraph } from "../models/SubwayMap";
import NodeVisual from "./NodeVisual";
import LinkVisual from "./LinkVisual";

import { connect } from "redux-zero/react";
import { BoundActions } from "redux-zero/types/Actions";
import actions from "../store/actions";
import { IStore } from "../store/store";

import '../assets/scss/subway-map-visual.scss';

interface ISubwayMapVisual {
  commits: ICommit[];
}

interface StoreProps {
  graph: IGraph | null;
}

const mapToProps = (state: IStore): StoreProps => ({ graph: state.graph });

type SubwayMapVisualProps = ISubwayMapVisual &
  StoreProps &
  BoundActions<IStore, typeof actions>;

interface BranchLine {
  nodes: Node[];
  open: boolean;
}

const SubwayMapVisual = (props: SubwayMapVisualProps) => {
  const { commits, graph, setGraph } = props;
  React.useEffect(() => {
    setGraph(null);
    getSubwayMap(commits);
  }, [commits]);

  const [height, setHeight] = useState("100%");
  const [width, setWidth] = useState("500px");

  const getSubwayMap = (commits: ICommit[]) => {
    let _start = 25;
    let _infinityY = Node.height * (commits.length + 1);
    let nodeDict: object | any = {};
    let nodes: [] = [];
    let links: [] = [];
    commits.forEach((c, i) => {
      let node = new Node(c.sha);
      // Y offset, just increment;
      node.y = _start;
      // X is tricky, do it later
      node.x = _start;
      node.commit = c;
      node.color = Color.parseHex(colors[0]);
      node.secondColor = Color.parseHex(colors[0]);
      //@ts-ignore
      nodes.push(node);
      nodeDict[node.commit.sha] = node;
    });
    // edge creation
    commits.forEach((c) => {
      if (c.parents.length === 0) {
        let infinityNode = new Node("infty-" + c.sha);
        infinityNode.x = nodeDict[c.sha].x;
        infinityNode.y = _infinityY;
        let newLink = new Link(nodeDict[c.sha], infinityNode);
        newLink.color = nodeDict[c.sha].color;
        //@ts-ignore
        links.push(newLink);
      } else {
        c.parents.forEach((p) => {
          if (nodeDict[p]) {
            let newLink = new Link(nodeDict[c.sha], nodeDict[p]);
            if (c.parents.length > 1) {
              newLink.color = nodeDict[p].color;
              nodeDict[c.sha].secondColor = nodeDict[p].color;
              newLink.merge = true;
            } else {
              newLink.color = nodeDict[c.sha].color;
              newLink.merge = false;
            }
            //@ts-ignore
            links.push(newLink);
          }
        });
      }
    });
    let currentMap = new SubwayMap(nodes, links, nodeDict);
    currentMap = updateMapLayout(currentMap);
    setGraph(currentMap);
    _updateHeight();
  };

  const updateMapLayout = (map: SubwayMap) => {
    let _start = 25;
    let _offset = Node.height;
    let nodes = map.nodes;
    let nodeDict = map.nodeDict;
    // New x algorithm, branch lines, closed and open concept
    // let's see, start from top, start a "branch line" and add that commit, mark as open
    // a merge commit comes in, add one parent in it's line, add another to "new branch", mark open
    // a commit is removed from nodeDict if processed
    // any new commits, add to a existing branch if "it's sha is any of existing's parent", if all fail, put it in new branch line
    // a branch line can only close if "a commit with only 1 parent and that parent is already in a branch" comes in
    let branchLines: BranchLine[] = [];
    function placeNodeInNewOrClosed(node: Node): BranchLine {
      let addedToBl = null;
      branchLines.forEach((bl) => {
        if (!node.processed) {
          // now a bl can be closed if all the commits in there is after this node
          // let allAfter = bl.nodes.every(bln => nodes.indexOf(bln) > nodes.indexOf(node));
          // check if any parent is above this node but that node is after this node
          // let's see if this works better
          // let parentAbove = bl.nodes.find(bln => {
          //   if (!bln.commit.parents.length) {
          //     return false;
          //   } else {
          //     return (!bln.commit.parents.every(parent => nodes.indexOf(nodeDict[parent]) > nodes.indexOf(node)) && nodes.indexOf(bln) > nodes.indexOf(node));
          //   }
          // });
          //@ts-ignore
          let lastCross = !bl.nodes[bl.nodes.length - 1].commit.parents.every(
            (parent) => {
              return nodes.indexOf(nodeDict[parent]) > nodes.indexOf(node);
            }
          );
          if (lastCross) {
            // bl.open = false;
          }

          if (!bl.open) {
            addedToBl = bl;
            bl.nodes.push(node);
            bl.open = true;
            node.processed = true;
          }
        }
      });
      if (!addedToBl) {
        // still can't add, create a new branch
        branchLines.push({ nodes: [node], open: true });
        addedToBl = branchLines[branchLines.length - 1];
        node.processed = true;
      }
      return addedToBl;
    }
    function placeNodeInExisting(node: Node): BranchLine | null {
      let addedToBl = null;
      branchLines.forEach((bl) => {
        if (!node.processed) {
          //@ts-ignore
          if (
            bl.nodes[bl.nodes.length - 1].commit.parents[0] === node.commit.sha
          ) {
            // else if a bl's last node is it's parent
            // it's impossible for anything other than the last one to be the parent
            // because that whould have been a merge which is processed in special case
            addedToBl = bl;
            bl.nodes.push(node);
            node.processed = true;
          }
        }
      });
      return addedToBl;
    }
    function processParents(n: Node, bl: BranchLine) {
      // special case for it's parents, always put the first with itself
      //@ts-ignore
      let parent0 = nodeDict[n.commit.parents[0]];
      let processGrandparent0 = false;
      if (parent0 && !parent0.processed) {
        bl.nodes.push(parent0);
        //@ts-ignore
        if (nodeDict[n.commit.parents[0]].commit.parents.length > 1) {
          processGrandparent0 = true;
        }
        //@ts-ignore
        nodeDict[n.commit.parents[0]].processed = true;
      }
      // if there's a second parent, try to place that too
      //@ts-ignore
      let parent1 = nodeDict[n.commit.parents[1]];
      let newbl;
      let processGrandparent = false;
      if (parent1 && !parent1.processed) {
        if (!placeNodeInExisting(parent1)) {
          if (parent1.commit.parents.length > 1) {
            processGrandparent = true;
          }
          newbl = placeNodeInNewOrClosed(parent1);
        }
      }
      if (processGrandparent0) {
        //@ts-ignore
        processParents(nodeDict[n.commit.parents[0]], bl);
      }
      if (processGrandparent) {
        //@ts-ignore
        processParents(parent1, newbl);
      }
    }
    nodes.forEach((n, i) => {
      n.y = _start + i * _offset;
      //@ts-ignore
      let currentSha = n.commit.sha;
      // if this node is unprocessed
      if (!n.processed) {
        let addedToBl = null;
        // see if I can add to an existing branch
        addedToBl = placeNodeInExisting(n);
        if (!addedToBl) {
          addedToBl = placeNodeInNewOrClosed(n); // this method must return a bl
        }
        processParents(n, addedToBl);
      }
      // check for closed branch line, make it available for adding
      //@ts-ignore
      branchLines.forEach((bl) => {
        //@ts-ignore
        if (
          bl.nodes[bl.nodes.length - 1].commit.parents.indexOf(currentSha) !==
          -1
        ) {
          bl.open = false;
        }
      });
    });
    // process all branch lines
    branchLines.forEach((bl, i) => {
      bl.nodes.forEach((n) => {
        n.x = _start + i * _offset;
        //@ts-ignore
        n.color.setHex(colors[i % colors.length]);
        n.x_order = i;
      });
    });
    map.width = branchLines.length;
    return map;
  };

  const _updateHeight = () => {
    setHeight(Math.max(commits.length * Node.height + 10, 55) + "px");
  };
  const _updateWidth = () => {
    //setWidth(Math.min(Math.max(this.graph.width * 50 + 20 + 3, 55), 600));
  };

  return (
    <div style={{ width, height, flexShrink: 0 }}>
      <svg width="100%" height="100%">
        <g>
          {graph &&
            graph.links.map((link, idx) => (
              <LinkVisual link={link} key={idx} />
            ))}
          {graph &&
            graph.nodes.map((node, idx) => (
              <NodeVisual node={node} key={idx} />
            ))}
        </g>
      </svg>
    </div>
  );
};

export default connect<IStore>(mapToProps, actions)(SubwayMapVisual);
