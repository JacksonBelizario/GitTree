import * as React from "react";
import {
  Button,
  Classes,
  Intent,
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
  FiArrowDown as ArrowDownIcon,
  FiArrowUp as ArrowUpIcon,
  FiGitMerge as GitMergeIcon,
  FiTag as TagIcon
} from "react-icons/fi";
import {
  RiInboxArchiveLine as StashIcon,
  RiInboxUnarchiveLine as PopStashIcon,
} from "react-icons/ri";
import {
  BsTerminal as TerminalIcon,
} from "react-icons/bs";

import Git from "../utils/git";
import { useInterval } from "../utils/hooks";
import { IRepo, ICurrentCommit, ISettings } from "../utils/interfaces";
import { connect } from "redux-zero/react";
import { BoundActions } from "redux-zero/types/Actions";
import actions from "../store/actions";
import { IStore } from "../store/store";
import { AppToaster } from "../utils/toaster";

import '../assets/scss/navbar.scss'

const { dialog } = window.require("electron").remote;

const ONE_SECOND = 1000;

interface StoreProps {
  repo: IRepo;
  folder: string;
  currentBranch: ICurrentCommit | null;
  settings: ISettings
}

const mapToProps = (state: IStore): StoreProps => ({
  repo: state.repo,
  folder: state.folder,
  currentBranch: state.currentBranch,
  settings: state.settings,
});

type NavProps = StoreProps & BoundActions<IStore, typeof actions>;

const Nav = (props: NavProps) => {
  const {
    repo,
    folder,
    setFolder,
    currentBranch,
    setShowSettings,
    settings: {
      show: showSettings,
      general: { fetchInterval },
      auth
    },
    setExpandedMenu
  } = props;

  const selectFolder = async () => {
    try {
      let [path] = await dialog.showOpenDialogSync({
        properties: ["openDirectory"],
      });
      setFolder(path);
      setExpandedMenu([]);
    } catch (error) {
      console.log({ error });
    }
  };

  useInterval(() => {
    const fetch = async () => {
      if (!repo || showSettings) {
        return;
      }
      try {
        await Git.fetchAll(repo, auth);
      }
      catch(err) {
        AppToaster.show({
          icon: "warning-sign",
          intent: Intent.WARNING,
          message: <span>Error to fetch remotes<br />{err.message}</span>,
          action: {
              onClick: () => setShowSettings(true),
              text: "Settings",
          },
        })
      }
    };

    fetch();
  }, fetchInterval * ONE_SECOND);

  return (
    <Navbar>
      <NavbarGroup>
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
            {folder.split('\\').slice(-1)[0]}
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
        <NavbarGroup className="actions-btn">
          <Button
            className={Classes.MINIMAL}
            icon={<ArrowDownIcon size={20} />}
            text="Pull"
          />
          <Button
            className={Classes.MINIMAL}
            icon={<ArrowUpIcon size={20} />}
            text="Push"
          />
          <NavbarDivider />
          <Button
            className={Classes.MINIMAL}
            icon={<GitMergeIcon size={20} />}
            text="Merge"
          />
          <Button
            className={Classes.MINIMAL}
            icon={<GitBranchIcon size={20} />}
            text="Branch"
          />
          <NavbarDivider />
          <Button
            className={Classes.MINIMAL}
            icon={<StashIcon size={20} />}
            text="Stash"
          />
          <Button
            className={Classes.MINIMAL}
            icon={<PopStashIcon size={20} />}
            text="Pop"
          />
          <NavbarDivider />
          <Button
            className={Classes.MINIMAL}
            icon={<TagIcon size={20} />}
            text="Tag"
          />
      </NavbarGroup>
      <NavbarGroup>
        <div className="spacer"></div>
        <Button
          className={Classes.MINIMAL}
          icon={<TerminalIcon size={25} />}
        />
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
