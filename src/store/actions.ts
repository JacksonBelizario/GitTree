import { IStore } from "./store";
import { IGraph } from '../models/SubwayMap';
import { ICommit, IRepo, ICurrentCommit, IRefs } from "../utils/interfaces";
  
const actions = (store : any)  => ({
    setFolder: (state : IStore, folder: string) => ({ folder }),
    setRepo: (state : IStore, repo: IRepo) => ({ repo }),
    setCommits: (state : IStore, commits: ICommit[]) => ({ commits }),
    setCurrentBranch: (state: IStore, currentBranch: ICurrentCommit | null) => ({ currentBranch }),
    setSelectedCommit: (state : IStore, selectedCommit: string) => ({ selectedCommit }),
    setGraph: (state : IStore, graph: IGraph | null) => ({ graph }),
    setRefs: (state : IStore, refs: IRefs) => ({ refs }),
    setWipCommit: (state: IStore, wipCommit: ICommit) => ({ wipCommit }),
    scrollToCommit: (state: IStore, sha: string) => {
        const hash = "commit-info-" + sha;
        const element = document.getElementById(hash);
        const container = document.querySelector('.scrollbar-container');
        const sidebar = document.querySelector('.sidebar');
        if (container && element && sidebar) {
            const top = element.offsetTop - (sidebar.clientHeight / 2);
            container.scrollTo({top: top > 0 ? top: 0, behavior: 'smooth'});
        }
        return {
            selectedCommit: sha
        }
    }
});

export default actions;