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
}

export interface IWipFile extends IFile {
  isIgnored: boolean;
}

export interface IWipCommit extends ICommit {
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
}

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
  current?: boolean;
}

export type IRefDict = Map<string, IReference> | null;

export interface IRefs {
  references: IReference[];
  refDict: IRefDict;
}


export interface ISelectedFile {
  commit: string;
  path: string;
  diffType: 'add' | 'delete' | 'modify' | 'rename' | 'copy';
}