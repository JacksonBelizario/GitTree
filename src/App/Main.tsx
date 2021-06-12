import React, { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import Pane from "react-split-pane/lib/Pane";
import SplitPane from "react-split-pane/lib/SplitPane";
import { Spinner, Intent, FocusStyleManager } from "@blueprintjs/core";
import { Repository } from "nodegit";
import equal from "fast-deep-equal/react";
import { debounce } from "lodash";

import { ICommit, ICurrentCommit, IRefs, IWipCommit } from '../Support/Interfaces';
import { useIntervalAsync } from "../Support/Hooks";
import { INITIAL_WIP } from "../Support/Utils";
import { Dispatch, RootState } from "../StoreRematch/Store";

import Navbar from "./Navbar";
import Footer from "./Footer";

import SidebarBranchs from "../Domains/SidebarBranchs/Index";
import SidebarCommitDetail from "../Domains/SidebarCommitDetail/Index";
import Subway from "../Domains/Subway/Index";
import FileViewer from "../Domains/FileViewer/Index";
import Settings from "../Domains/Settings/Index";
import Git from "../Services/Git";

import "react-perfect-scrollbar/dist/css/styles.css";
import "../Assets/main.css";
import "../Assets/scss/main.scss";

const ONE_SECOND = 1000;
const INTERVAL = 2 * ONE_SECOND;
 
FocusStyleManager.onlyShowFocusOnTabs();

const mapState = (state: RootState) => ({
  folder: state.folder,
  repo: state.repo,
  refs: state.refs,
  currentBranch: state.currentBranch,
  commits: state.commits,
  commit: state.commit,
  settings: state.settings,
  loading: state.loading,
  selectedFile: state.selectedFile
});

const mapDispatch = (dispatch: Dispatch) => ({
  setLoading: dispatch.loading.setLoading,
  setSelectedCommit: dispatch.selectedCommit.setSelectedCommit,
  setRepo: dispatch.repo.setRepo,
  setCurrentBranch: dispatch.currentBranch.setCurrentBranch,
  setRefs: dispatch.refs.setRefs,
  setCommits: dispatch.commits.setCommits,
  setCommit: dispatch.commit.setCommit,
  setSelectedFile: dispatch.selectedFile.setSelectedFile,
});

type StateProps = ReturnType<typeof mapState>
type DispatchProps = ReturnType<typeof mapDispatch>

type MainProps = StateProps & DispatchProps;

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
    selectedFile, setSelectedFile,
  } = props;

  const [watch, setWatch] = useState<Boolean>(false);
  const [localRefs, setLocalRefs] = useState<IRefs>(refs);
  const [localCommits, setLocalCommits] = useState<ICommit[]>([]);

  useEffect(() => {
    const loadRepo = async (folder: string) => {
      console.log('Start', (new Date()).toJSON());
      setWatch(false);
      if (!folder) {
        return;
      }
      try {
        setLoading(true);
        /**
         * Cleaning old state
         */
        setCommits([]);
        setCommit(INITIAL_WIP);
        setSelectedFile({commit: null, file: null});

        if (!(repo instanceof Repository) || folder !== repo.workdir()) {
          console.log('Load repo', {folder}, (new Date()).toJSON());
          const repo = await Git.openRepo(folder);
          const curBranch = await Git.getCurrentBranch(repo);
          setRepo(repo);
          setCurrentBranch(curBranch);
          setSelectedCommit(curBranch.target);
          setLocalCommits(await Git.getCommits(repo));
        }
        setWatch(true);
        console.log('Loaded repo', (new Date()).toJSON());
      } catch (error) {
        console.warn({ error });
      }
    };

    loadRepo(folder);
  },
  [folder] // eslint-disable-line
  // [repo, folder, setRepo, setLoading, setCommit, setCommits, setCurrentBranch, setSelectedCommit, setLocalCommits, setSelectedFile]
  );

  useEffect(() => {
    if (!equal(localRefs.references, refs.references)) {
      setRefs(localRefs);
    }
  }, [localRefs, refs, setRefs]);

  const handleUpdateCommits = debounce((commit: IWipCommit, localCommits: ICommit[], currentBranch: ICurrentCommit) => {
    console.log('Update commits', (new Date()).toJSON());
    if (commit.enabled) {
      commit.parents = currentBranch ? [currentBranch.target] : [];
      setCommits([commit, ...localCommits.filter(({sha}) => sha !== 'workdir')]);
    } else {
      setCommits(localCommits.filter(({sha}) => sha !== 'workdir'));
      setSelectedCommit(currentBranch.target);
    }
  }, 500);

  // eslint-disable-next-line
  const updateCommits = useCallback(handleUpdateCommits, []);

  useEffect(() => {
    if (!commit || !currentBranch || localCommits.length === 0) {
      return;
    }
    updateCommits(commit, localCommits, currentBranch);
  }, [commit, localCommits, currentBranch, updateCommits]);
  

  useIntervalAsync(async () => {
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
     * Check if the commits have updated
     */
    const checkCommits = async () => {
      let commits = await Git.getCommits(repo, 1);
      if (commits.length > 0) {
        if (localCommits.length > 0 && commits[0].sha === localCommits[0].sha) {
          return;
        }
        console.log('Commits updated', (new Date()).toJSON());

        setLocalCommits(await Git.getCommits(repo));
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

        setCommit(wip);
      }
      else if (wip.enabled && commits.length > 0 && commits[0].sha !== 'workdir') {
        setCommit(wip);
      }
    };
    
    const watchChanges = async () => {
      if (!watch || !(repo instanceof Repository)) {
        return;
      }

      await Promise.all([
        checkRefs(),
        checkCommits(),
        checkCurrentBranch(),
        checkWorkingDirectory(),
      ]);

      if (loading) {
        setLoading(false);
      }
    };

    await watchChanges();
  }, INTERVAL);

  return (
    <div className="bp3-dark flex flex-col h-screen">
      { loading &&
          <div className="loading-content">
          <Spinner intent={Intent.PRIMARY} size={100} />
        </div>
      }
      <Navbar />
      <div className="main-layout flex-1 relative">
        <SplitPane split="vertical">
          <Pane
            className={`sidebar ${selectedFile.file ? "hidden" : ""}`}
            minSize="210px"
            defaultSize="210px"
            maxSize="390px"
          >
            <SidebarBranchs />
          </Pane>
          <div className="relative h-full">
            <Subway />
            <FileViewer />
          </div>
          <Pane minSize="300px" defaultSize="350px" maxSize="500px">
            <SidebarCommitDetail />
          </Pane>
        </SplitPane>
        <Settings />
      </div>
      <Footer />
    </div>
  );
};

//@ts-ignore
export default connect(mapState, mapDispatch)(Main);
