import { init, Models, RematchDispatch, RematchRootState } from '@rematch/core'
import {commit, commits, currentBranch, expandedMenu, folder, graph, loading, refs, repo, repoName, selectedCommit, selectedFile, settings} from './Models'
export interface RootModel extends Models<RootModel> {
  loading: typeof loading;
  folder: typeof folder;
  repo: typeof repo;
  repoName: typeof repoName;
  selectedCommit: typeof selectedCommit;
  graph: typeof graph;
  currentBranch: typeof currentBranch;
  commits: typeof commits;
  commit: typeof commit;
  refs: typeof refs;
  selectedFile: typeof selectedFile,
  settings: typeof settings,
  expandedMenu: typeof expandedMenu
}

export const models: RootModel = {
  loading,
  folder,
  repo,
  repoName,
  selectedCommit,
  graph,
  currentBranch,
  commits,
  commit,
  refs,
  selectedFile,
  settings,
  expandedMenu,
};

export type Dispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel>;

export const createStore = (name: string) =>
  init({
    name,
    models,
    // plugins: [persistPlugin],
  });