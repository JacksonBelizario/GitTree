import React from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Main from "./views/Main";
import { Provider } from "redux-zero/react";
import store from "./store/store";
// import SplitPane, { Pane } from 'react-split-pane';
import SplitPane from "react-split-pane/lib/SplitPane";
import Pane from "react-split-pane/lib/Pane";
import CommitDetail from "./views/CommitDetail";

import "./assets/main.css";
import "./assets/scss/main.scss";
import FileViewer from "./views/FileViewer";
import Footer from "./components/Footer";

const App = () => {
  return (
    <Provider store={store}>
      <div className="bp3-dark flex flex-col h-screen">
        <Navbar />
        <div className="main-layout flex-1">
          <SplitPane split="vertical">
            <Pane
              className="sidebar"
              minSize="210px"
              defaultSize="250px"
              maxSize="390px"
            >
              <Sidebar />
            </Pane>
            <div className="relative h-full">
              <Main />
              <FileViewer />
            </div>
            <Pane minSize="300px" defaultSize="350px" maxSize="500px">
              <CommitDetail />
            </Pane>
          </SplitPane>
        </div>
        <Footer />
      </div>
    </Provider>
  );
};

export default App;
