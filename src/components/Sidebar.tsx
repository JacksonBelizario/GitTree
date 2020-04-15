import * as React from "react";

import {
    Classes, Icon, Intent, ITreeNode, Position, Tooltip,
    Tree, ContextMenu, MenuItem, Menu, MenuDivider
} from '@blueprintjs/core';
import {
    HardDrive as HardDriveIcon,
    Cloud as CloudIcon,
    Inbox as InboxIcon,
    Layers as LayersIcon,
    Tag as TagIcon,
    Folder as FolderIcon,
    GitBranch as GitBranchIcon
} from 'react-feather';


// use Component so it re-renders everytime: `nodes` are not a primitive type
// and therefore aren't included in shallow prop comparison
const Sidebar = () => {
    const [menuItem, setMenuItem] = React.useState<ITreeNode[]>([
        {
            id: 0,
            hasCaret: false,
            icon: <HardDriveIcon size={18} style={{marginRight: '10px'}} />,
            label: "Local",
            childNodes: [
                {
                    id: 2,
                    icon: <GitBranchIcon size={16} style={{marginRight: '10px'}} />,
                    label: "master",
                    secondaryLabel: (
                        <Tooltip content="An eye!">
                            <Icon icon="eye-open" />
                        </Tooltip>
                    ),
                },
                {
                    id: 3,
                    icon: <GitBranchIcon size={16} style={{marginRight: '10px'}} />,
                    label: "staging",
                },
                {
                    id: 4,
                    hasCaret: false,
                    icon: <FolderIcon size={16} style={{marginRight: '10px'}} />,
                    isExpanded: true,
                    label: (
                        <Tooltip content="foo" position={Position.RIGHT}>
                            feature
                        </Tooltip>
                    ),
                    childNodes: [
                        { id: 5, label: "label-1", icon: <GitBranchIcon size={16} style={{marginRight: '10px'}} /> },
                        { id: 6, label: "label-2", icon: <GitBranchIcon size={16} style={{marginRight: '10px'}} /> },
                        {
                            id: 7,
                            hasCaret: false,
                            icon: <FolderIcon size={16} style={{marginRight: '10px'}} />,
                            label: "folder",
                            isExpanded: false,
                            childNodes: [
                                { id: 8, label: "label-3", icon: <GitBranchIcon size={16} style={{marginRight: '10px'}} /> },
                                { id: 9, label: "label-4", icon: <GitBranchIcon size={16} style={{marginRight: '10px'}} /> },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            id: 1,
            hasCaret: false,
            icon: <CloudIcon size={18} style={{marginRight: '10px'}} />,
            label: (
                <Tooltip content="I'm a folder <3" position={Position.RIGHT}>
                    Remote
                </Tooltip>
            ),
        },
        {
            id: 2,
            hasCaret: false,
            icon: <InboxIcon size={18} style={{marginRight: '10px'}} />,
            label: "Stashes",
        },
        {
            id: 3,
            hasCaret: false,
            icon: <TagIcon size={18} style={{marginRight: '10px'}} />,
            label: "Tags",
        },
        {
            id: 4,
            hasCaret: false,
            icon: <LayersIcon size={18} style={{marginRight: '10px'}} />,
            label: "Submodules",
        },
    ])

    const handleNodeClick = (nodeData : ITreeNode, _nodePath : number[], e: React.MouseEvent<HTMLElement>) =>  {
        nodeData.isExpanded ? onCollapse(nodeData) : onExpand(nodeData);
     };
     const handleNodeCollapse = (nodeData : ITreeNode) => {
         nodeData.isExpanded = false;
         setMenuItem([...menuItem]);
 
     };
     const handleNodeExpand = (nodeData : ITreeNode) => {
         nodeData.isExpanded = true;
         setMenuItem([...menuItem]);
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
            contents={menuItem}
            onNodeContextMenu={showContextMenu}
            onNodeCollapse={onCollapse}
            onNodeClick={onNodeClick}
            onNodeExpand={onExpand}
            className={Classes.ELEVATION_0}
        />
    );
}

export default Sidebar;