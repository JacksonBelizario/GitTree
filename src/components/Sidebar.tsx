import * as React from "react";

import { Classes, Icon, Intent, ITreeNode, Position, Tooltip, Tree } from "@blueprintjs/core";


// use Component so it re-renders everytime: `nodes` are not a primitive type
// and therefore aren't included in shallow prop comparison
const Sidebar = () => {
    const [nodes, setNodes] = React.useState<ITreeNode[]>([
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
    

    const handleNodeClick = (nodeData: ITreeNode, _nodePath: number[], e: React.MouseEvent<HTMLElement>) => {
        const originallySelected = nodeData.isSelected;
        if (!e.shiftKey) {
            forEachNode(nodes, n => (n.isSelected = false));
        }
        nodeData.isSelected = originallySelected == null ? true : !originallySelected;
        //this.setState(this.state);
    };

    const handleNodeCollapse = (nodeData: ITreeNode, _nodePath: number[]) => {
        nodeData.isExpanded = false;
        //this.setState(this.state);
    };

    const handleNodeExpand = (nodeData: ITreeNode, _nodePath: number[]) => {
        nodeData.isExpanded = true;
        //this.setState(this.state);
    };

    const forEachNode = (nodes: ITreeNode[], callback: (node: ITreeNode) => void) => {
        if (nodes == null) {
            return;
        }

        for (const node of nodes) {
            callback(node);
            //@ts-ignore
            forEachNode(node.childNodes, callback);
        }
    }

    return (
        <Tree
            contents={nodes}
            onNodeClick={handleNodeClick}
            onNodeCollapse={handleNodeCollapse}
            onNodeExpand={handleNodeExpand}
            className={Classes.ELEVATION_0}
        />
    );
}

export default Sidebar;