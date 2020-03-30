import * as React from "react";

import {
    Alignment,
    Button,
    Classes,
    Navbar,
    NavbarDivider,
    NavbarGroup,
    NavbarHeading,
} from "@blueprintjs/core";

const Nav = () => {

    return (
        <Navbar>
            <NavbarGroup align={Alignment.LEFT}>
                <NavbarHeading>GitTree</NavbarHeading>
                <NavbarDivider />
                <Button className={Classes.MINIMAL} icon="home" text="Home" />
                <Button className={Classes.MINIMAL} icon="document" text="Files" />
            </NavbarGroup>
        </Navbar>
    );
}

export default Nav;