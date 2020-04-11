import { IStore } from "./store";
import { IGraph } from '../models/subway-map';
import { ICommit } from "../utils/interfaces";
  
const actions = (store : any)  => ({
    setFolder: (state : IStore, folder: string) => ({ folder }),
    setSelectedCommit: (state : IStore, selectedCommit: string) => ({ selectedCommit }),
    setGraph: (state : IStore, graph: IGraph | null) => ({ graph }),
    setWipCommit: (state: IStore, wipCommit: ICommit) => ({ wipCommit })
});

export default actions;