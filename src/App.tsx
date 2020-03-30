import React from 'react';
import logo from './logo.svg';
import './App.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import './assets/scss/main.scss';

const App = () => {
  return (
    <div className="bp3-dark">
      <Navbar />
      <div className="main-layout">
        <div className="sidebar"><Sidebar /></div>
        <div className="App-header section">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
