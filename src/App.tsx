import React from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Main from "./views/Main";
import SplitPane from "react-split-pane/lib/SplitPane";
import Pane from "react-split-pane/lib/Pane";
import { connect } from 'redux-zero/react';

import "./assets/main.css";
import "./assets/scss/main.scss";
import CommitDetail from "./views/CommitDetail";
import FileViewer from "./views/FileViewer";
import Settings from "./views/Settings";
import Footer from "./components/Footer";
import { IStore } from './store/store';
import { ISelectedFile } from './utils/interfaces';
interface StoreProps {
  selectedFile: ISelectedFile;
}

const mapToProps = (state: IStore): StoreProps => ({
  selectedFile: state.selectedFile
});

const App = (props: StoreProps) => {
  return (
    <div className="bp3-dark flex flex-col h-screen">
      <Navbar />
      <div className="main-layout flex-1 relative">
        <SplitPane split="vertical">
          <Pane
            className={`sidebar ${props.selectedFile.path ? "hidden" : ""}`}
            minSize="210px"
            defaultSize="210px"
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
        <Settings />
      </div>
      <Footer />
    </div>
  );
};

export default connect<IStore>(mapToProps)(App);
