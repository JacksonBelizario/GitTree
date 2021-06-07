import React from "react";
import { connect } from 'redux-zero/react';
import Pane from "react-split-pane/lib/Pane";
import SplitPane from "react-split-pane/lib/SplitPane";
import { Spinner, Intent, FocusStyleManager } from "@blueprintjs/core";

import { ISelectedFile, IStore } from '../Support/Interfaces';

import Navbar from "./Navbar";
import Footer from "./Footer";

import SidebarBranchs from "../Domains/SidebarBranchs/Index";
import SidebarCommitDetail from "../Domains/SidebarCommitDetail/Index";
import Subway from "../Domains/Subway/Index";
import FileViewer from "../Domains/FileViewer/Index";
import Settings from "../Domains/Settings/Index";

import "react-perfect-scrollbar/dist/css/styles.css";
import "../Assets/main.css";
import "../Assets/scss/main.scss";

interface StoreProps {
  loading: boolean;
  selectedFile: ISelectedFile;
}
 
FocusStyleManager.onlyShowFocusOnTabs();

const mapToProps = (state: IStore): StoreProps => ({
  loading: state.loading,
  selectedFile: state.selectedFile
});

const App = (props: StoreProps) => {
  return (
    <div className="bp3-dark flex flex-col h-screen">
      { props.loading &&
          <div className="loading-content">
          <Spinner intent={Intent.PRIMARY} size={100} />
        </div>
      }
      <Navbar />
      <div className="main-layout flex-1 relative">
        <SplitPane split="vertical">
          <Pane
            className={`sidebar ${props.selectedFile.file ? "hidden" : ""}`}
            minSize="210px"
            defaultSize="210px"
            maxSize="390px"
          >
            <SidebarBranchs />
          </Pane>
          <div className="relative h-full">
            <Subway />
            <FileViewer />
          </div>
          <Pane minSize="300px" defaultSize="350px" maxSize="500px">
            <SidebarCommitDetail />
          </Pane>
        </SplitPane>
        <Settings />
      </div>
      <Footer />
    </div>
  );
};

export default connect<IStore>(mapToProps)(App);
