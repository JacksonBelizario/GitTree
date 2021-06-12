import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import {store} from "./StoreRematch/Store";
import App from "./App/App";
import Menu from "./App/Menu";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Menu title="GitTree" />
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
