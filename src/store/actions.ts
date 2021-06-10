import { ICommit, IRepo, ICurrentCommit, IRefs, ISelectedFile, IWipCommit, IReference, IStore } from "../Support/Interfaces";
import { IGraph } from "../Models/SubwayMap";

import { showDanger, showInfo } from "../Support/Toaster";
import Git from "../Services/Git";

const { dialog, getCurrentWindow } = window.require("electron").remote;

const actions = (store: any) => ({
  setLoading: (state: IStore, loading: boolean) => ({ loading }),
  setFolder: (state: IStore, folder: string) => ({ folder }),
  setWorkdir: (state: IStore, workdir: string) => ({ workdir }),
  setRepoName: (state: IStore, repoName: string) => ({ repoName }),
  setRepo: (state: IStore, repo: IRepo) => ({ repo }),
  setCommits: (state: IStore, commits: ICommit[]) => ({ commits }),
  setCurrentBranch: (state: IStore, currentBranch: ICurrentCommit | null) => ({
    currentBranch,
    refs: {
      ...state.refs,
      references: state.refs.references.map((ref: IReference)=> ({
        current: ref.display.includes(currentBranch.name),
        ...ref
      }))
    }
  }),
  setSelectedCommit: (state: IStore, selectedCommit: string) => ({
    selectedCommit,
  }),
  setGraph: (state: IStore, graph: IGraph | null) => ({ graph }),
  setRefs: (state: IStore, refs: IRefs) => ({ refs }),
  setCommit: (state: IStore, commit: IWipCommit) => ({ commit }),
  scrollToCommit: (state: IStore, sha: string) => {
    const hash = "commit-info-" + sha;
    const element = document.getElementById(hash);
    const container = document.querySelector(".scrollbar-container");
    const sidebar = document.querySelector(".sidebar");
    if (container && element && sidebar) {
      const top = element.offsetTop - sidebar.clientHeight / 2;
      container.scrollTo({ top: top > 0 ? top : 0, behavior: "smooth" });
    }
    return {
      selectedCommit: sha,
    };
  },
  setSelectedFile: (state: IStore, selectedFile: ISelectedFile) => ({selectedFile}),
  setSettings: (state: IStore, settings: object) => ({
    settings: {
      ...state.settings,
      ...settings
    }
  }),
  setShowSettings: (state: IStore, show: boolean) => ({
    settings: {
      ...state.settings,
      show
    }
  }),
  setExpandedMenu: (state: IStore, expandedMenu: string[]) => ({ expandedMenu }),

  openRepo: (state: IStore) => {
    dialog.showOpenDialog(
        getCurrentWindow(),
        { properties: ["openDirectory"] }
      )
      .then(res => {
        if (!res.canceled) {
          const [folder] = res.filePaths;
          store.setState({
            folder,
            expandedMenu: []
          })
        }
      }).catch(err => {
        console.warn(err)
        showDanger('Error on select folder: ' + err.message)
      })
    return {};
  },

  updateStatus: (state: IStore) => {
    Git.getStatus(state.repo)
      .then((changes) => {
        store.setState({...state.commit, ...changes})
      }).catch(err => {
        console.warn(err)
        showDanger('Error on update status: ' + err.message)
      })
    return {};
  },

  pull: (state: IStore, reference: IReference = null) => {
    Git.pull(state.repo, reference, state.settings.auth)
      .then(() => {
        showInfo('Pulled successful')
      }).catch(err => {
        console.warn(err)
        showDanger('Error on pull: ' + err.message)
      }).finally(() => {
        store.setState({ loading: false })
      })
    return { loading: true };
  },

  push: (state: IStore, reference: IReference = null) => {
    Git.push(state.repo, reference, state.settings.auth)
      .then(() => {
        showInfo('Pushed successful')
      }).catch(err => {
        console.warn(err)
        showDanger('Error on push: ' + err.message)
      }).finally(() => {
        store.setState({ loading: false })
      })
    return { loading: true };
  },

  checkoutBranch: (state: IStore, reference: IReference) => {
    Git.checkout(state.repo, reference)
      .then(() => {
        return Git.getCurrentBranch(state.repo);
      }).then(currentBranch => {
        store.setState({
          currentBranch,
          refs: {
            ...state.refs,
            references: state.refs.references.map((ref: IReference)=> ({
              current: ref.display.includes(currentBranch.name),
              ...ref
            }))
          }
        })
        showInfo('Checkout successful')
      }).catch(err => {
        console.warn(err)
        showDanger('Error on checkout branch: ' + err.message)
      }).finally(() => {
        store.setState({ loading: false })
      })
    return { loading: true };
  },
});

export default actions;
