import React from 'react';
import { connect } from "react-redux";
import { Icon } from "@blueprintjs/core";

import { ISettingsTab } from '../../Support/Interfaces';
import { Dispatch, RootState } from "../../StoreRematch/Store";

import GeneralSettingsTab from './Components/GeneralSettingsTab'
import AuthSettingsTab from './Components/AuthSettingsTab'

import '../../Assets/scss/settings.scss'

const mapState = (state: RootState) => ({
  settings: state.settings,
});

const mapDispatch = (dispatch: Dispatch) => ({
  setSettings: dispatch.settings.setSettings,
});

type StateProps = ReturnType<typeof mapState>
type DispatchProps = ReturnType<typeof mapDispatch>

type SettingsProps = StateProps & DispatchProps;

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

//@ts-ignore
export default connect(mapState, mapDispatch)(Settings);
