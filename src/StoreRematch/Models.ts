import { createModel, Models } from '@rematch/core'
import { ICommit, ICurrentCommit, IReference, IRefs, IRepo, ISelectedFile, ISettings, IWipCommit } from "../Support/Interfaces"
import { IGraph } from "../Models/SubwayMap"
import { INITIAL_WIP } from "../Support/Utils"

import { showDanger, showInfo } from "../Support/Toaster";
import Git from "../Services/Git";

const { dialog, getCurrentWindow } = window.require("electron").remote;

export interface RootModel extends Models<RootModel> {
  loading: typeof loading;
  folder: typeof folder;
  repo: typeof repo;
  workdir: typeof workdir;
  repoName: typeof repoName;
  selectedCommit: typeof selectedCommit;
  graph: typeof graph;
  currentBranch: typeof currentBranch;
  commits: typeof commits;
  commit: typeof commit;
  refs: typeof refs;
  selectedFile: typeof selectedFile,
  settings: typeof settings,
  expandedMenu: typeof expandedMenu
}

export const loading = createModel<RootModel>()({
	state: false,
  reducers: { setLoading: (state, payload: boolean) => payload },
});

export const folder = createModel<RootModel>()({
	state: '',
  reducers: { setFolder: (state, payload: string) => payload },
});

export const repo = createModel<RootModel>()({
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
});

export const workdir = createModel<RootModel>()({
	state: '',
  reducers: { setWorkdir: (state, payload: string) => payload },
});

export const repoName = createModel<RootModel>()({
	state: '',
  reducers: { setRepoName: (state, payload: string) => payload },
});

export const selectedCommit = createModel<RootModel>()({
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
});

export const graph = createModel<RootModel>()({
	state: null,
  reducers: { setGraph: (state, payload: IGraph | null) => payload },
});

export const refs = createModel<RootModel>()({
	state: { references: [], refDict: null, commits: '' } as IRefs,
  reducers: { setRefs: (state, payload: IRefs) => payload },
});

export const currentBranch = createModel<RootModel>()({
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
});

export const commits = createModel<RootModel>()({
	state: [] as ICommit[],
  reducers: { setCommits: (state, payload: ICommit[]) => payload },
});

export const commit = createModel<RootModel>()({
	state: INITIAL_WIP as IWipCommit,
  reducers: { setCommit: (state, payload: IWipCommit) => payload },
});

export const selectedFile = createModel<RootModel>()({
	state: { commit: null, file: null } as ISelectedFile,
  reducers: { setSelectedFile: (state, payload: ISelectedFile) => payload },
});

export const expandedMenu = createModel<RootModel>()({
	state: [] as string[],
  reducers: { setExpandedMenu: (state, payload: string[]) => payload },
});

export const settings = createModel<RootModel>()({
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
  } as ISettings,
  reducers: {
    setSettings: (state, payload: object) => ({
      ...state,
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
});

export const models: RootModel = {
  loading,
  folder,
  repo,
  workdir,
  repoName,
  selectedCommit,
  graph,
  currentBranch,
  commits,
  commit,
  refs,
  selectedFile,
  settings,
  expandedMenu,
};
