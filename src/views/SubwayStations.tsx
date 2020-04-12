import React from 'react';
import { ICommit } from '../utils/interfaces';
import { Node } from '../models/node';
import { colors } from '../models/color';
import { IGraph } from '../models/subway-map';
import { generateColor } from '../utils';
import { Icon } from "@blueprintjs/core";

import { connect } from "redux-zero/react";
import { BoundActions } from "redux-zero/types/Actions";
import actions from "../store/actions";
import { IStore } from "../store/store";

export interface ISubwayStations {
    commits: ICommit[];
}

interface StoreProps {
    selectedCommit: string;
    graph: IGraph | null;
}

const mapToProps = (state : IStore) : StoreProps => ({ selectedCommit: state.selectedCommit, graph : state.graph }); 

type SubwayStationsProps = ISubwayStations & StoreProps & BoundActions<IStore, typeof actions>

const SubwayStations = (props: SubwayStationsProps) => {
    const {commits, selectedCommit, setSelectedCommit, graph} = props;

    const height = Node.height - 8;

    const getAuthor = (author: string) => {
      let firstChars = author.split(' ').map(n => n.length > 0 ? n[0].toUpperCase() : "");
      let name = "";
      firstChars.forEach(f => {
        if (f > 'A' && f < 'Z' && name.length < 2) {
          name += f;
        }
      });
      return name;
    }
    
    const  getColorByAuthor = (commit: ICommit) => {
      return generateColor(commit.email);
    }
    const getBranchColor = (commit: ICommit) => {
        if (graph && graph.nodeDict[commit.sha]) {
            return colors[graph.nodeDict[commit.sha].x_order % colors.length];
        }
        return '#000';
    }

    const select = (sha: string) => {
        setSelectedCommit(sha);
    }
    return (
        <div className="commit-info-root">
            <div className="commit-info-container">
                {commits.map((commit : ICommit, idx: number) => (
                    <div className="commit-info" key={idx} onClick={() => select(commit.sha)}
                        id={'commit-info-' + commit.sha} style={{height}}>
                        <div className={"background " + (commit.sha === selectedCommit ? 'selected' : '')}
                            style={{background: getBranchColor(commit)}}
                            ></div>
                        <div className="commit-info-detail-container d-flex">
                            { !commit.virtual &&
                                <div className="ml-1 committer text-center"style={{background: getColorByAuthor(commit)}}>{getAuthor(commit.author)}</div>
                            }
                            <div>
                            {
                                commit.virtual && <div className="files-summary ml-1">
                                    {!!commit.fileSummary.modified && <span className="mr-1 commit-summary modification">
                                        <Icon icon="document" />{commit.fileSummary.modified}</span> }
                                    {!!commit.fileSummary.newCount && <span className="mr-1 commit-summary addition">
                                        <i className="icon-file-plus"></i>{commit.fileSummary.newCount}</span>}
                                    {!!commit.fileSummary.deleted && <span className="mr-1 commit-summary deletion">
                                        <i className="icon-file-minus"></i>{commit.fileSummary.deleted}</span>}
                                    {!!commit.fileSummary.renamed && <span className="mr-1 commit-summary rename">
                                        <i className="icon-file-minus"></i>{commit.fileSummary.renamed}</span>}
                                    {!!commit.fileSummary.ignored && <span className="mr-1 commit-summary ignored">
                                        <i className="icon-file-minus"></i>{commit.fileSummary.ignored}</span>}
                                </div>
                            }
                            </div>
                            <div className="ml-2 commit-message full-width">
                                {!commit.message && <span className="text-muted">Message...</span>}
                                {commit.message}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default connect<IStore>(mapToProps, actions)(SubwayStations);