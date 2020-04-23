import React, { useState } from "react";

import {
    Classes, Button, IButtonProps
} from '@blueprintjs/core';

import {
    HardDrive as HardDriveIcon,
    Cloud as CloudIcon,
    Inbox as InboxIcon,
    Layers as LayersIcon,
    Tag as TagIcon
} from 'react-feather';

import { IReference } from "../utils/interfaces";
import { connect } from "redux-zero/react";
import { IStore } from "../store/store";

import SidebarBranchs from './SidebarBranchs';

interface ISidebarBtn extends IButtonProps {
    icon: any
}
const SidebarBtn : React.StatelessComponent<ISidebarBtn> = props => {
    let { icon, children, ...rest} = props;
    let CustomIcon = (props : any) => ({...icon, size: props.size});
    
    return (
        <Button icon={<CustomIcon />} {...rest} className={Classes.MINIMAL + ' ' + Classes.ALIGN_LEFT}
            style={{width: '100%', borderRadius: 0, borderBottom: '1px solid #282c34'}} >
            {children}
        </Button>
    )
}

interface StoreProps {
    local: IReference[];
    remote: IReference[];
    tags: IReference[];
}

const mapToProps = (state : IStore) : StoreProps => ({
    local: state.refs.references.filter(_ => _.isBranch),
    remote: state.refs.references.filter(_ => _.isRemote),
    tags: state.refs.references.filter(_ => _.isTag),
});

const Sidebar = (props : StoreProps) => {
    const { local, remote, tags } = props;

    const [showLocal, setShowLocal] = useState<boolean>(true);
    const [showRemote, setShowRemote] = useState<boolean>(false);
    const [showTags, setShowTags] = useState<boolean>(false);

    return (
        <>
        <SidebarBtn
            icon={<HardDriveIcon size={18} />}
            onClick={() => setShowLocal(!showLocal)} >
            Local
        </SidebarBtn>
        { showLocal && <SidebarBranchs branchs={local} />}
        <SidebarBtn
            icon={<CloudIcon size={18} />}
            onClick={() => setShowRemote(!showRemote)} >
            Remote
        </SidebarBtn>
        { showRemote && <SidebarBranchs branchs={remote} />}
        <SidebarBtn
            icon={<InboxIcon size={18} />}
            onClick={() => {}} >
            Stashes
        </SidebarBtn>
        <SidebarBtn
            icon={<TagIcon size={18} />}
            onClick={() => setShowTags(!showTags)} >
            Tags
        </SidebarBtn>
        { showTags && <SidebarBranchs branchs={tags} />}
        <SidebarBtn
            icon={<LayersIcon size={18} />}
            onClick={() => {}} >
            Submodules
        </SidebarBtn>
        </>
    );
}

export default connect<IStore>(mapToProps)(Sidebar);