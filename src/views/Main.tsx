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
import { IRepo, ICommit, ICurrentCommit, IRefs, IReference, IWipCommit } from "../utils/interfaces";

import "react-perfect-scrollbar/dist/css/styles.css";
import MapSeparator from "./MapSeparator";
import { Spinner, Intent } from "@blueprintjs/core";
import { INITIAL_WIP } from "../utils";

interface StoreProps {
  folder: string;
  repo: IRepo;
  refs: IRefs;
  currentBranch: ICurrentCommit | null;
  commits: ICommit[];
  commit: IWipCommit;
}

const mapToProps = (state: IStore): StoreProps => ({
  folder: state.folder,
  repo: state.repo,
  commits: state.commits,
  currentBranch: state.currentBranch,
  refs: state.refs,
  commit: state.commit,
});

const INTERVAL = 2 * 1000;

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
    commit,
    setCommit,
    setSelectedCommit
  } = props;

  const [watch, setWatch] = useState<Boolean>(false);
  const [localRefs, setLocalRefs] = useState<IRefs>(refs);
  const [loading, setLoading] = useState<Boolean>(true);

  const getRefs = async () => {
    let refs = await Git.getReferences(repo);
    refs.references = refs.references.map((ref: IReference)=> ({
      current: ref.display.includes(currentBranch.name),
      ...ref
    }))
    //@ts-ignore
    setLocalRefs(refs);
  };

  useEffect(() => {
    const loadRepo = async (folder: string) => {
      if (!folder) {
        return;
      }
      try {
        setLoading(true);
        setCommits([]);
        setCommit(INITIAL_WIP);
        setSelectedCommit(INITIAL_WIP.sha);

        const repo = await Git.openRepo(folder);
        setRepo(repo);
        setCurrentBranch(await Git.getCurrentBranch(repo));
        setCommits(await Git.getCommits(repo));
        setWatch(true);
      } catch (error) {
        console.warn({ error });
      }
    };

    loadRepo(folder);
  }, [folder, setCommit, setCommits, setCurrentBranch, setRepo, setSelectedCommit]);

  useEffect(() => {
    if (!isEqual(localRefs.references, refs.references)) {
      setRefs(localRefs);
    }
  }, [localRefs, refs, setRefs]);

  useInterval(() => {
    const watchChanges = async () => {
      if (!repo || commits.length === 0) {
        return;
      }
      let changes = await Git.getStatus(repo);
      let oldStatus = commit.enabled;
      let wip = {...commit, ...changes};
      if (oldStatus !== changes.enabled) {
        wip.parents = currentBranch ? [currentBranch.target] : [];
        if (changes.enabled) {
          setLoading(true);
          setCommits([wip, ...commits]);
        } else {
          // setCommits(commits);
        }
      }
      setCommit(wip);
      setTimeout(() => setLoading(false), 1000);
    };

    if (watch) {
      watchChanges();
      getRefs();
    }
  }, INTERVAL);

  if (!repo || loading) {
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
