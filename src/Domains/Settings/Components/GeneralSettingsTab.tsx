import React from 'react';
import { connect } from "react-redux";
import { InputGroup, H6, H3 } from "@blueprintjs/core";

import { Dispatch, RootState } from "../../../StoreRematch/Store";

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

//@ts-ignore
export default connect(mapState, mapDispatch)(Settings);
