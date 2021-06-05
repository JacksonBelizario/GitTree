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
import equal from "fast-deep-equal/react";

import Git from "../utils/git";
import { IRepo, ICommit, ICurrentCommit, IRefs, IWipCommit, ISettings } from "../utils/interfaces";

import "react-perfect-scrollbar/dist/css/styles.css";
import MapSeparator from "./MapSeparator";
import { INITIAL_WIP } from "../utils";

interface StoreProps {
  folder: string;
  repo: IRepo;
  refs: IRefs;
  currentBranch: ICurrentCommit | null;
  commits: ICommit[];
  commit: IWipCommit;
  settings: ISettings;
  loading: boolean
}

const mapToProps = (state: IStore): StoreProps => ({
  folder: state.folder,
  repo: state.repo,
  commits: state.commits,
  currentBranch: state.currentBranch,
  refs: state.refs,
  commit: state.commit,
  settings: state.settings,
  loading: state.loading,
});

const ONE_SECOND = 1000;
const INTERVAL = 2 * ONE_SECOND;

type MainProps = StoreProps & BoundActions<IStore, typeof actions>;

const Main = (props: MainProps) => {
  const {
    folder,
    setSelectedCommit,
    repo, setRepo,
    currentBranch, setCurrentBranch,
    refs, setRefs,
    commits, setCommits,
    commit, setCommit,
    loading, setLoading,
  } = props;

  const [watch, setWatch] = useState<Boolean>(false);
  const [localRefs, setLocalRefs] = useState<IRefs>(refs);

  useEffect(() => {
    const loadRepo = async (folder: string) => {
      if (!folder) {
        return;
      }
      try {
        setLoading(true);
        setCommits([]);
        setCommit(INITIAL_WIP);

        const repo = await Git.openRepo(folder);
        setRepo(repo);
        const curBranch = await Git.getCurrentBranch(repo)
        setCurrentBranch(curBranch);
        setSelectedCommit(curBranch.target);
        setCommits(await Git.getCommits(repo));
        setWatch(true);
      } catch (error) {
        console.warn({ error });
      }
    };

    loadRepo(folder);
  }, [folder, setCommit, setCommits, setCurrentBranch, setRepo, setSelectedCommit, setLoading]);

  useEffect(() => {
    if (!equal(localRefs.references, refs.references)) {
      setRefs(localRefs);
    }
  }, [localRefs, refs, setRefs]);

  useInterval(() => {

    /**
     * Check if the references have updated
     */
    const checkRefs = async () => {
      let repoRefs = await Git.getReferences(repo);
      if (refs.commits !== repoRefs.commits) {
        console.log('References updated', (new Date()).toJSON());

        repoRefs.references = await Git.getRefsChanges(repo, repoRefs.references);
        setCurrentBranch(await Git.getCurrentBranch(repo));
        
        setLocalRefs(repoRefs);
      }
    };

    /**
     * Check if the branch have changed
     */
    const checkCurrentBranch = async () => {
      const curBranch = await Git.getCurrentBranch(repo);
      if (curBranch.shorthand !== currentBranch.shorthand) {
        console.log('Current branch have changed', (new Date()).toJSON());

        setCurrentBranch(curBranch);
      }
    };


    /**
     * Check if the working directory have changed
     */
    const checkWorkingDirectory = async () => {
      let changes = await Git.getStatus(repo);
      let wip = {...commit, ...changes} as IWipCommit;

      if (!equal(commit, wip)) {
        console.log('Working directory updated', (new Date()).toJSON());

        if (changes.enabled) {
          wip.parents = currentBranch ? [currentBranch.target] : [];
          setCommits([wip, ...commits.filter(({sha}) => sha !== 'workdir')]);
        } else {
          setCommits(commits.filter(({sha}) => sha !== 'workdir'));
          setSelectedCommit(currentBranch.target);
        }

        setCommit(wip);
      }
      else if (wip.enabled && commits[0].sha !== 'workdir') {
        setCommit(wip);
      }
    };
    
    const watchChanges = async () => {
      if (!repo) {
        return;
      }

      await checkRefs();
      await checkCurrentBranch();
      await checkWorkingDirectory();

      if (loading) {
        setTimeout(() => setLoading(false), 1000);
      }
    };

    if (watch) {
      watchChanges();
    }
  }, INTERVAL);

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

export default connect<IStore>(mapToProps, actions)(Main);
