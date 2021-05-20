import * as React from "react";
import {
  Alignment,
  Button,
  Classes,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
  Tag,
} from "@blueprintjs/core";
import {
  FiFolderPlus as FolderIcon,
  FiBook as BookIcon,
  FiGitBranch as GitBranchIcon,
  FiSettings as SettingsIcon,
} from "react-icons/fi";

import { ICurrentCommit, ISettings } from "../utils/interfaces";
import { connect } from "redux-zero/react";
import { BoundActions } from "redux-zero/types/Actions";
import actions from "../store/actions";
import { IStore } from "../store/store";

const { dialog } = window.require("electron").remote;

interface StoreProps {
  folder: string;
  currentBranch: ICurrentCommit | null;
  settings: ISettings
}

const mapToProps = (state: IStore): StoreProps => ({
  folder: state.folder,
  currentBranch: state.currentBranch,
  settings: state.settings,
});

type NavProps = StoreProps & BoundActions<IStore, typeof actions>;

const Nav = (props: NavProps) => {
  const { folder, setFolder, currentBranch, setShowSettings, settings: {show: showSettings} } = props;

  const selectFolder = async () => {
    try {
      let [path] = await dialog.showOpenDialogSync({
        properties: ["openDirectory"],
      });
      setFolder(path);
    } catch (error) {
      console.log({ error });
    }
  };
  return (
    <Navbar>
      <NavbarGroup align={Alignment.LEFT}>
        <NavbarHeading>GitTree</NavbarHeading>
        <NavbarDivider />
        <Button
          className={Classes.MINIMAL}
          icon={<FolderIcon size={20} />}
          onClick={() => selectFolder()}
        />
        {folder && (
          <Tag
            icon={<BookIcon size={18} />}
            large
            minimal
            style={{ marginLeft: 10 }}
          >
            {folder}
          </Tag>
        )}
        {currentBranch && (
          <Tag
            icon={<GitBranchIcon size={18} />}
            large
            minimal
            style={{ marginLeft: 10 }}
          >
            {currentBranch.name}
          </Tag>
        )}
      </NavbarGroup>
      <NavbarGroup align={Alignment.RIGHT}>
        <Button
          className={Classes.MINIMAL}
          icon={<SettingsIcon size={20} />}
          onClick={() => setShowSettings(!showSettings)}
        />
      </NavbarGroup>
    </Navbar>
  );
};

export default connect<IStore>(mapToProps, actions)(Nav);
