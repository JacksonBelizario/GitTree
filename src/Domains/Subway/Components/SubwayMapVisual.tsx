import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import { Dispatch, RootState } from "../../../StoreRematch/Store";

import { ICommit } from "../../../Support/Interfaces";
import { Node } from "../../../Models/Node";
import { Link } from "../../../Models/Link";
import { Color, colors } from "../../../Models/Color";
import { SubwayMap } from "../../../Models/SubwayMap";
import NodeVisual from "./NodeVisual";
import LinkVisual from "./LinkVisual";

import '../../../Assets/scss/subway-map-visual.scss';

interface ISubwayMapVisual {
  commits: ICommit[];
}

const mapState = (state: RootState) => ({
  graph: state.graph
});

const mapDispatch = (dispatch: Dispatch) => ({
  setGraph: dispatch.graph.setGraph,
});

type StateProps = ReturnType<typeof mapState>
type DispatchProps = ReturnType<typeof mapDispatch>

type SubwayMapVisualProps = ISubwayMapVisual & StateProps & DispatchProps;

interface BranchLine {
  nodes: Node[];
  open: boolean;
}

const SubwayMapVisual = (props: SubwayMapVisualProps) => {
  const { commits, graph, setGraph } = props;

  const [height, setHeight] = useState("100%");
  // const [width] = useState("500px");

  useEffect(() => {
    
    let _infinityY = Node.height * (commits.length + 1);

    const getSubwayMap = (commits: ICommit[]) => {
      let nodeDict: object | any = {};

      let nodes = commits.map((c, i) => {
        let node = new Node(c.sha);
        node.commit = c;
        node.color = Color.parseHex(colors[0]);
        node.secondColor = Color.parseHex(colors[0]);
        nodeDict[node.commit.sha] = node;
        return node;
      });
      
      return startSubWayMap(nodes, nodeDict);
    };

    const startSubWayMap = (nodes: Node[], nodeDict) => {
      let map = new SubwayMap(nodes, nodeDict);
      let _start = 25;
      let _offset = Node.height;
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
          if (!node.processed && !bl.open) {
            addedToBl = bl;
            bl.nodes.push(node);
            bl.open = true;
            node.processed = true;
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
            if (bl.nodes[bl.nodes.length - 1].commit.parents[0] === node.commit.sha) {
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

      // special case for it's parents, always put the first with itself
      function processParents(sha: string, bl: BranchLine) {
        let parent = nodeDict[sha];
        if (parent && !parent.processed) {
          bl.nodes.push(parent);
          // process grandparent
          if (nodeDict[sha].commit.parents.length > 1) {
            processParents(nodeDict[sha].commit.parents[0], bl);
          }
          nodeDict[sha].processed = true;
        }
      }

      nodes.forEach((n, i) => {
        n.y = _start + i * _offset;
        let currentSha = n.commit.sha;
        if (!n.processed) {
          let parentSha = n.commit.parents[0];
          // Add to an existing branch or new
          let addedToBl = placeNodeInExisting(n) || placeNodeInNewOrClosed(n);
          processParents(parentSha, addedToBl);
        }
        // check for closed branch line, make it available for adding
        branchLines.forEach((bl) => {
          if (bl.nodes[bl.nodes.length - 1].commit.parents.indexOf(currentSha) !== -1) {
            bl.open = false;
          }
        });
      });

      // process all branch lines
      branchLines = branchLines.map((bl, i) => {
        bl.nodes = bl.nodes.map((n) => {
          n.x = _start + i * _offset;
          n.color.setHex(colors[i % colors.length]);
          n.x_order = i;
          return n;
        });
        return bl;
      });

      // edge creation
      map.links = commits.reduce((acc, c) => {
        if (c.parents.length === 0) {
          let infinityNode = new Node("infty-" + c.sha);
          infinityNode.x = nodeDict[c.sha].x;
          infinityNode.y = _infinityY;
          let newLink = new Link(nodeDict[c.sha], infinityNode);
          newLink.color = nodeDict[c.sha].color;
          acc.push(newLink);
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
              acc.push(newLink);
            }
          });
        }
        return acc;
      }, []);

      map.width = branchLines.length;
      return map;
    };

    // const updateWidth = () => {
    //   setWidth(Math.min(Math.max(graph.width * 50 + 20 + 3, 55), 600));
    // };
    let graph = getSubwayMap(commits);
    setGraph(graph);
    setHeight(Math.max(commits.length * Node.height + 10, 55) + "px");
  }, [commits, setGraph]);

  return (
    <div style={{ /*width, */height, flexShrink: 0 }}>
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

//@ts-ignore
export default connect(mapState, mapDispatch)(SubwayMapVisual);

