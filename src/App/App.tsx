import React, { useState } from "react";
import {Provider} from "react-redux";
import {createStore} from "../StoreRematch/Store";
import Main from "./Main";
import Menu from "./Menu";
import RepoTabs, {Tab} from './RepoTabs'
import { showDanger } from "../Support/Toaster";

import "react-perfect-scrollbar/dist/css/styles.css";
import "../Assets/main.css";
import "../Assets/scss/main.scss";

const { dialog, getCurrentWindow } = window.require("electron").remote;

//
// @todo: save e load state from a global persisted store
// {
//   title: 'RepoName',
//   store: createStore('RepoName'),
//   loaded: false,
// }
//
interface Itab {
    title: string;
    store: any;
    loaded: boolean;
}

const App = () => {

  const [activeTab, setActiveTab] = useState<number>(-1);
  const [tabs , setTabs] = useState<Itab[]>([]);

  const handleTabPositionChange = (a: number, b: number) => {
    const localTabs = [...tabs];
    const [moved] = localTabs.splice(a, 1);
    localTabs.splice(b, 0, moved);
    setTabs(localTabs);

		if (activeTab === a) {
			handleActiveTab(b);
		} else if(activeTab > b && activeTab < a) {
			handleActiveTab(activeTab + 1);
		} else if(activeTab < b && activeTab > a) {
			handleActiveTab(activeTab - 1);
		}
	}
  
	const handleTabClose = (index: number) => {
    setTabs(tabs => tabs.filter((_, i) => i !== index));
		if (activeTab >= tabs.length - 1) {
			handleActiveTab(tabs.length - 2);
		}
	}

  const openRepoPath = async () => {
    try {
      const {canceled, filePaths} = await dialog.showOpenDialog(getCurrentWindow(), { properties: ["openDirectory"] });
      if (canceled) {
        return {success: false, path: ''}
      }
      let [path] = filePaths;
      path = path.replace(/\\/g, '/');
      return {success: true, path };
    } catch (err) {
      console.warn(err);
      showDanger('Error on select folder: ' + err.message);
      return {success: false, path: ''};
    }
  }

	const handleTabAdd = async () => {
    const {success, path} = await openRepoPath();
    if (!success) {
      return;
    }
    const title = path.split('/').filter(o => o).pop();
    const index = tabs.findIndex(o => o.title === title);

    if (index > -1) {
      handleActiveTab(index);
      return;
    }

    const store = createStore(title);

    store.dispatch.repoName.setRepoName(title);
    store.dispatch.folder.setFolder(path);

    setTabs([...tabs, { title, store, loaded: true }])

    setActiveTab(tabs.length);
	}

  const handleActiveTab = index => {
    if (!tabs[index].loaded) {
      setTabs([
        ...tabs.slice(0, index),
        { ...tabs[index], loaded: true },
        ...tabs.slice(index + 1)
      ])
    }
    setActiveTab(index);
  }

  return (
    <React.StrictMode>
      <Menu
        title="GitTree"
        openRepo={() => handleTabAdd()}
        store={activeTab > -1 ? tabs[activeTab].store : null}
      />
      <RepoTabs
        activeTab={activeTab}
        onTabSwitch={(index) => handleActiveTab(index)}
        onTabAdd={() => handleTabAdd()}
        onTabClose={(index) => handleTabClose(index)}
        onTabPositionChange={(a, b) => handleTabPositionChange(a, b)}
      >
      {
        tabs.map((value, index) => (
          <Tab
            key={ index }
            title={value.title}
          />
        ))
      }
      </RepoTabs>
      {
        tabs.map((value, index) => (
          value.loaded && 
          <div
            key={ index }
            style={{display: index === activeTab ? 'block': 'none'}}
          >
            <Provider
              store={ value.store }
            >
              <Main />
            </Provider>
          </div>
        ))
      }
    </React.StrictMode>
  );
};

export default App;
