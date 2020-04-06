import NodeGit, { Repository } from 'nodegit';

export type IRepo = Repository | null;

export interface ICommit {
    sha: string;
    message: string;
    detail: string;
    date: Date;
    time: number;
    committer: string;
    email: string;
    author: string;
    parents: string[];
    isStash: boolean;
    stashIndex: number;
    virtual: boolean;
    ci: string | any | null;
    fileSummary: object | any | null
};