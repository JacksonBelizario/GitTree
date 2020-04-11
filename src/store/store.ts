import createStore from "redux-zero";
import { applyMiddleware } from "redux-zero/middleware";
import storage from "localforage";
import { IGraph } from '../models/subway-map';
import {ICommit} from '../utils/interfaces';

const persist = require("redux-zero-persist");

const persistMiddleware = persist({ key: "[key]", storage }, function( err: any, state: any) {
  if (err) {
    console.error(err);
  } else {
    store.setState(state);
  }
});

const middlewares = applyMiddleware(persistMiddleware);

export interface IStore {
    folder: string;
    selectedCommit: string;
    graph: IGraph | null;
    commits: ICommit[]
    wipCommit: ICommit;
}

const initialState : IStore = {
    folder: '',
    selectedCommit: '',
    graph: null,
    commits: [],
    wipCommit: {
      sha: "00000",
      author: "",
      email: "",
      parents: [],
      message: "",
      date: new Date(),
      ci: "",
      virtual: true,
      isStash: false,
      enabled: false,
      fileSummary: {}
    }
};

const store = createStore(initialState, middlewares);

export default store;
