import { IStore } from "./store";
  
const actions = (store : any)  => ({
    setFolder: (state : IStore, folder: string) => ({ folder })
});

export default actions;
  