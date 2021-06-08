import React from "react";
import { connect } from "redux-zero/react";
import PerfectScrollbar from "react-perfect-scrollbar";

import { IRepo, ICommit, ICurrentCommit, IStore } from "../../Support/Interfaces";

import SubwayStations from "./Components/SubwayStations";
import SubwayMapVisual from "./Components/SubwayMapVisual";
import SubwayStationAnnot from "./Components/SubwayStationAnnot";
import MapSeparator from "./Components/MapSeparator";

interface StoreProps {
  repo: IRepo;
  currentBranch: ICurrentCommit | null;
  commits: ICommit[];
}

const mapToProps = (state: IStore): StoreProps => ({
  repo: state.repo,
  commits: state.commits,
  currentBranch: state.currentBranch,
});

const Subway = (props: StoreProps) => {
  const { repo,  currentBranch, commits } = props;

  if (!repo || commits.length === 0) {
    return <></>;
  }

  return (
    <PerfectScrollbar className="section host">
      <div className="subway-outer">
        <MapSeparator commits={commits} />
        <div className="d-flex subway-container">
          <SubwayStationAnnot
            repo={repo}
            commits={commits}
            currentBranch={currentBranch}
          />
          <SubwayMapVisual commits={commits} />
          <SubwayStations commits={commits} />
        </div>
        <div className="eoh-container text-center mt-1">
          <p>
            <span className="mr-1 icon-info"></span>End of History
          </p>
        </div>
      </div>
    </PerfectScrollbar>
  );
};

export default connect<IStore>(mapToProps)(Subway);
