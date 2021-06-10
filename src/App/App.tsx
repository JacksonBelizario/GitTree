import React, { useCallback, useEffect, useState } from "react";
import { connect } from 'redux-zero/react';
import { BoundActions } from "redux-zero/types/Actions";
import Pane from "react-split-pane/lib/Pane";
import SplitPane from "react-split-pane/lib/SplitPane";
import { Spinner, Intent, FocusStyleManager } from "@blueprintjs/core";
import { Repository } from "nodegit";
import equal from "fast-deep-equal/react";
import { debounce } from "lodash";

import { IRepo, ICommit, ICurrentCommit, ISelectedFile, IRefs, IWipCommit, ISettings, IStore } from '../Support/Interfaces';
import { useIntervalAsync } from "../Support/Hooks";
import { INITIAL_WIP } from "../Support/Utils";
import Actions from "../Store/Actions";

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

interface StoreProps {
  folder: string;
  workdir: string;
  repo: IRepo;
  refs: IRefs;
  currentBranch: ICurrentCommit | null;
  commits: ICommit[];
  commit: IWipCommit;
  settings: ISettings;
  loading: boolean
  selectedFile: ISelectedFile;
}
 
FocusStyleManager.onlyShowFocusOnTabs();

const mapToProps = (state: IStore): StoreProps => ({
  folder: state.folder,
  workdir: state.workdir,
  repo: state.repo,
  refs: state.refs,
  currentBranch: state.currentBranch,
  commits: state.commits,
  commit: state.commit,
  settings: state.settings,
  loading: state.loading,
  selectedFile: state.selectedFile
});

type AppProps = StoreProps & BoundActions<IStore, typeof Actions>;

const App = (props: AppProps) => {
  const {
    folder, setFolder,
    setSelectedCommit,
    repo, setRepo,
    currentBranch, setCurrentBranch,
    refs, setRefs,
    commits, setCommits,
    commit, setCommit,
    loading, setLoading,
    selectedFile, setSelectedFile,
    workdir, setWorkdir,
    setRepoName,
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

        if (!(repo instanceof Repository) || workdir !== repo.workdir()) {
          console.log('Load repo', {folder}, (new Date()).toJSON());
          const repo = await Git.openRepo(folder);
          setRepo(repo);
          setWorkdir(repo.workdir());
          setRepoName(repo.workdir().split('/').filter(o => o).pop());
          const curBranch = await Git.getCurrentBranch(repo);
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
  }, [repo, folder, workdir, setFolder, setRepo, setLoading, setCommit, setCommits, setCurrentBranch, setSelectedCommit, setLocalCommits, setSelectedFile, setWorkdir, setRepoName]);

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

export default connect<IStore>(mapToProps, Actions)(App);
