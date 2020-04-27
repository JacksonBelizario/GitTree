import React, { useState, useEffect } from "react";

import { Classes, Button, IButtonProps, Divider } from "@blueprintjs/core";

import {
  Monitor as MonitorIcon,
  Cloud as CloudIcon,
  Inbox as InboxIcon,
  Layers as LayersIcon,
  Tag as TagIcon,
} from "react-feather";

import { IReference, ICommit, IRepo } from "../utils/interfaces";
import { connect } from "redux-zero/react";
import { IStore } from "../store/store";

import SidebarBranchs from "./SidebarBranchs";
import { Submodule } from "nodegit";
import actions from "../store/actions";
import { BoundActions } from "redux-zero/types";

interface ISidebarBtn extends IButtonProps {
  icon: any;
}
const SidebarBtn: React.StatelessComponent<ISidebarBtn> = (props) => {
  let { icon, children, ...rest } = props;
  let CustomIcon = (props: any) => ({ ...icon, size: props.size });

  return (
    <Button
      icon={<CustomIcon />}
      {...rest}
      className={Classes.MINIMAL + " " + Classes.ALIGN_LEFT}
      style={{
        width: "100%",
        borderRadius: 0,
        borderBottom: "1px solid #282c34",
      }}
    >
      {children}
    </Button>
  );
};

interface StoreProps {
  local: IReference[];
  remote: IReference[];
  tags: IReference[];
  stashs: ICommit[];
  repo: IRepo;
}

const mapToProps = (state: IStore): StoreProps => ({
  local: state.refs.references.filter((_) => _.isBranch),
  remote: state.refs.references.filter((_) => _.isRemote),
  tags: state.refs.references.filter((_) => _.isTag),
  stashs: state.commits.filter((_) => _.isStash),
  repo: state.repo,
});

type SidebarProps = StoreProps & BoundActions<IStore, typeof actions>;

const Sidebar = (props: SidebarProps) => {
  const { local, remote, tags, stashs, repo, scrollToCommit } = props;

  const [showLocal, setShowLocal] = useState<boolean>(true);
  const [showRemote, setShowRemote] = useState<boolean>(false);
  const [showTags, setShowTags] = useState<boolean>(false);
  const [showStashs, setShowStashs] = useState<boolean>(true);
  const [showSubmodules, setShowSubmodules] = useState<boolean>(true);
  const [submodules, setSubmodules] = useState<any[]>([]);

  const getSubmodules = async (Repo: any) => {
    if (Repo && Repo.getSubmodules) {
      setSubmodules(await Repo.getSubmodules());
    }
  };

  useEffect(() => {
    getSubmodules(repo);
  }, [repo]);

  return (
    <>
      <SidebarBtn
        icon={<MonitorIcon size={18} />}
        onClick={() => setShowLocal(!showLocal)}
      >
        Local
      </SidebarBtn>
      {showLocal && (
        <SidebarBranchs branchs={local} scrollToCommit={scrollToCommit} />
      )}
      <SidebarBtn
        icon={<CloudIcon size={18} />}
        onClick={() => setShowRemote(!showRemote)}
      >
        Remote
      </SidebarBtn>
      {showRemote && (
        <SidebarBranchs branchs={remote} scrollToCommit={scrollToCommit} />
      )}
      <SidebarBtn
        icon={<InboxIcon size={18} />}
        onClick={() => setShowStashs(!showStashs)}
      >
        Stashes
      </SidebarBtn>
      {showStashs &&
        stashs.map((stash: ICommit, idx: number) => (
          <Button
            key={idx}
            icon={<InboxIcon size={15} />}
            className={Classes.MINIMAL + " " + Classes.ALIGN_LEFT}
            style={{ paddingLeft: 30, paddingRight: 10, width: "100%" }}
            onClick={() => scrollToCommit(stash.sha)}
          >
            {stash.message}
          </Button>
        ))}
      {showStashs && !!stashs.length && <Divider style={{ margin: 0 }} />}
      <SidebarBtn
        icon={<TagIcon size={18} />}
        onClick={() => setShowTags(!showTags)}
      >
        Tags
      </SidebarBtn>
      {showTags && (
        <SidebarBranchs branchs={tags} scrollToCommit={scrollToCommit} />
      )}
      <SidebarBtn
        icon={<LayersIcon size={18} />}
        onClick={() => setShowSubmodules(!showSubmodules)}
      >
        Submodules
      </SidebarBtn>
      {showSubmodules &&
        submodules.map((submodule: Submodule, idx: number) => (
          <Button
            key={idx}
            icon={<LayersIcon size={15} />}
            className={Classes.MINIMAL + " " + Classes.ALIGN_LEFT}
            style={{ paddingLeft: 30, paddingRight: 10, width: "100%" }}
          >
            {submodule.path()}
          </Button>
        ))}
      {showStashs && !!stashs.length && <Divider style={{ margin: 0 }} />}
    </>
  );
};

export default connect<IStore>(mapToProps, actions)(Sidebar);
