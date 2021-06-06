import { Repository } from "nodegit";

export type IRepo = Repository | null;

export interface ICommit {
  sha: string;
  message: string;
  detail?: string;
  date: Date;
  time?: number;
  committer?: string;
  email: string;
  author: string;
  parents: string[];
  isStash?: boolean;
  stashIndex?: number;
  virtual?: boolean;
  enabled?: boolean;
  ci?: string | any;
  fileSummary: object | any | null;
  staged?: IWipFile[];
  unstaged?: IWipFile[];
  files?: IFile[];
}

export interface IFile {
  path: string;
  isAdded: boolean;
  isModified: boolean;
  isRenamed: boolean;
  isDeleted: boolean;
  isConflicted: boolean;
}

export interface IWipFile extends IFile {
  isIgnored: boolean;
}

export interface IStatusCommit {
  enabled?: boolean;
  staged: IWipFile[];
  unstaged: IWipFile[];
  stagedSummary: {
    ignored: number;
    newCount: number;
    deleted: number;
    modified: number;
    renamed: number;
  };
  unstagedSummary: {
    ignored: number;
    newCount: number;
    deleted: number;
    modified: number;
    renamed: number;
  };
  fileSummary: {
    ignored: number;
    newCount: number;
    deleted: number;
    modified: number;
    renamed: number;
  },
}

export type IWipCommit = ICommit & IStatusCommit;

export interface ICommitDetail extends ICommit {
  fileSummary: {
    added: number,
    deleted: number,
    modified: number,
    renamed: number
  };
  files: IFile[];
}

export interface ICurrentCommit {
  name: string;
  fullName: string;
  shorthand: string;
  target: string;
}

export interface IReference {
  target: string;
  isBranch: boolean;
  isRemote: boolean;
  isTag: boolean;
  name: string;
  shorthand: string;
  display: string;
  diff?: {
    ahead: number;
    behind: number;
  };
}

export type IRefDict = Map<string, IReference[]> | null;

export interface IRefs {
  references: IReference[];
  refDict: IRefDict;
  commits: string
}


export interface ISelectedFile {
  commit: string;
  file?: IFile;
}

export interface IAuth {
  username: string,
  password: string,
  useSshLocalAgent: boolean,
  sshPrivateKey: string,
  sshPrivateContent: string,
  sshPublicKey: string,
  sshPublicContent: string,
}

export interface ISettings {
  show: boolean,
  general: {
    fetchInterval: number,
  },
  auth: IAuth
}