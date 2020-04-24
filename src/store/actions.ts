import { IStore } from "./store";
import { IGraph } from '../models/subway-map';
import { ICommit, IRepo, ICurrentCommit, IRefs } from "../utils/interfaces";
  
const actions = (store : any)  => ({
    setFolder: (state : IStore, folder: string) => ({ folder }),
    setRepo: (state : IStore, repo: IRepo) => ({ repo }),
    setCommits: (state : IStore, commits: ICommit[]) => ({ commits }),
    setCurrentBranch: (state: IStore, currentBranch: ICurrentCommit | null) => ({ currentBranch }),
    setSelectedCommit: (state : IStore, selectedCommit: string) => ({ selectedCommit }),
    setGraph: (state : IStore, graph: IGraph | null) => ({ graph }),
    setRefs: (state : IStore, refs: IRefs) => ({ refs }),
    setWipCommit: (state: IStore, wipCommit: ICommit) => ({ wipCommit })
});

export default actions;