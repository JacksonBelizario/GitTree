import createStore from "redux-zero";
import { applyMiddleware } from "redux-zero/middleware";
import { IStore } from "../Support/Interfaces";
import { INITIAL_WIP } from "../Support/Utils";
import persist from "redux-zero-persist";

const ElectronStore = window.require('electron-store');

 class Storage {
  store: any;
  constructor() {
    this.store = new ElectronStore();
  }
  async getItem(key, cb) {
    try {
      cb(null, await this.store.get(key));
    } catch(err) {
      cb(err);
    }
  }
  async setItem(key, item, cb) {
    try {
      cb(null, await this.store.set(key, item))
    } catch(err) {
      cb(err, {});
    }
  }
  async removeItem(key, cb) {
    try {
      cb(null, await this.store.delete(key))
    } catch(err) {
      cb(err, {});
    }
  }
}

const storage = new Storage();

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

const initialState: IStore = {
  loading: false,
  folder: "",
  repo: null,
  workdir: "",
  repoName: "",
  selectedCommit: "",
  graph: null,
  currentBranch: null,
  commits: [],
  refs: { references: [], refDict: null, commits: '' },
  commit: INITIAL_WIP,
  selectedFile: {
    commit: null,
    file: null,
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
