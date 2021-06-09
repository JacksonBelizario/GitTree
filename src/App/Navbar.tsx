import React, {useState, useEffect} from "react";
import { connect } from "redux-zero/react";
import { BoundActions } from "redux-zero/types/Actions";
import {
  Button,
  Classes,
  Dialog,
  InputGroup,
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

import { useInterval } from "../Support/Hooks";
import { IRepo, ICurrentCommit, ISettings, IRefs, IReference, IStore } from "../Support/Interfaces";
import { showDanger, showInfo, showWarning } from "../Support/Toaster";
import Actions from "../Store/Actions";
import Git from "../Services/Git";

import '../Assets/scss/navbar.scss'
import { Repository } from "nodegit";

const ONE_SECOND = 1000;

interface StoreProps {
  loading: boolean;
  repo: IRepo;
  folder: string;
  currentBranch: ICurrentCommit | null;
  settings: ISettings;
  refs: IRefs;
}

const mapToProps = (state: IStore): StoreProps => ({
  loading: state.loading,
  repo: state.repo,
  folder: state.folder,
  currentBranch: state.currentBranch,
  settings: state.settings,
  refs: state.refs,
});

type NavProps = StoreProps & BoundActions<IStore, typeof Actions>;

const Nav = (props: NavProps) => {
  const {
    loading,
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

  const [ref, setRef] = useState<IReference>(null);
  const [showCreateBranchDialog, setShowCreateBranchDialog] = useState<boolean>(false);
  const [branchName, setBranchName] = useState<string>('');

  useEffect(() => {
    if (currentBranch && refs.refDict && refs.refDict.hasOwnProperty(currentBranch.target)) {
      setRef(refs.refDict[currentBranch.target]);
    }
  }, [currentBranch, refs]);

  useInterval(() => {
    const fetch = async () => {
      if (!(repo instanceof Repository) || loading || showSettings) {
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
  
  const createBranch = async () => {
    if (branchName) {
      try {
        await Git.createBranch(repo, branchName);
        setBranchName('');
        setShowCreateBranchDialog(false)
        showInfo('Branch created');
      } catch(err) {
        console.warn(err);
        showDanger('Error on create branch: ' + err.message);
      }
    }
  }

  const saveStash = async () => {
    try {
      await Git.saveStash(repo);
    } catch(err) {
      console.warn(err);
      showDanger(err.message);
    }
  }

  const popStash = async () => {
    try {
      await Git.popStash(repo);
    } catch(err) {
      console.warn(err);
      showDanger(err.message);
    }
  }

  return (
    <>
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
            {currentBranch.shorthand}
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
            { !!ref && !!ref.diff && !!ref.diff.behind && <div className="badge">{ref.diff.behind}</div> }
          </Button>
          <Button
            className={Classes.MINIMAL}
            icon={<ArrowUpIcon size={20} />}
            text="Push"
            onClick={() => push()}
          >
            { !!ref && !!ref.diff && !!ref.diff.ahead && <div className="badge">{ref.diff.ahead}</div> }
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
            onClick={() => setShowCreateBranchDialog(true)}
          />
          <NavbarDivider />
          <Button
            className={Classes.MINIMAL}
            icon={<StashIcon size={20} />}
            text="Stash"
            onClick={() => saveStash()}
          />
          <Button
            className={Classes.MINIMAL}
            icon={<PopStashIcon size={20} />}
            text="Pop"
            onClick={() => popStash()}
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
    <Dialog
      className="bp3-dark"
      onClose={() => setShowCreateBranchDialog(false)}
      isOpen={showCreateBranchDialog}
      style={{width: 350}}
    >
      <form
        className={Classes.DIALOG_BODY}
        onSubmit={e => {e.preventDefault(); createBranch();}}
      >
        <p className="flex items-center">
          <span className="pr-2">Current Branch:</span>
          <Tag
            icon={<GitBranchIcon size={18} />}
            minimal
          >
            {currentBranch && currentBranch.shorthand}
          </Tag>
        </p>
        <InputGroup
          autoFocus
          placeholder="Name"
          value={branchName}
          onChange={({target}) => setBranchName(target.value)}
        />
      </form>
      <div className={Classes.DIALOG_FOOTER}>
        <Button
          intent={Intent.PRIMARY}
          disabled={!branchName}
          fill
          small
          onClick={() => createBranch()}
        >
          Create branch
        </Button>
      </div>
    </Dialog>
    </>
  );
};

export default connect<IStore>(mapToProps, Actions)(Nav);
