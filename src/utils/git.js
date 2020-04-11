import NodeGit, {Repository} from 'nodegit';

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

const watchStatus = async (Repo) => {
    const statuses = await Repo.getStatus();
    let stagedSummary = {
        ignored: 0,
        newCount: 0,
        deleted: 0,
        modified: 0,
        renamed: 0
    }
    let unstagedSummary = {
        ignored: 0,
        newCount: 0,
        deleted: 0,
        modified: 0,
        renamed: 0
    }
    let staged = [];
    let unstaged = [];
    statuses.forEach(status => {
        let item = {
            path: status.path(),
            isNew: status.isNew(),
            isModified: status.isModified(),
            isRenamed: status.isRenamed(),
            isIgnored: status.isIgnored(),
            isDeleted: status.isDeleted(),
        }
        if (status.inIndex()) {
            staged.push(item);
            if (status.isNew()) {
                stagedSummary.newCount += 1;
            } else if (status.isModified()) {
                stagedSummary.modified += 1;
            } else if (status.isIgnored()) {
                stagedSummary.ignored += 1;
            } else if (status.isRenamed()) {
                stagedSummary.rename += 1;
            } else if (status.isDeleted()) {
                stagedSummary.deleted += 1;
            }
        }
        if (status.inWorkingTree()) {
            unstaged.push(item);
            if (status.isNew()) {
                unstagedSummary.newCount += 1;
            } else if (status.isModified()) {
                unstagedSummary.modified += 1;
            } else if (status.isIgnored()) {
                unstagedSummary.ignored += 1;
            } else if (status.isRenamed()) {
                unstagedSummary.rename += 1;
            } else if (status.isDeleted()) {
                unstagedSummary.deleted += 1;
            }
        }
    });
    return {
        staged: staged,
        unstaged: unstaged,
        stagedSummary: stagedSummary,
        unstagedSummary: unstagedSummary,
        summary: {
            ignored: stagedSummary.ignored + unstagedSummary.ignored,
            newCount: stagedSummary.newCount + unstagedSummary.newCount,
            deleted: stagedSummary.deleted + unstagedSummary.deleted,
            modified: stagedSummary.modified + unstagedSummary.modified,
            renamed: stagedSummary.renamed + unstagedSummary.renamed
        }
    };
}

const getCurrentBranch = async Repo => {
    try {
        const ref = await Repo.getCurrentBranch();
        let branchNames = ref.name().split('/');
        let branchName = branchNames[branchNames.length - 1];
        return {
            name: branchName,
            fullName: ref.name(),
            shorthand: ref.shorthand(),
            target: ref.target().toString()
        };
    } catch(err) {
        return { name: "", fullName: "", shorthand: "", target: "" }
    }
}


export default {
    openRepo,
    getCommits,
    watchStatus,
    getCurrentBranch
}