import { ICommit, ICurrentCommit, IReference, IRefs, IRepo, ISelectedFile, IWipCommit } from "../Support/Interfaces"
import { IGraph } from "../Models/SubwayMap"
import { INITIAL_WIP } from "../Support/Utils"

import { showDanger, showInfo } from "../Support/Toaster";
import Git from "../Services/Git";

const { dialog, getCurrentWindow } = window.require("electron").remote;

export const loading = {
	state: 0, reducers: { setLoading: (state, payload: boolean) => payload },
}

export const folder = {
	state: '', reducers: { setFolder: (state, payload: string) => payload },
}

export const repo = {
	state: null,
  reducers: { setRepo: (state, payload: IRepo) => payload },
	effects: (dispatch) => ({
		async openRepo() {
      try {
        const res = await dialog.showOpenDialog(getCurrentWindow(), { properties: ["openDirectory"] });
        if (!res.canceled) {
          const [folder] = res.filePaths;
          dispatch.folder.setFolder(folder);
          dispatch.expandedMenu.setExpandedMenu([]);
        }
      } catch (err) {
        console.warn(err);
        showDanger('Error on select folder: ' + err.message);
      }
		},
    async updateStatus(payload, rootState) {
      // const changes = await Git.getStatus(rootState.repo);
    },
    async pull(reference: IReference = null, rootState) {
      dispatch.loading.setLoading(true);
      try {
        await Git.pull(rootState.repo, reference, rootState.settings.auth);
        showInfo('Pulled successful');
      } catch (err) {
        console.warn(err)
        showDanger('Error on pull: ' + err.message);
      } finally {
        dispatch.loading.setLoading(false);
      }
    },
    async push(reference: IReference = null, rootState) {
      dispatch.loading.setLoading(true);
      try {
        await Git.push(rootState.repo, reference, rootState.settings.auth);
        showInfo('Pushed successful');
      } catch (err) {
        console.warn(err);
        showDanger('Error on push: ' + err.message)
      } finally {
        dispatch.loading.setLoading(false);
      }
    }
	}),
}

export const workdir = {
	state: '', reducers: { setWorkdir: (state, payload: string) => payload },
}

export const repoName = {
	state: '', reducers: { setRepoName: (state, payload: string) => payload },
}

export const selectedCommit = {
	state: '',
  reducers: { setSelectedCommit: (state, payload: string) => payload },
	effects: (dispatch) => ({
		scrollToCommit(sha: string) {
			dispatch.selectedCommit.setSelectedCommit(sha);
      
      const hash = "commit-info-" + sha;
      const element = document.getElementById(hash);
      const container = document.querySelector(".scrollbar-container");
      const sidebar = document.querySelector(".sidebar");
      if (container && element && sidebar) {
        const top = element.offsetTop - sidebar.clientHeight / 2;
        container.scrollTo({ top: top > 0 ? top : 0, behavior: "smooth" });
      }
		},
		async checkoutBranch(reference: IReference, rootState) {
      dispatch.loading.setLoading(true);
      try {
        await Git.checkout(rootState.repo, reference)
        const currentBranch = await Git.getCurrentBranch(rootState.repo);
        dispatch.currentBranch.setCurrentBranch(currentBranch);
        showInfo('Checkout successful');
      } catch (err) {
        console.warn(err);
        showDanger('Error on checkout branch: ' + err.message);
      } finally {
        dispatch.loading.setLoading(false);
      }
		},
	}),
}

export const graph = {
	state: null, reducers: { setGraph: (state, payload: IGraph | null) => payload },
}

export const refs = {
	state: { references: [], refDict: null, commits: '' },
  reducers: { setRefs: (state, payload: IRefs) => payload },
}

export const currentBranch = {
	state: null,
  reducers: { setCurrentCommit: (state, payload: ICurrentCommit | null) => payload },
	effects: (dispatch) => ({
		setCurrentBranch(currentBranch: ICurrentCommit | null, rootState) {
			dispatch.currentBranch.setCurrentCommit(currentBranch);
      
			dispatch.refs.setRefs({
        ...rootState.refs,
        references: rootState.refs.references.map((ref: IReference)=> ({
          current: ref.display.includes(currentBranch.name),
          ...ref
        }))
      });
		},
	}),
}

export const commits = {
	state: [], reducers: { setCommits: (state, payload: ICommit[]) => payload },
}

export const commit = {
	state: INITIAL_WIP, reducers: { setCommit: (state, payload: IWipCommit) => payload },
}

export const selectedFile = {
	state: { commit: null, file: null },
  reducers: { setSelectedFile: (state, payload: ISelectedFile) => payload },
}

export const expandedMenu = {
	state: [], reducers: { setExpandedMenu: (state, payload: string[]) => payload },
}

export const settings = {
	state: {
    show: false,
    tab: "general",
    general: {
      fetchInterval: '5'
    },
    auth: {
      username: '',
      password: '',
      useSshLocalAgent: true,
      sshPrivateKey: '',
      sshPrivateContent: '',
      sshPublicKey: '',
      sshPublicContent: ''
    }
  },
  reducers: {
    setSettings: (state, payload: object) => ({
      ...state.settings,
      ...payload
    })
  },
	effects: (dispatch) => ({
    // todo: verificar se é permitido dois parametros nos effects
		setShowSettings(payload, rootState) {
			dispatch.settings.setSettings({
        ...rootState.settings,
        show: payload.show,
        tab: payload.tab || 'general'
      });
		},
	}),
}