import createStore from "redux-zero";
import { applyMiddleware } from "redux-zero/middleware";
import storage from "localforage";
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
}

const initialState : IStore = {
    folder: ''
};

const store = createStore(initialState, middlewares);

export default store;
