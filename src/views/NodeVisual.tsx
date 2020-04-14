import React from 'react';
import { Node } from '../models/node';

import { connect } from "redux-zero/react";
import { BoundActions } from "redux-zero/types/Actions";
import actions from "../store/actions";
import { IStore } from "../store/store";

interface INodeVisual {
    node: Node
}

interface StoreProps {
    selectedCommit: string;
}

const mapToProps = (state : IStore) : StoreProps => ({ selectedCommit: state.selectedCommit }); 

type NodeVisualProps = INodeVisual & StoreProps & BoundActions<IStore, typeof actions>

const NodeVisual = (props : NodeVisualProps) => {

    const { node, selectedCommit, setSelectedCommit } = props;

    const [graphWidth] = React.useState(500);

    const select = (sha: string) => {
        setSelectedCommit(sha);
    }

    return (
        <g transform={`translate(${node.x}, ${node.y})`} className="map-station" onClick={() => node.commit && select(node.commit.sha)}>
        {
            node.x && node.color && graphWidth > node.x + 3 &&
            <rect x="0" y="-13" width={graphWidth - 3 - node.x} height="27" className={"highlight smooth-1 " + (node.commit && node.commit.sha === selectedCommit ? 'selected' : '')} style={{fill: node.color.stringValue}} />
        }
        {
            (node.commit && !node.commit.isStash && !node.commit.virtual) && (
                (node.secondColor && node.commit.parents.length > 1)
                ? <circle cx="0" cy="0" r="7" className="dot" style={{fill: node.color && node.color.stringValue }}></circle>
                : <circle cx="0" cy="0" r="13" className="dot" style={{stroke: node.color && node.color.stringValue, fill: '#282c34' }} ></circle>
            )
        }
        {
           node.commit && node.color && node.commit.virtual &&
           <circle cx="0" cy="0" r="13" className="dot" strokeWidth="1" strokeDasharray={'5, 3'} style={{stroke: node.color && node.color.stringValue, fill: '#282c34' }} ></circle>
        }
        {
           node.commit && node.color && node.commit.isStash &&
            <rect stroke={node.color.stringValue} strokeWidth="3" strokeDasharray={'5, 3'} x="-13" y="-13" width="26" height="26" style={{fill: '#282c34' }}></rect>
        }
        {
            node.commit && node.color && node.commit.isStash &&
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={node.color.stringValue} x="-9" y="-9" stroke="#282c34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-archive">
                <polyline points="21 8 21 21 3 21 3 8"></polyline>
                <rect x="1" y="3" width="22" height="5"></rect>
                <line x1="10" y1="12" x2="14" y2="12"></line>
            </svg>
        }
      {
        node.x && node.color && graphWidth > node.x + 3 &&
        <rect x={graphWidth - 3 - node.x} y="-13" width="3" height="27" style={{fill: node.color.stringValue }}></rect>
      }
      {/**  CI setting **/}
      {/** pass **/}
      {
        node.commit && node.commit.ci==='success' &&
        <g className="animated bounceIn">
            <circle cx="0" cy="0" r="12" fill="var(--success)">
            </circle>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" x="-9" y="-8" viewBox="0 0 24 24" fill="none" stroke="#FFF"
            strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="feather feather-check">
            <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        </g>
      }
      {/** fail **/}
      {
        node.commit && node.commit.ci==='failed' &&
        <g className="animated flash">
            <circle cx="0" cy="0" r="12" fill="var(--danger)">
            </circle>
            <svg xmlns="http://www.w3.org/2000/svg" x="-9" y="-9" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </g>
      }
      {/** pending **/}
      {
        node.commit && node.commit.ci==='queued' &&
        <g className="animated infinite pulse">
            <circle cx="0" cy="0" r="12" fill="var(--gray-dark)">
            </circle>
            <svg xmlns="http://www.w3.org/2000/svg" x="-9" y="-9" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-clock">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
        </g>
      }
      {/** cancelled **/}
      {
        node.commit && node.commit.ci==='cancelled' &&
        <g className="animated flash">
            <circle cx="0" cy="0" r="12" fill="var(--gray)">
            </circle>
            <svg xmlns="http://www.w3.org/2000/svg" x="-9" y="-9" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-minus-circle">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
        </g>
      }
    </g>
    )
}

export default connect<IStore>(mapToProps, actions)(NodeVisual);