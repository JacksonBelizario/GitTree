import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Main from './views/Main';

import './assets/scss/main.scss';

const App = () => {
  return (
    <div className="bp3-dark">
      <Navbar />
      <div className="main-layout">
        <div className="sidebar"><Sidebar /></div>
        <div className="App-header section">
          <Main />
        </div>
      </div>
    </div>
  );
}

export default App;
