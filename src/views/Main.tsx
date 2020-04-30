import React, { useEffect, useState } from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import SubwayStations from "./SubwayStations";
import SubwayMapVisual from "./SubwayMapVisual";
import SubwayStationAnnot from "./SubwayStationAnnot";
import { connect } from "redux-zero/react";
import { IStore } from "../store/store";
import { useInterval } from "../utils/hooks";
import { BoundActions } from "redux-zero/types/Actions";
import actions from "../store/actions";
import { isEqual } from "lodash";

import Git from "../utils/git";
import { IRepo, ICommit, ICurrentCommit, IRefs, IReference } from "../utils/interfaces";

import "react-perfect-scrollbar/dist/css/styles.css";
import MapSeparator from "./MapSeparator";
import { Spinner, Intent } from "@blueprintjs/core";

const INITIAL_WIP = {
  sha: "000000",
  author: "",
  email: "",
  parents: [],
  message: "",
  date: new Date(),
  ci: "",
  virtual: true,
  isStash: false,
  enabled: false,
  fileSummary: {},
};

interface StoreProps {
  folder: string;
  repo: IRepo;
  refs: IRefs;
  currentBranch: ICurrentCommit | null;
  commits: ICommit[];
}

const mapToProps = (state: IStore): StoreProps => ({
  folder: state.folder,
  repo: state.repo,
  commits: state.commits,
  currentBranch: state.currentBranch,
  refs: state.refs,
});

const INTERVAL = 5 * 1000;

type MainProps = StoreProps & BoundActions<IStore, typeof actions>;

const Main = (props: MainProps) => {
  const {
    folder,
    repo,
    setRepo,
    currentBranch,
    setCurrentBranch,
    refs,
    setRefs,
    commits,
    setCommits,
  } = props;

  const [wipCommit, setWipCommit] = useState<ICommit>(INITIAL_WIP);
  const [watch, setWatch] = useState<Boolean>(false);
  const [localRefs, setLocalRefs] = useState<IRefs>(refs);

  useEffect(() => {
    loadRepo(folder);
  }, [folder]);

  useEffect(() => {
    if (!isEqual(localRefs.references, refs.references)) {
      console.log("!isEqual");
      setRefs(localRefs);
    }
  }, [localRefs]);

  useInterval(() => {
    if (watch) {
      watchChanges();
      getRefs();
    }
  }, INTERVAL);

  const getRefs = async () => {
    let refs = await Git.getReferences(repo);
    refs.references = refs.references.map((ref: IReference)=> ({
      current: ref.display.includes(currentBranch.name),
      ...ref
    }))
    //@ts-ignore
    setLocalRefs(refs);
  };

  const loadRepo = async (folder: string) => {
    if (!folder) {
      return;
    }
    try {
      const repo = await Git.openRepo(folder);
      setRepo(repo);
      setCurrentBranch(await Git.getCurrentBranch(repo));
      setWipCommit(INITIAL_WIP);
      setCommits(await Git.getCommits(repo));
      setWatch(true);
    } catch (error) {
      console.warn({ error });
    }
  };

  const watchChanges = async () => {
    if (!repo || commits.length === 0) {
      return;
    }
    let changes = await Git.getStatus(repo);
    let oldStatus = wipCommit.enabled;
    let wip = wipCommit;
    wip.fileSummary = changes.summary;
    if (changes.staged.length || changes.unstaged.length) {
      wip.enabled = true;
    } else {
      wip.enabled = false;
    }
    setWipCommit(wip);
    if (oldStatus !== wip.enabled) {
      wip.parents = currentBranch ? [currentBranch.target] : [];
      if (wip.enabled) {
        setCommits([wip, ...commits]);
      } else {
        // TODO
      }
    }
  };

  if (!repo) {
    return <Spinner className="h-full" intent={Intent.PRIMARY} size={100} />;
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

export default connect<IStore>(mapToProps, actions)(Main);
