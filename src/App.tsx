import React from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Main from './views/Main';
import { Provider } from "redux-zero/react";
import store from "./store/store";

import './assets/scss/main.scss';

const App = () => {
  return (
    <Provider store={store}>
      <div className="bp3-dark">
        <Navbar />
        <div className="main-layout">
          <div className="sidebar"><Sidebar /></div>
          <div className="App-header section">
            <Main />
          </div>
        </div>
      </div>
    </Provider>
  );
}

export default App;
