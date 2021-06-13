import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { getPersistor } from '@rematch/persist';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { Spinner } from "@blueprintjs/core";
import { globalStore } from "./StoreRematch/Store";
import App from "./App/App";

const persistor = getPersistor();

ReactDOM.render(
<Provider store={globalStore}>
  <PersistGate loading={<Spinner />} persistor={persistor}>
    <App />
  </PersistGate>
</Provider>, document.getElementById("root"));
