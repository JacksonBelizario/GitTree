import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "redux-zero/react";
import Store from "./Store/Store";
import App from "./App/App";
import Menu from "./App/Menu";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={Store}>
      <Menu title="GitTree" />
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
