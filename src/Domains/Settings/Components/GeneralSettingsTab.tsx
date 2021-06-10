import React from 'react';
import { connect } from 'redux-zero/react';
import { BoundActions } from 'redux-zero/types';
import { InputGroup, H6, H3 } from "@blueprintjs/core";

import { ISettings, IStore } from '../../../Support/Interfaces';
import Actions from '../../../Store/Actions';

interface StoreProps {
  settings: ISettings;
}

const mapToProps = (state: IStore): StoreProps => ({
  settings: state.settings,
});

type SettingsProps = StoreProps & BoundActions<IStore, typeof Actions>;

const Settings = (props: SettingsProps) => {
  const { settings: {general}, setSettings } = props;

  const setGeneralSettings = (data: object)=> {
    setSettings({
      general: {
        ...general,
        ...data
    }});
  }

  return (
    <>
      <H3 className="settings-title">General</H3>
      <div className="settings-item">
        <H6>Auto-fetch</H6>
        <InputGroup
          large={true}
          type="number"
          value={general.fetchInterval}
          onChange={({target}) => setGeneralSettings({ fetchInterval: target.value })}
        />
        <p>In minutes. Set as 0 to disable auto-fetch</p>
      </div>
    </>
  )
}

export default connect<IStore>(mapToProps, Actions)(Settings);