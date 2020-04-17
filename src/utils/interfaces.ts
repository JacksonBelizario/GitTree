import { Repository } from 'nodegit';

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
    isStash: boolean;
    stashIndex?: number;
    virtual: boolean;
    enabled?: boolean;
    ci: string | any | null;
    fileSummary: object | any | null
};

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
}

export type IRefDict = Map<string, IReference> | null;

export interface IRefs {
    references: IReference[];
    refDict: IRefDict;
}