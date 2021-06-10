import React from 'react';
import { connect } from 'redux-zero/react';
import { BoundActions } from 'redux-zero/types';
import { Icon } from "@blueprintjs/core";

import { ISettings, ISettingsTab, IStore } from '../../Support/Interfaces';
import Actions from '../../Store/Actions';

import GeneralSettingsTab from './Components/GeneralSettingsTab'
import AuthSettingsTab from './Components/AuthSettingsTab'

import '../../Assets/scss/settings.scss'
interface StoreProps {
  settings: ISettings;
}

const mapToProps = (state: IStore): StoreProps => ({
  settings: state.settings,
});

type SettingsProps = StoreProps & BoundActions<IStore, typeof Actions>;

const Settings = (props: SettingsProps) => {
  const { settings, setSettings } = props;

  const setTabSettings = (tab: ISettingsTab) => {
    setSettings({
      ...settings,
      tab,
    });
  }

  if (!settings.show) {
    return <></>;
  }

  return (
    <div className="settings">
      <div className="settings-left-panel">
        <div
          className={`settings-menu-container ${settings.tab === 'general' ? 'active' : ''}`}
          onClick={() => setTabSettings('general')}
        >
            <div className="settings-menu">
              <div className="settings-menu-icon"><Icon icon="settings" /></div>
              <div className="settings-menu-title">General</div>
            </div>
        </div>
        <div
          className={`settings-menu-container ${settings.tab === 'auth' ? 'active' : ''}`}
          onClick={() => setTabSettings('auth')}
        >
            <div className="settings-menu">
              <div className="settings-menu-icon"><Icon icon="shield" /></div>
              <div className="settings-menu-title">Auth</div>
            </div>
        </div>
      </div>
      
      <div className="settings-right-panel">
        { settings.tab === 'general' && <GeneralSettingsTab /> }
        { settings.tab === 'auth' && <AuthSettingsTab /> }
      </div>
    </div>
  )
}

export default connect<IStore>(mapToProps, Actions)(Settings);