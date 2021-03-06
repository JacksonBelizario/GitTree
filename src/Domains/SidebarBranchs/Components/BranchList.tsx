import React, { useState, useEffect, useCallback } from "react";
import { connect } from "react-redux";

import {
  Classes,
  Icon,
  Tree,
  ContextMenu,
  MenuItem,
  Menu,
  MenuDivider,
  Colors,
  TreeNodeInfo,
} from "@blueprintjs/core";
import {
  FiFolder as FolderIcon,
  FiGitBranch as GitBranchIcon
} from "react-icons/fi";

import { IReference } from "../../../Support/Interfaces";
import { Dispatch, RootState } from "../../../StoreRematch/Store";

const order = (a: TreeNodeInfo, b: TreeNodeInfo) => {
  return a.label > b.label ? 1 : -1;
};

const mapState = (state: RootState) => ({
  expandedMenu: state.expandedMenu,
  currentBranch: state.currentBranch,
});

const mapDispatch = (dispatch: Dispatch) => ({
  scrollToCommit: dispatch.selectedCommit.scrollToCommit,
  checkoutBranch: dispatch.selectedCommit.checkoutBranch,
  pull: dispatch.repo.pull,
  push: dispatch.repo.push,
  setExpandedMenu: dispatch.expandedMenu.setExpandedMenu,
});

type StateProps = ReturnType<typeof mapState>
type DispatchProps = ReturnType<typeof mapDispatch>

type BranchListProps = {
  branchs: IReference[];
} & StateProps & DispatchProps;

const BranchList = (props: BranchListProps) => {
  const { branchs, scrollToCommit, checkoutBranch, pull, push, expandedMenu, setExpandedMenu, currentBranch } = props;

  const [contents, setContents] = useState<TreeNodeInfo[]>([]);

  useEffect(() => {
    const placeBranchInFolder =(
      paths: string[],
      folder: TreeNodeInfo,
      branch: IReference,
      depth: number
    ) => {
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
            isSelected: branch.shorthand === currentBranch.shorthand,
            secondaryLabel: <div className="secondary-label">
                { !!branch.diff.ahead && <> {branch.diff.ahead} <Icon icon="arrow-up" iconSize={11} color={Colors.WHITE} /></> }
                { !!branch.diff.behind && <> {branch.diff.behind} <Icon icon="arrow-down" iconSize={11} color={Colors.WHITE} /></> }
              </div>,
            nodeData: branch,
          });
          folder.childNodes.sort(order);
        }
      } else {
        let currentFolder : TreeNodeInfo;
        if (folder.childNodes.filter(o => o.label === currentLabel && o.childNodes).length === 0) {
          let newFolder = {
            id: folder.childNodes.length,
            label: currentLabel,
            childNodes: [],
            isExpanded: expandedMenu.some(o => o === currentLabel),
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
    
    const buildList = (branchs: IReference[]) => {
      let rootFolder = { id: 0, label: "", childNodes: [] };
      branchs.forEach((b) => {
        let paths = b.shorthand.split("/");
        placeBranchInFolder(paths, rootFolder, b, 1);
      });
      return rootFolder.childNodes;
    };

    const items = buildList(branchs);
    setContents([...items]);
  }, [branchs, expandedMenu, currentBranch]);

  const handleNodeClick = (treeNode: TreeNodeInfo, _nodePath: number[], e: React.MouseEvent<HTMLElement>) => {
    if (!!treeNode.childNodes?.length) {
      treeNode.isExpanded ? onCollapse(treeNode) : onExpand(treeNode);
    } else {
      scrollToCommit(treeNode.nodeData['target']);
    }
  };
  const handleNodeDoubleClick = (treeNode: TreeNodeInfo, _nodePath: number[], e: React.MouseEvent<HTMLElement>) => {
    if (!treeNode.childNodes?.length) {
      checkoutBranch(treeNode.nodeData as IReference);
    }
  };
  const handleNodeCollapse = (treeNode: TreeNodeInfo) => {
    treeNode.isExpanded = false;
    setContents([...contents]);
    setExpandedMenu(expandedMenu.filter(menu => menu !== treeNode.label))
  };
  const handleNodeExpand = (treeNode: TreeNodeInfo) => {
    treeNode.isExpanded = true;
    setContents([...contents]);
    setExpandedMenu([...expandedMenu, treeNode.label.toString()])
  };
  const onExpand = useCallback(handleNodeExpand, [contents]); //eslint-disable-line
  const onCollapse = useCallback(handleNodeCollapse, [contents]); //eslint-disable-line
  const onNodeClick = useCallback(handleNodeClick, [contents]); //eslint-disable-line
  const onNodeDoubleClick = useCallback(handleNodeDoubleClick, [contents]); //eslint-disable-line

  const showContextMenu = (treeNode: TreeNodeInfo, path: number[], e: React.MouseEvent<HTMLElement>) => {
    const {nodeData} = treeNode;
    e.preventDefault();
    if (!!treeNode.childNodes?.length) {
      return;
    }
    const branch = nodeData as IReference;
    const branchName = branch['shorthand'];
    const isCurrent = branch['shorthand'] === currentBranch.shorthand;;
    const isLocalBranch = !!branch['isBranch'] && !branch['isRemote'];
    // @todo On remote branch check if has permission to delete
    ContextMenu.show(
      <Menu>
        {isLocalBranch && <MenuItem text={`Pull`} onClick={() => pull(branch) } />}
        {isLocalBranch && <MenuItem text={`Push`} onClick={() => push(branch) } />}
        {!isCurrent && <MenuItem text={`Checkout ${branchName}...`} onClick={() => checkoutBranch(branch)} />}
        <MenuDivider />
        {!isCurrent && <MenuItem disabled text={`Merge ${branchName} into current branch`} />}
        {!isCurrent && <MenuItem disabled text={`Rebase ${branchName} into current branch`} />}
        {!isCurrent && <MenuItem disabled text="Diff against current" />}
        <MenuItem disabled text="Copy branch name" />
        <MenuItem disabled text="Copy branch sha" />
        <MenuDivider />
        <MenuItem disabled text={"Rename " + branchName} />
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
      onNodeDoubleClick={onNodeDoubleClick}
      onNodeExpand={onExpand}
      className={Classes.ELEVATION_0}
    />
  );
};

//@ts-ignore
export default connect(mapState, mapDispatch)(BranchList);
