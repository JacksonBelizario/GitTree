import { init, Models, RematchDispatch, RematchRootState } from '@rematch/core'
import persist from '@rematch/persist'
import {commit, commits, currentBranch, expandedMenu, folder, graph, loading, refs, repo, repoName, selectedCommit, selectedFile, settings} from './Models'
import {repos} from './Models'

const createElectronStorage = window.require('redux-persist-electron-storage');
const ElectronStore = window.require('electron-store');

const electronStore = new ElectronStore()
export interface RepoModel extends Models<RepoModel> {
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

export const models: RepoModel = {
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

export type Dispatch = RematchDispatch<RepoModel>;
export type RootState = RematchRootState<RepoModel>;

export const createStore = (name: string) =>
  init({
    name,
    models,
    plugins: [
      //@ts-ignore
      persist({
        key: name,
        storage: createElectronStorage({ electronStore }),
  	    version: 2,
        blacklist: ['loading', 'repo'],
      })
    ],
  });
  
  export interface GlobalModel extends Models<GlobalModel> {
    repos: typeof repos;
  }
  
  export const globalModels: GlobalModel = {
    repos,
  };

  export type GlobalDispatch = RematchDispatch<RepoModel>;
  export type GlobalRootState = RematchRootState<RepoModel>;

  export const globalStore = 
    init({
      name: 'global',
      models: globalModels,
      plugins: [
        //@ts-ignore
        persist({
          key: 'global',
          storage: createElectronStorage({ electronStore }),
          version: 2,
        })
      ],
    });