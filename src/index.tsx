import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { Provider } from "redux-zero/react";
import store from "./store/store";
import App from "./App";
import Menu from "./Menu";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Menu title="GitTree" />
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
