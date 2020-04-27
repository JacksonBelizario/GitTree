import React from "react";
import { Node } from "../models/Node";

import { connect } from "redux-zero/react";
import { BoundActions } from "redux-zero/types/Actions";
import actions from "../store/actions";
import { IStore } from "../store/store";

interface INodeVisual {
  node: Node;
}

interface StoreProps {
  selectedCommit: string;
}

const mapToProps = (state: IStore): StoreProps => ({
  selectedCommit: state.selectedCommit,
});

type NodeVisualProps = INodeVisual &
  StoreProps &
  BoundActions<IStore, typeof actions>;

const NodeVisual = (props: NodeVisualProps) => {
  const { node, selectedCommit, setSelectedCommit } = props;

  const [graphWidth] = React.useState(500);

  const select = (sha: string) => {
    setSelectedCommit(sha);
  };

  return (
    <g transform={`translate(${node.x}, ${node.y})`} className="map-station" onClick={() => node.commit && select(node.commit.sha)}>
      {
        node.x && node.color && graphWidth > node.x + 3 &&
        <rect x="0" y="-10" width={graphWidth - 3 - node.x} height="22" className={"highlight smooth-1 " + (node.commit && node.commit.sha === selectedCommit ? 'selected' : '')} style={{fill: node.color.stringValue}} />
      }
      {
        (node.commit && !node.commit.isStash && !node.commit.virtual) && (
          (node.secondColor && node.commit.parents.length > 1)
          ? <circle cx="0" cy="1" r="6" className="dot" style={{fill: node.color && node.color.stringValue }}></circle>
          : <circle cx="0" cy="1" r="10" className="dot" style={{stroke: node.color && node.color.stringValue }} ></circle>
        )
      }
      {
        node.commit && node.color && node.commit.virtual &&
        <circle cx="0" cy="1" r="10" className="dot" strokeDasharray={'2'} style={{stroke: node.color && node.color.stringValue }} ></circle>
      }
      {
        node.commit && node.color && node.commit.isStash &&
        <rect stroke={node.color.stringValue} className="dot" strokeDasharray={'2'} x="-10" y="-9" width="20" height="20"></rect>
      }
      {
        node.commit && node.color && node.commit.isStash &&
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 21 21" fill={node.color.stringValue} x="-9" y="-9" stroke="#282c34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-archive">
          <polyline points="21 8 21 21 3 21 3 8"></polyline>
          <rect x="1" y="3" width="22" height="5"></rect>
          <line x1="10" y1="12" x2="14" y2="12"></line>
        </svg>
      }
    {
      node.x && node.color && graphWidth > node.x + 3 &&
      <rect x={graphWidth - 3 - node.x} y="-10" width="3" height="22" style={{fill: node.color.stringValue }}></rect>
    }
    {/**  CI setting **/}
    {/** pass **/}
    {
      node.commit && node.commit.ci==='success' &&
      <g className="animated bounceIn">
          <circle cx="0" cy="1" r="10" fill="var(--success)">
          </circle>
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" x="-9" y="-8" viewBox="0 0 22 22" fill="none" stroke="#FFF"
            strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="feather feather-check">
          <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
      </g>
    }
    {/** fail **/}
    {
      node.commit && node.commit.ci==='failed' &&
      <g className="animated flash">
          <circle cx="0" cy="1" r="10" fill="var(--danger)">
          </circle>
          <svg xmlns="http://www.w3.org/2000/svg" x="-9" y="-9" width="15" height="15" viewBox="0 0 22 22" fill="none" stroke="currentColor"
            strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x">
          <line x1="15" y1="6" x2="6" y2="15"></line>
          <line x1="6" y1="6" x2="15" y2="15"></line>
          </svg>
      </g>
    }
    {/** pending **/}
    {
      node.commit && node.commit.ci==='queued' &&
      <g className="animated infinite pulse">
          <circle cx="0" cy="1" r="10" fill="var(--gray-dark)">
          </circle>
          <svg xmlns="http://www.w3.org/2000/svg" x="-9" y="-9" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-clock">
          <circle cx="9" cy="9" r="10"></circle>
          <polyline points="9 6 9 9 16 14"></polyline>
          </svg>
      </g>
    }
    {/** cancelled **/}
    {
      node.commit && node.commit.ci==='cancelled' &&
      <g className="animated flash">
          <circle cx="0" cy="1" r="10" fill="var(--gray)">
          </circle>
          <svg xmlns="http://www.w3.org/2000/svg" x="-9" y="-9" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-minus-circle">
          <circle cx="9" cy="9" r="10"></circle>
          <line x1="8" y1="9" x2="16" y2="9"></line>
          </svg>
      </g>
    }
  </g>
  )
}

export default connect<IStore>(mapToProps, actions)(NodeVisual);