import * as React from "react";
import {
    Alignment,
    Button,
    Classes,
    Navbar,
    NavbarDivider,
    NavbarGroup,
    NavbarHeading,
    Tag,
} from "@blueprintjs/core";

import { connect } from "redux-zero/react";
import { BoundActions } from "redux-zero/types/Actions";
import actions from "../store/actions";
import { IStore } from "../store/store";
const { dialog } = window.require('electron').remote;

interface StoreProps {
    folder: string;
}

const mapToProps = (state : IStore) : StoreProps => ({ folder: state.folder }); 

type NavProps = StoreProps & BoundActions<IStore, typeof actions>

const Nav = (props : NavProps) => {
    const { folder, setFolder } = props;

    const selectFolder = async () => {
        try {
            let [path] = await dialog.showOpenDialogSync({
                properties: ['openDirectory']
            });
            setFolder(path);
        } catch (error) {
            console.log({error});
        }
    }
    return (
        <Navbar>
            <NavbarGroup align={Alignment.LEFT}>
                <NavbarHeading>GitTree</NavbarHeading>
                <NavbarDivider />
                <Button className={Classes.MINIMAL} icon="folder-new" onClick={() => selectFolder()} />
                { folder && <Tag icon="git-repo" large minimal style={{marginLeft: 10}}>{folder}</Tag> }
            </NavbarGroup>
        </Navbar>
    );
}

export default connect<IStore>(mapToProps, actions)(Nav);