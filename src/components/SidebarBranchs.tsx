import React, { useState, useEffect, useCallback } from "react";

import {
  Classes,
  ITreeNode,
  Tree,
  ContextMenu,
  MenuItem,
  Menu,
  MenuDivider,
} from "@blueprintjs/core";
import {
  FiFolder as FolderIcon,
  FiGitBranch as GitBranchIcon
} from "react-icons/fi";
import { IReference } from "../utils/interfaces";

const buildList = (branchs: IReference[]) => {
  let rootFolder = { id: 0, label: "", childNodes: [] };
  branchs.forEach((b) => {
    let paths = b.shorthand.split("/");
    placeBranchInFolder(paths, rootFolder, b, 1);
  });
  return rootFolder.childNodes;
};

const order = (a: any, b: any) => {
  return a.label > b.label ? 1 : -1;
};

function placeBranchInFolder(
  paths: string[],
  folder: ITreeNode,
  branch: IReference,
  depth: number
) {
  if (!folder) {
    return;
  }
  let currentLabel = paths[0];
  if (paths.length === 1) {
    if (folder.childNodes.findIndex(o => o.label === currentLabel) === -1) {
      folder.childNodes.push({
        id: `${folder.id}_${folder.childNodes.length}`,
        label: currentLabel,
        icon: <GitBranchIcon size={15} style={{ marginRight: "10px" }} />,
        isSelected: !!branch.isCurrent,
        secondaryLabel: branch.diff ? <div style={{fontSize: 11}}>{branch.diff}</div> : null,
        nodeData: branch,
      });
      folder.childNodes.sort(order);
    }
  } else {
    let currentFolder;
    if (folder.childNodes.filter(o => o.label === currentLabel && o.childNodes).length === 0) {
      let newFolder = {
        id: folder.childNodes.length,
        label: currentLabel,
        childNodes: [],
        isExpanded: false,
        icon: <FolderIcon size={15} style={{ marginRight: "10px" }} />,
      };
      folder.childNodes.push(newFolder);
      folder.childNodes.sort(order);
      currentFolder = newFolder;
    } else {
      currentFolder = folder.childNodes.find(o => o.label === currentLabel);
    }
    placeBranchInFolder(
      paths.splice(1, paths.length),
      currentFolder,
      branch,
      depth + 1
    );
  }
}

interface SidebarBranchsProps {
  branchs: IReference[];
  scrollToCommit: Function;
}

const SidebarBranchs = (props: SidebarBranchsProps) => {
  const { branchs, scrollToCommit } = props;

  const [contents, setContents] = useState<ITreeNode[]>([]);

  useEffect(() => {
    const items = buildList(branchs);
    setContents([...items]);
  }, [branchs]);

  const handleNodeClick = (treeNode: ITreeNode, _nodePath: number[], e: React.MouseEvent<HTMLElement>) => {
    if (!!treeNode.childNodes?.length) {
      treeNode.isExpanded ? onCollapse(treeNode) : onExpand(treeNode);
    } else {
      scrollToCommit(treeNode.nodeData['target']);
    }
  };
  const handleNodeCollapse = (treeNode: ITreeNode) => {
    treeNode.isExpanded = false;
    setContents([...contents]);
  };
  const handleNodeExpand = (treeNode: ITreeNode) => {
    treeNode.isExpanded = true;
    setContents([...contents]);
  };
  const onExpand = useCallback(handleNodeExpand, [contents]);
  const onCollapse = useCallback(handleNodeCollapse, [contents]);
  const onNodeClick = useCallback(handleNodeClick, [contents]);

  const showContextMenu = (treeNode: ITreeNode, path: number[], e: React.MouseEvent<HTMLElement>) => {
    const {nodeData: branch} = treeNode;
    e.preventDefault();
    if (!!treeNode.childNodes?.length) {
      return;
    }
    const branchName = branch['shorthand'];
    const isCurrent = branch['isCurrent'];
    const isLocalBranch = !!branch['isBranch'] && !branch['isRemote'];
    // @todo On remote branch check if has permission to delete
    ContextMenu.show(
      <Menu>
        {isLocalBranch && <MenuItem text={`Pull`} />}
        {isLocalBranch && <MenuItem text={`Push`} />}
        {!isCurrent && <MenuItem text={`Checkout ${branchName}...`} />}
        <MenuDivider />
        {!isCurrent && <MenuItem text={`Merge ${branchName} into current branch`} />}
        {!isCurrent && <MenuItem text={`Rebase ${branchName} into current branch`} />}
        {!isCurrent && <MenuItem disabled text="Diff against current" />}
        <MenuItem text="Copy branch name" />
        <MenuItem text="Copy branch sha" />
        <MenuDivider />
        <MenuItem text={"Rename " + branchName} />
        <MenuItem disabled text={"Delete " + branchName} /> 
      </Menu>,
      { left: e.clientX, top: e.clientY },
      null,
      true // isDarkTheme
    );
  };

  return (
    <Tree
      contents={contents}
      onNodeContextMenu={showContextMenu}
      onNodeCollapse={onCollapse}
      onNodeClick={onNodeClick}
      onNodeExpand={onExpand}
      className={Classes.ELEVATION_0}
    />
  );
};

export default SidebarBranchs;
