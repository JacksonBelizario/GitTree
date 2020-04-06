import NodeGit, {Repository} from 'nodegit';

const isSSH = url => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return false;
    } else {
        return true;
    }
}

// declare type IRepo = Repository | null;

/**
declare type ICommit = {
    sha: string,
    message: string,
    detail: string,
    date: Date,
    time: Date,
    committer: string,
    email: string,
    author: string,
    parents: any,
    isStash: boolean,
    stashIndex: number,
    virtual: any,
    fileSummary: any
}; */

const openRepo = async (folder) => {
    return await NodeGit.Repository.open(folder);
}

const getCommits = async (Repo) => {
    let walker = NodeGit.Revwalk.create(Repo);
    walker.sorting(NodeGit.Revwalk.SORT.TOPOLOGICAL, NodeGit.Revwalk.SORT.TIME);
    walker.pushGlob('*');
    let stashes = [];
    await NodeGit.Stash.foreach(Repo, (index, msg, id) => {
        stashes.push(id.toString());
        walker.push(id);
    });
    const res = await walker.getCommits(500);
    let commits = [];
    let stashIndicies = [];
    res.forEach(x => {
        let stashIndex = -1;
        let isStash = false;
        let parents = x.parents().map(p => p.toString());
        if (stashes.indexOf(x.sha()) !== -1) {
            isStash = true;
            parents = [x.parents()[0].toString()];
            if (x.parents().length > 0) {
                for (let i = 1; i < x.parents().length; i++) {
                    stashIndicies.push(x.parents()[i].toString());
                }
            }
            stashIndex = stashes.indexOf(x.sha());
        }
        let cmt = {
            sha: x.sha(),
            message: x.message().split('\n')[0],
            detail: x.message().split('\n').splice(1, x.message().split('\n').length).join('\n'),
            date: x.date(),
            time: x.time(),
            committer: x.committer(),
            email: x.author().email(),
            author: x.author().name(),
            parents: parents,
            isStash: isStash,
            stashIndex: stashIndex,
        };
        if (stashIndicies.indexOf(cmt.sha) === -1) {
            commits.push(cmt);
        }
    });
    return commits;
}
export default {
    openRepo,
    getCommits
}