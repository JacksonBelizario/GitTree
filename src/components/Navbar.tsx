import React from "react";
import {
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
import { IRepo, ICurrentCommit, ISettings, IRefs } from "../utils/interfaces";
import { connect } from "redux-zero/react";
import { BoundActions } from "redux-zero/types/Actions";
import actions from "../store/actions";
import { IStore } from "../store/store";
import { showWarning } from "../utils/toaster";

import '../assets/scss/navbar.scss'

const ONE_SECOND = 1000;

interface StoreProps {
  repo: IRepo;
  folder: string;
  currentBranch: ICurrentCommit | null;
  settings: ISettings;
  refs: IRefs;
}

const mapToProps = (state: IStore): StoreProps => ({
  repo: state.repo,
  folder: state.folder,
  currentBranch: state.currentBranch,
  settings: state.settings,
  refs: state.refs,
});

type NavProps = StoreProps & BoundActions<IStore, typeof actions>;

const Nav = (props: NavProps) => {
  const {
    repo,
    folder,
    openRepo,
    currentBranch,
    setShowSettings,
    settings: {
      show: showSettings,
      general: { fetchInterval },
      auth
    },
    pull,
    push,
    refs
  } = props;

  const [ref] = refs.refDict[currentBranch.target] || [];

  useInterval(() => {
    const fetch = async () => {
      if (!repo || showSettings) {
        return;
      }
      try {
        await Git.fetchAll(repo, auth);
      }
      catch(err) {
        showWarning(
          <>Error to fetch remotes<br />{err.message}</>,
          { text: "Settings", onClick: () => setShowSettings(true) }
        )
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
          onClick={() => openRepo()}
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
            onClick={() => pull()}
          >
            { !!ref && !!ref.diff.behind && <div className="badge">{ref.diff.behind}</div> }
          </Button>
          <Button
            className={Classes.MINIMAL}
            icon={<ArrowUpIcon size={20} />}
            text="Push"
            onClick={() => push()}
          >
            { !!ref && !!ref.diff.ahead && <div className="badge">{ref.diff.ahead}</div> }
          </Button>
          <NavbarDivider />
          <Button
            className={Classes.MINIMAL}
            icon={<GitMergeIcon size={20} />}
            text="Merge"
            disabled
          />
          <Button
            className={Classes.MINIMAL}
            icon={<GitBranchIcon size={20} />}
            text="Branch"
            disabled
          />
          <NavbarDivider />
          <Button
            className={Classes.MINIMAL}
            icon={<StashIcon size={20} />}
            text="Stash"
            disabled
          />
          <Button
            className={Classes.MINIMAL}
            icon={<PopStashIcon size={20} />}
            text="Pop"
            disabled
          />
          <NavbarDivider />
          <Button
            className={Classes.MINIMAL}
            icon={<TagIcon size={20} />}
            text="Tag"
            disabled
          />
      </NavbarGroup>
      <NavbarGroup>
        <div className="spacer"></div>
        <Button
          className={Classes.MINIMAL}
          icon={<TerminalIcon size={25} />}
          disabled
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
