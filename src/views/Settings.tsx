import React from 'react';
import { IStore } from '../store/store';
import { ISettings } from '../utils/interfaces';
import { BoundActions } from 'redux-zero/types';
import actions from '../store/actions';
import { connect } from 'redux-zero/react';

import { Button, H4, H6, Callout, Menu, MenuItem, InputGroup, Switch } from "@blueprintjs/core";

const { dialog } = window.require("electron").remote;
const fs = window.require('fs');

interface StoreProps {
  settings: ISettings;
}

const mapToProps = (state: IStore): StoreProps => ({
  settings: state.settings,
});

type SerringsProps = StoreProps & BoundActions<IStore, typeof actions>;

const Settings = (props: SerringsProps) => {
  const { settings: {show, auth}, setSettings } = props;

  const setAuthSettings = (data: object)=> {
    setSettings({
      auth: {
        username: '',
        password: '',
        ...auth,
        ...data
    }});
  }

  const selectFile = async () => {
    try {
      const [path] = await dialog.showOpenDialogSync({
        properties: ["openFile"],
      });
      
      const content = fs.readFileSync(path, {
        encoding: "ascii"
      });

      return {path, content};
    } catch (error) {
      console.log({ error });
      return {path: '', content: ''};
    }
  };

  const setSSHPrivateKey = async () => {
    const {path, content} = await selectFile();
    setAuthSettings({ sshPrivateKey: path, sshPrivateContent: content });
  }

  const setSSHPublicKey = async () => {
    const {path, content} = await selectFile();
    setAuthSettings({ sshPublicKey: path, sshPublicContent: content });
  }

  if (!show) {
    return <></>;
  }

  return (
    <div className="settings flex absolute top-0 bottom-0 left-0 right-0 z-10 bg-white text-black">
      <Menu style={{width: 300, height: '100%'}}>
        <li className="bp3-menu-header"><H6>Settings</H6></li>
        <MenuItem icon="settings" onClick={() => {}} text="General" />
        <MenuItem icon="shield" active onClick={() => {}} text="Auth" />
      </Menu>
      <div className="p-3 w-full">
        <Callout className="mb-3 w-full">
          <H4>SSH</H4>
        </Callout>
        <Callout className="w-full">
          <span style={{display: 'block', width: 500, marginBottom: 10}}>
            <H6>Use SSH Local Agent</H6>
            <Switch
              checked={auth.useSshLocalAgent}
              onChange={() => setAuthSettings({ useSshLocalAgent: !auth.useSshLocalAgent })} />
          </span>
          <span style={{display: 'block', width: 500, marginBottom: 10}}>
            <H6>SSH Private Key</H6>
            <InputGroup
                large={true}
                disabled={auth.useSshLocalAgent}
                onChange={() => {}}
                placeholder="Choose file..."
                value={auth.sshPrivateKey}
                readOnly
                onClick={() => setSSHPrivateKey()}
                rightElement={
                <Button
                  disabled={auth.useSshLocalAgent}
                  onClick={() => setSSHPrivateKey()}
                >Browse</Button>
              }
            />
          </span>
          <span style={{display: 'block', width: 500, marginBottom: 10}}>
            <H6>SSH Private Key</H6>
            <InputGroup
                large={true}
                disabled={auth.useSshLocalAgent}
                onChange={() => {}}
                placeholder="Choose file..."
                value={auth.sshPublicKey}
                readOnly
                onClick={() => setSSHPublicKey()}
                rightElement={
                <Button
                  disabled={auth.useSshLocalAgent}
                  onClick={() => setSSHPublicKey()}
                >Browse</Button>
              }
            />
          </span>
        </Callout>
      </div>
    </div>
  )
}

export default connect<IStore>(mapToProps, actions)(Settings);