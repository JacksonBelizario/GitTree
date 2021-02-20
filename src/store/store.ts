import createStore from "redux-zero";
import { applyMiddleware } from "redux-zero/middleware";
import storage from "localforage";
import { IGraph } from "../models/SubwayMap";
import { IRepo, ICommit, ICurrentCommit, IRefs, ISelectedFile, IWipCommit } from "../utils/interfaces";
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
  selectedFile: ISelectedFile
}

const initialState: IStore = {
  folder: "",
  repo: null,
  selectedCommit: "",
  graph: null,
  currentBranch: null,
  commits: [],
  refs: { references: [], refDict: null },
  commit: INITIAL_WIP,
  selectedFile: {
    commit: null,
    path: null,
    diffType: null
  }
};

const store = createStore(initialState, middlewares);

export default store;
