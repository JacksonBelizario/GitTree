import React, { useState, useEffect, useCallback } from 'react';

import {
    Classes, ITreeNode,
    Tree, ContextMenu, MenuItem, Menu, MenuDivider
} from '@blueprintjs/core';
import {
    Folder as FolderIcon,
    GitBranch as GitBranchIcon
} from 'react-feather';
import { IReference } from "../utils/interfaces";

declare interface IFolder {
    id: number;
    label: string;
    childNodes: any[];
    icon?: any;
}

const buildList = (branchs: IReference[]) => {
    let rootFolder = { id: 0, label: "", childNodes: [] };
    branchs.forEach(b => {
        let paths = b.shorthand.split('/');
        placeBranchInFolder(paths, rootFolder, b, 1);
    });
    return rootFolder.childNodes;
}

const order = (a : any, b : any) => {
    return (a.label > b.label) ? 1 : -1;
}

function placeBranchInFolder (paths : string[], folder : IFolder, branch : IReference, depth: number) {
    if (!folder) {
        return;
    }
    if (paths.length === 1) {
        if (folder.childNodes.findIndex(_ => _.label === paths[0]) === -1) {
            folder.childNodes.push({
                id: `${folder.id}_${folder.childNodes.length}`,
                label: paths[0],
                icon: <GitBranchIcon size={16} style={{marginRight: '10px'}} />,
                ...branch
            })
            folder.childNodes.sort(order);
        }
    } else {
        let currentFolderPath = paths[0];
        let currentFolder;
        if (folder.childNodes.filter(_ => _.label === currentFolderPath && _.childNodes).length === 0) {
            let newFolder = {
                id: folder.childNodes.length,
                label: currentFolderPath,
                childNodes: [],
                isExpanded: false,
                icon: <FolderIcon size={16} style={{marginRight: '10px'}} />
            };
            folder.childNodes.push(newFolder);
            folder.childNodes.sort(order);
            currentFolder = newFolder;
        } else {
            currentFolder = folder.childNodes.find(_ => _.label === currentFolderPath);
        }
        placeBranchInFolder(paths.splice(1, paths.length), currentFolder, branch, depth + 1);
    }
}

interface SidebarBranchsProps {
    branchs: IReference[];
}

const SidebarBranchs = (props: SidebarBranchsProps) => {
    const { branchs } = props;

    const [contents, setContents] = useState<ITreeNode[]>([]);

    useEffect(() => {
        const items = buildList(branchs);
        setContents([...items])
    }, [branchs]);

    const handleNodeClick = (nodeData : ITreeNode, _nodePath : number[], e: React.MouseEvent<HTMLElement>) =>  {
        nodeData.isExpanded ? onCollapse(nodeData) : onExpand(nodeData);
     };
     const handleNodeCollapse = (nodeData : ITreeNode) => {
         nodeData.isExpanded = false;
         setContents([...contents]);
 
     };
     const handleNodeExpand = (nodeData : ITreeNode) => {
         nodeData.isExpanded = true;
         setContents([...contents]);
     };
     const onExpand = useCallback(handleNodeExpand, [contents]);
     const onCollapse = useCallback(handleNodeCollapse, [contents]);
     const onNodeClick = useCallback(handleNodeClick, [contents]);

     const showContextMenu = (nodeData : ITreeNode, path : number[], e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        ContextMenu.show(
            <Menu>
                <MenuItem icon="search-around" text="Search around..."/>
                <MenuItem icon="search" text="Object viewer"/>
                <MenuItem icon="graph-remove" text="Remove"/>
                <MenuItem icon="group-objects" text="Group"/>
                <MenuDivider/>
                <MenuItem disabled={true} text="Clicked on node"/>
            </Menu>,
            {left: e.clientX, top: e.clientY}
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
}

export default SidebarBranchs;