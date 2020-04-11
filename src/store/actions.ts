import { IStore } from "./store";
import { IGraph } from '../models/subway-map';
  
const actions = (store : any)  => ({
    setFolder: (state : IStore, folder: string) => ({ folder }),
    setSelectedCommit: (state : IStore, selectedCommit: string) => ({ selectedCommit }),
    setGraph: (state : IStore, graph: IGraph | null) => ({ graph }),
});

export default actions;