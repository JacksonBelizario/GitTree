import createStore from "redux-zero";
import { applyMiddleware } from "redux-zero/middleware";
import storage from "localforage";
import { IGraph } from "../models/SubwayMap";
import { IRepo, ICommit, ICurrentCommit, IRefs, ISelectedFile, IWipCommit, ISettings } from "../utils/interfaces";
import { INITIAL_WIP } from "../utils";

const persist = require("redux-zero-persist");

const persistMiddleware = persist({ key: "[key]", storage }, function (
  err: any,
  state: any
) {
  if (err) {
    console.error(err);
  } else {
    store.setState(state);
  }
});

const middlewares = applyMiddleware(persistMiddleware);

export interface IStore {
  folder: string;
  repo: IRepo;
  selectedCommit: string;
  graph: IGraph | null;
  currentBranch: ICurrentCommit | null;
  commits: ICommit[];
  commit: IWipCommit;
  refs: IRefs;
  selectedFile: ISelectedFile,
  settings: ISettings,
  expandedMenu: string[]
}

const initialState: IStore = {
  folder: "",
  repo: null,
  selectedCommit: "",
  graph: null,
  currentBranch: null,
  commits: [],
  refs: { references: [], refDict: null, commits: '' },
  commit: INITIAL_WIP,
  selectedFile: {
    commit: null,
    path: null,
    diffType: null
  },
  settings: {
    show: false,
    general: {
      fetchInterval: 5
    },
    auth: {
      username: '',
      password: '',
      useSshLocalAgent: true,
      sshPrivateKey: '',
      sshPrivateContent: '',
      sshPublicKey: '',
      sshPublicContent: ''
    }
  },
  expandedMenu: []
};

const store = createStore(initialState, middlewares);

export default store;
