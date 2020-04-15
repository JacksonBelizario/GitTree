import React from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Main from './views/Main';
import { Provider } from "redux-zero/react";
import store from "./store/store";
import SplitPane, { Pane } from 'react-split-pane';

import './assets/scss/main.scss';

const App = () => {
  return (
    <Provider store={store}>
      <div className="bp3-dark">
        <Navbar />
        <SplitPane className="main-layout" split="vertical" minSize={210} defaultSize={250} maxSize={390}>
          <Sidebar />
          <Main />
        </SplitPane>
      </div>
    </Provider>
  );
}

export default App;
