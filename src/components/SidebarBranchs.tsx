import React from 'react';

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
    children: any[];
    icon?: any;
}

interface SidebarBranchsProps {
    branchs: IReference[];
}

const SidebarBranchs = (props: SidebarBranchsProps) => {
    const { branchs } = props;

    const [nodes, setNodes] = React.useState<ITreeNode[]>([]);

    React.useEffect(() => {
        const items = buildList(branchs);
        console.log({items});
        setNodes([...items])
    }, [branchs]);

    const buildList = (branchs: IReference[]) => {
        let rootFolder = { id: 0, label: "", children: [] };
        branchs.forEach(b => {
            let paths = b.shorthand.split('/');
            placeBranchInFolder(paths, rootFolder, b, 1);
        });
        return rootFolder.children;
    }

    const order = (a : any, b : any) => {
        return (a.label > b.label) ? 1 : -1;
    }

    function placeBranchInFolder (paths : string[], folder : IFolder, branch : IReference, depth: number) {
        if (!folder) {
            return;
        }
        if (paths.length === 1) {
            if (folder.children.map(_ => _.label).indexOf(paths[0]) === -1) {
                folder.children.push({
                    id: `${folder.id}_${folder.children.length}`,
                    label: paths[0],
                    icon: <GitBranchIcon size={16} style={{marginRight: '10px'}} />,
                    ...branch
                })
                folder.children.sort(order);
            }
        } else {
            let currentFolderPath = paths[0];
            let currentFolder;
            if (folder.children.filter(_ => _.label === currentFolderPath && _.children).length === 0) {
                let newFolder = {
                    id: folder.children.length,
                    label: currentFolderPath,
                    children: [],
                    isExpanded: true,
                    icon: <FolderIcon size={16} style={{marginRight: '10px'}} />
                };
                folder.children.push(newFolder);
                folder.children.sort(order);
                currentFolder = newFolder;
            } else {
                currentFolder = folder.children.filter(_ => _.label === currentFolderPath && _.items)[0];
            }
            placeBranchInFolder(paths.splice(1, paths.length), currentFolder, branch, depth + 1);
        }
    }

    const handleNodeClick = (nodeData : ITreeNode, _nodePath : number[], e: React.MouseEvent<HTMLElement>) =>  {
        nodeData.isExpanded ? onCollapse(nodeData) : onExpand(nodeData);
        console.log({nodes});
     };
     const handleNodeCollapse = (nodeData : ITreeNode) => {
         nodeData.isExpanded = false;
         setNodes([...nodes]);
 
     };
     const handleNodeExpand = (nodeData : ITreeNode) => {
         nodeData.isExpanded = true;
         setNodes([...nodes]);
     };
     const onExpand = React.useCallback(handleNodeExpand, []);
     const onCollapse = React.useCallback(handleNodeCollapse, []);
     const onNodeClick = React.useCallback(handleNodeClick, []);

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
            contents={nodes}
            onNodeContextMenu={showContextMenu}
            onNodeCollapse={onCollapse}
            onNodeClick={onNodeClick}
            onNodeExpand={onExpand}
            className={Classes.ELEVATION_0}
        />
     );
}

export default SidebarBranchs;