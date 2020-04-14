import * as React from "react";

import {
    Classes, Icon, Intent, ITreeNode, Position, Tooltip,
    Tree, ContextMenu, MenuItem, Menu, MenuDivider
} from '@blueprintjs/core';


// use Component so it re-renders everytime: `nodes` are not a primitive type
// and therefore aren't included in shallow prop comparison
const Sidebar = () => {
    const [menuItem, setMenuItem] = React.useState<ITreeNode[]>([
        {
            id: 0,
            hasCaret: true,
            icon: "folder-close",
            label: "Folder 0",
        },
        {
            id: 1,
            icon: "folder-close",
            isExpanded: true,
            label: (
                <Tooltip content="I'm a folder <3" position={Position.RIGHT}>
                    Folder 1
                </Tooltip>
            ),
            childNodes: [
                {
                    id: 2,
                    icon: "document",
                    label: "Item 0",
                    secondaryLabel: (
                        <Tooltip content="An eye!">
                            <Icon icon="eye-open" />
                        </Tooltip>
                    ),
                },
                {
                    id: 3,
                    icon: <Icon icon="tag" intent={Intent.PRIMARY} className={Classes.TREE_NODE_ICON} />,
                    label: "Organic meditation gluten-free, sriracha VHS drinking vinegar beard man.",
                },
                {
                    id: 4,
                    hasCaret: true,
                    icon: "folder-close",
                    isExpanded: true,
                    label: (
                        <Tooltip content="foo" position={Position.RIGHT}>
                            Folder 2
                        </Tooltip>
                    ),
                    childNodes: [
                        { id: 5, label: "No-Icon Item" },
                        { id: 6, icon: "tag", label: "Item 1" },
                        {
                            id: 7,
                            hasCaret: true,
                            icon: "folder-close",
                            label: "Folder 3",
                            isExpanded: false,
                            childNodes: [
                                { id: 8, icon: "document", label: "Item 0" },
                                { id: 9, icon: "tag", label: "Item 1" },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            id: 2,
            hasCaret: true,
            icon: "folder-close",
            label: "Super secret files",
            disabled: true,
        },
    ])

    const handleNodeClick = (nodeData : ITreeNode, _nodePath : number[], e: React.MouseEvent<HTMLElement>) =>  {
        // nodeData.isExpanded ? onCollapse(nodeData) : onExpand(nodeData)
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