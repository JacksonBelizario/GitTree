import React from "react";
import { connect } from "redux-zero/react";
import { FiFile as FileIcon } from 'react-icons/fi';
import { BoundActions } from "redux-zero/types/Actions";

import moment from 'moment';

import { ICommit, IStore } from "../../../Support/Interfaces";
import { colors } from "../../../Models/Color";
import { IGraph } from "../../../Models/SubwayMap";

import Actions from "../../../Store/Actions";

import { Author } from "../../../Models/Author";

import '../../../Assets/scss/subway-stations.scss'

export interface ISubwayStations {
  commits: ICommit[];
}

interface StoreProps {
  selectedCommit: string;
  graph: IGraph | null;
}

const mapToProps = (state: IStore): StoreProps => ({
  selectedCommit: state.selectedCommit,
  graph: state.graph,
});

type SubwayStationsProps = ISubwayStations &
  StoreProps &
  BoundActions<IStore, typeof Actions>;

const SubwayStations = (props: SubwayStationsProps) => {
  const { commits, selectedCommit, setSelectedCommit, graph } = props;

  const getBranchColor = (commit: ICommit) => {
    if (graph && graph.nodeDict[commit.sha]) {
      return colors[graph.nodeDict[commit.sha].x_order % colors.length];
    }
    return "#000";
  };

  return (
    <div className="commit-info-root">
      <div className="commit-info-container">
        {commits.map((commit: ICommit, idx: number) => (
          <div
            className="commit-info"
            key={idx}
            onClick={() => setSelectedCommit(commit.sha)}
            id={"commit-info-" + commit.sha}
          >
            <div
              className={
                "background " +
                (commit.sha === selectedCommit ? "selected" : "")
              }
              style={{ background: getBranchColor(commit) }}
            ></div>
            <div className="commit-info-detail-container d-flex">
              {!commit.virtual && (
                <div
                  className="ml-1 committer text-center"
                  style={Author.getColors(commit.email)}
                >
                  {Author.getAcronym(commit.author)}
                </div>
              )}
              {commit.virtual && commit.fileSummary && (
                <div className="files-summary ml-1 flex">
                  {!!commit.fileSummary.modified && (
                    <span className="mr-1 commit-summary modification">
                      <FileIcon size={18} />
                      {commit.fileSummary.modified}
                    </span>
                  )}
                  {!!commit.fileSummary.newCount && (
                    <span className="mr-1 commit-summary addition">
                      <i className="icon-file-plus"></i>
                      {commit.fileSummary.newCount}
                    </span>
                  )}
                  {!!commit.fileSummary.deleted && (
                    <span className="mr-1 commit-summary deletion">
                      <i className="icon-file-minus"></i>
                      {commit.fileSummary.deleted}
                    </span>
                  )}
                  {!!commit.fileSummary.renamed && (
                    <span className="mr-1 commit-summary rename">
                      <i className="icon-file-minus"></i>
                      {commit.fileSummary.renamed}
                    </span>
                  )}
                  {!!commit.fileSummary.ignored && (
                    <span className="mr-1 commit-summary ignored">
                      <i className="icon-file-minus"></i>
                      {commit.fileSummary.ignored}
                    </span>
                  )}
                </div>
              )}
              <div className="ml-2 commit-message full-width">
                {!commit.message && (
                  <span className="text-muted">Message...</span>
                )}
                {commit.message}
              </div>
              <div className="ml-2" style={{width: 160}}>
                {moment(commit.date).format("YYYY-MM-DD HH:mm")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default connect<IStore>(mapToProps, Actions)(SubwayStations);