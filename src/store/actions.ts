import { IStore } from "./store";
import { IGraph } from "../models/SubwayMap";
import { ICommit, IRepo, ICurrentCommit, IRefs, ISelectedFile, IWipCommit } from "../utils/interfaces";

const actions = (store: any) => ({
  setFolder: (state: IStore, folder: string) => ({ folder }),
  setRepo: (state: IStore, repo: IRepo) => ({ repo }),
  setCommits: (state: IStore, commits: ICommit[]) => ({ commits }),
  setCurrentBranch: (state: IStore, currentBranch: ICurrentCommit | null) => ({
    currentBranch,
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
  setSettings: (state: IStore, settings: object) => {
    return {
      settings: {
        ...state.settings,
        ...settings
      }
    }
  },
  setShowSettings: (state: IStore, show: boolean) => {
    return {
      settings: {
        ...state.settings,
        show
      }
    }
  }
});

export default actions;
