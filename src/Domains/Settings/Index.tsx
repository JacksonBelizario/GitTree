import React from 'react';
import { connect } from 'redux-zero/react';
import { BoundActions } from 'redux-zero/types';
import { Button, H4, H6, InputGroup, Switch, Icon, H3 } from "@blueprintjs/core";

import { ISettings, IStore } from '../../Support/Interfaces';
import Actions from '../../Store/Actions';

import '../../Assets/scss/settings.scss'

const { dialog, getCurrentWindow } = window.require("electron").remote;
const fs = window.require('fs');

interface StoreProps {
  settings: ISettings;
}

const mapToProps = (state: IStore): StoreProps => ({
  settings: state.settings,
});

type SettingsProps = StoreProps & BoundActions<IStore, typeof Actions>;

const Settings = (props: SettingsProps) => {
  const { settings: {show, auth}, setSettings } = props;

  const setAuthSettings = (data: object)=> {
    setSettings({
      auth: {
        ...auth,
        ...data
    }});
  }

  const selectFile = async () => {
    try {
      const {canceled, filePaths} = await dialog.showOpenDialog(
        getCurrentWindow(),
        { properties: ["openFile"] }
      );
      if (canceled) {
        return {success: false, path: '', content: ''}
      }
      const [path] = filePaths;
      
      const content = fs.readFileSync(path, {
        encoding: "ascii"
      });

      return {success: true, path, content};
    } catch (error) {
      console.log({ error });
      return {success: false, path: '', content: ''};
    }
  };

  const setSSHPrivateKey = async () => {
    const {success, path, content} = await selectFile();
    if (!success) {
      return;
    }
    setAuthSettings({ sshPrivateKey: path, sshPrivateContent: content });
  }

  const setSSHPublicKey = async () => {
    const {success, path, content} = await selectFile();
    if (!success) {
      return;
    }
    setAuthSettings({ sshPublicKey: path, sshPublicContent: content });
  }

  if (!show) {
    return <></>;
  }

  return (
    <div className="settings">
      <div className="settings-left-panel">
        <div className="settings-menu-container">
            <div className="settings-menu">
              <div className="settings-menu-icon"><Icon icon="settings" /></div>
              <div className="settings-menu-title">General</div>
            </div>
        </div>
        <div className="settings-menu-container active">
            <div className="settings-menu">
              <div className="settings-menu-icon"><Icon icon="shield" /></div>
              <div className="settings-menu-title">Auth</div>
            </div>
        </div>
      </div>
      
      <div className="settings-right-panel">
        <H3 className="settings-title">Credentials</H3>
        <div className="settings-item">
          <H6>Username</H6>
          <InputGroup
            large={true}
            placeholder="Enter your username..."
            value={auth.username}
            onChange={({target}) => setAuthSettings({ username: target.value })}
          />
        </div>
        <div className="settings-item">
          <H6>Password</H6>
          <InputGroup
            large={true}
            type="password"
            placeholder="Enter your password..."
            value={auth.password}
            onChange={({target}) => setAuthSettings({ password: target.value })}
          />
        </div>
        <H4 className="settings-title">SSH</H4>
        <div className="settings-item">
          <H6>Use SSH Local Agent</H6>
          <Switch
            checked={auth.useSshLocalAgent}
            onChange={() => setAuthSettings({ useSshLocalAgent: !auth.useSshLocalAgent })} />
        </div>
        <div className="settings-item">
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
        </div>
        <div className="settings-item">
          <H6>SSH Public Key</H6>
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
        </div>
      </div>
    </div>
  )
}

export default connect<IStore>(mapToProps, Actions)(Settings);