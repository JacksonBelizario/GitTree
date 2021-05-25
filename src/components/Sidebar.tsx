import React, { useState, useEffect, FunctionComponent } from "react";

import { Classes, Button, IButtonProps, Divider } from "@blueprintjs/core";

import {
  FiMonitor as MonitorIcon,
  FiCloud as CloudIcon,
  FiInbox as InboxIcon,
  FiLayers as LayersIcon,
  FiTag as TagIcon,
} from "react-icons/fi";

import { IRefs, IReference, ICommit, IRepo } from "../utils/interfaces";
import { connect } from "redux-zero/react";
import { IStore } from "../store/store";

import SidebarBranchs from "./SidebarBranchs";
import { Submodule } from "nodegit";
import actions from "../store/actions";
import { BoundActions } from "redux-zero/types";

interface ISidebarBtn extends IButtonProps {
  icon: any;
}
const SidebarBtn: FunctionComponent<ISidebarBtn> = (props) => {
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
  refs: IRefs;
  commits: ICommit[];
  repo: IRepo;
}

const mapToProps = (state: IStore): StoreProps => ({
  refs: state.refs,
  commits: state.commits,
  repo: state.repo,
});

type SidebarProps = StoreProps & BoundActions<IStore, typeof actions>;

const Sidebar = (props: SidebarProps) => {
  const { refs: {references}, commits, repo, scrollToCommit } = props;

  const [showLocal, setShowLocal] = useState<boolean>(true);
  const [showRemote, setShowRemote] = useState<boolean>(false);
  const [showTags, setShowTags] = useState<boolean>(false);
  const [showStashs, setShowStashs] = useState<boolean>(true);
  const [showSubmodules, setShowSubmodules] = useState<boolean>(true);

  const [local, setLocal] = useState<IReference[]>([]);
  const [remote, setRemote] = useState<IReference[]>([]);
  const [tags, setTags] = useState<IReference[]>([]);
  const [stashs, setStashs] = useState<ICommit[]>([]);
  const [submodules, setSubmodules] = useState<any[]>([]);

  useEffect(() => {
    setLocal(references.filter(o => o.isBranch))
    setRemote(references.filter(o => o.isRemote))
    setTags(references.filter(o => o.isTag))
  }, [references]);

  useEffect(() => {
    setStashs(commits.filter(o => o.isStash))
  }, [commits]);

  useEffect(() => {
    const getSubmodules = async (Repo: any) => {
      if (Repo && Repo.getSubmodules) {
        setSubmodules(await Repo.getSubmodules());
      }
    };

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
