import createStore from "redux-zero";
import { applyMiddleware } from "redux-zero/middleware";
import storage from "localforage";
import { IGraph } from "../models/SubwayMap";
import { IRepo, ICommit, ICurrentCommit, IRefs, ISelectedFile } from "../utils/interfaces";

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
  wipCommit: ICommit;
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
  wipCommit: {
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
  },
  selectedFile: {
    commit: null,
    path: null,
    diffType: null
  }
};

const store = createStore(initialState, middlewares);

export default store;
