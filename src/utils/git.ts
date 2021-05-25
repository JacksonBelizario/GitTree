import NodeGit from "nodegit"
import { isSSH } from "./index"
import { IAuth } from "./interfaces";

const openRepo = async (folder) => {
  return await NodeGit.Repository.open(folder);
};

const getCommits = async (Repo) => {
  let walker = NodeGit.Revwalk.create(Repo);
  //@ts-ignore
  walker.sorting(NodeGit.Revwalk.SORT.TOPOLOGICAL, NodeGit.Revwalk.SORT.TIME);
  walker.pushGlob("*");
  let stashes = [];
  await NodeGit.Stash.foreach(Repo, (index, msg, id) => {
    stashes.push(id.toString());
    walker.push(id);
  });
  const res = await walker.getCommits(500);
  let commits = [];
  let stashIndicies = [];
  res.forEach((x) => {
    let stashIndex = -1;
    let isStash = false;
    let parents = x.parents().map((p) => p.toString());
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
      message: x.message().split("\n")[0],
      detail: x
        .message()
        .split("\n")
        .splice(1, x.message().split("\n").length)
        .join("\n"),
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
};

const getStatus = async (Repo) => {
  const statuses = await Repo.getStatus();
  let stagedSummary = {
    ignored: 0,
    newCount: 0,
    deleted: 0,
    modified: 0,
    renamed: 0,
  };
  let unstagedSummary = {
    ignored: 0,
    newCount: 0,
    deleted: 0,
    modified: 0,
    renamed: 0,
  };
  let staged = [];
  let unstaged = [];
  statuses.forEach((status) => {
    let item = {
      path: status.path(),
      isAdded: !!status.isNew(),
      isModified: !!status.isModified(),
      isRenamed: !!status.isRenamed(),
      isIgnored: !!status.isIgnored(),
      isDeleted: !!status.isDeleted(),
    };
    if (status.inIndex()) {
      staged.push(item);
      if (status.isNew()) {
        stagedSummary.newCount += 1;
      } else if (status.isModified()) {
        stagedSummary.modified += 1;
      } else if (status.isIgnored()) {
        stagedSummary.ignored += 1;
      } else if (status.isRenamed()) {
        stagedSummary.renamed += 1;
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
        unstagedSummary.renamed += 1;
      } else if (status.isDeleted()) {
        unstagedSummary.deleted += 1;
      }
    }
  });
  return {
    enabled: (staged.length > 0 || unstaged.length > 0),
    parents: [],
    staged: staged,
    unstaged: unstaged,
    stagedSummary: stagedSummary,
    unstagedSummary: unstagedSummary,
    fileSummary: {
      ignored: stagedSummary.ignored + unstagedSummary.ignored,
      newCount: stagedSummary.newCount + unstagedSummary.newCount,
      deleted: stagedSummary.deleted + unstagedSummary.deleted,
      modified: stagedSummary.modified + unstagedSummary.modified,
      renamed: stagedSummary.renamed + unstagedSummary.renamed,
    },
  };
};

const getCurrentBranch = async (Repo) => {
  try {
    const ref = await Repo.getCurrentBranch();
    let branchNames = ref.name().split("/");
    let branchName = branchNames[branchNames.length - 1];
    return {
      name: branchName,
      fullName: ref.name(),
      shorthand: ref.shorthand(),
      target: ref.target().toString(),
    };
  } catch (err) {
    return { name: "", fullName: "", shorthand: "", target: "" };
  }
};

const compareCommits = async (Repo, firstSHA, secondSHA) => {

  let [localCommit, remoteCommit] = await Promise.all([
    Repo.getCommit(firstSHA),
    Repo.getCommit(secondSHA)
  ]);
  
  let [firstTree, secondTree] = await Promise.all([
    localCommit.getTree(),
    remoteCommit.getTree()
  ]);

  // return await NodeGit.Diff.treeToTree(Repo, ref.getTree(), matching.getTree());
  return await firstTree.diff(secondTree);
}

const getRefsChanges = async (Repo, refs, currentBranch) => {
  let remoteRefs = refs.filter((_) => _.isRemote);

  let res = [];
  await refs.forEach(async (ref) => {
    if (ref.isBranch) {
      let remoteRefWithDiff = remoteRefs.find(remoteRef => remoteRef.shorthand.indexOf(ref.shorthand) !== -1 && remoteRefs.target !== ref.target);
      if (remoteRefWithDiff) {
        const res = await compareCommits(Repo, ref.target, remoteRefWithDiff.target);
        const filesChanged = res.numDeltas();
        // var stats = await res.getStats();
        // console.log({
        //   filesChanged: stats.filesChanged(),
        //   deletions: stats.deletions(),
        //   insertions: stats.insertions(),
        // })
        console.log({filesChanged});
        ref.diff = filesChanged;
      }
    }
    ref.current = ref.display.includes(currentBranch)
    res.push(ref)
  });

  return res;
}

const getReferences = async (Repo) => {
  try {
    let refs = await Repo.getReferences();
    refs = refs.filter((_) => _.shorthand() !== "stash");

    const commits = refs.map(o => o.target().toString()).join(',');

    let references = refs.map(ref => {
      let display = "";
      if (ref.isBranch()) {
        display = ref.shorthand();
      } else if (ref.isRemote()) {
        let names = ref.shorthand().split("/");
        display = names.splice(1, names.length).join("/");
      } else if (ref.isTag()) {
        display = ref.shorthand();
      }
      return {
        target: ref.target().toString(),
        isBranch: ref.isBranch(),
        isRemote: ref.isRemote(),
        isTag: ref.isTag(),
        name: ref.name(),
        shorthand: ref.shorthand(),
        display,
        diff: 0,
        current: false
      };
    });
    let refDict = {};
    references.forEach((ref) => {
      if (refDict[ref.target]) {
        refDict[ref.target].push(ref);
      } else {
        refDict[ref.target] = [ref];
      }
    });
    return { references, refDict, commits };
  } catch (err) {
    console.warn("getReferences", { err });
    return { references: [], refDict: null, commits: '' };
  }
};

const getSubmodules = async (Repo) => {
  let submodules = await Repo.getSubmodules();
  return submodules.map((submodule) => ({
    hid: submodule.headId().toString(),
    path: submodule.path(),
  }));
};

// const getSubmoduleDetails = async (Repo, name) => {
//   let submodule = await NodeGit.Submodule.lookup(Repo, name);
//   let result = {};
//   result.hid = submodule.headId().toString();
//   result.path = submodule.path();
//   let subm = await submodule.open();
//   let cmt = await subm.getCommit(result.hid);
//   result.message = cmt.message().split("\n")[0];
//   result.detail = cmt
//     .message()
//     .split("\n")
//     .splice(1, cmt.message().split("\n").length)
//     .join("\n");
//   result.date = cmt.date();
//   result.time = cmt.time();
//   result.committer = cmt.committer();
//   result.email = cmt.author().email();
//   result.author = cmt.author().name();
//   return result;
// };

const getCommitDetails = async (Repo, sha) => {
  if (typeof Repo.getCommit !== 'function') {
    return;
  }
  let x = await Repo.getCommit(sha);
  let [diff] = await x.getDiff();
  let patches = await diff.findSimilar({ renameThreshold: 50 }).then(() => {
      return diff.patches();
  })
  let modified = 0;
  let added = 0;
  let deleted = 0;
  let renamed = 0;
  let files = [];
  patches.forEach(p => {
    let existingPaths = files.map(f => f.path);
    if (existingPaths.indexOf(p.newFile().path()) === -1) {
      if (p.isRenamed()) {
        renamed += 1;
      } else if (p.isModified()) {
        modified += 1;
      } else if (p.isDeleted()) {
        deleted += 1;
      } else if (p.isAdded()) {
        added += 1;
      }
      files.push({
        isModified: p.isModified(),
        isAdded: p.isAdded(),
        isDeleted: p.isDeleted(),
        isRenamed: p.isRenamed(),
        path: p.newFile().path()
      })
    }
  });
  return {
    sha: x.sha(),
    message: x.message().split('\n')[0],
    detail: x.message().split('\n').splice(1, x.message().split('\n').length).join('\n'),
    date: x.date(),
    time: x.time(),
    committer: x.committer(),
    email: x.author().email(),
    author: x.author().name(),
    parents: x.parents().map(p => p.toString()),
    fileSummary: {
      added: added,
      deleted: deleted,
      modified: modified,
      renamed: renamed,
    },
    files: files
  }
}

const stageAll = async (Repo, paths) => {
    let statuses = await Repo.getStatus();
    let index = await Repo.refreshIndex();
    let req = [];
    statuses.forEach(st => {
      if (paths.indexOf(st.path()) !== -1 || paths.length === 0) {
        if (st.isDeleted()) {
          req.push(index.removeByPath(st.path()));
        } else {
          req.push(index.addByPath(st.path()));
        }
      }
    });
    await Promise.all(req);
    await index.write();
}

const unstageAll = async (Repo, paths) => {
  let commit = await Repo.getHeadCommit();
  await NodeGit.Reset.default(Repo, commit, paths);
}

const repoCallbacks = (auth) => {
  return {
    callbacks: {
      credentials: (url, userName) => {
        if (isSSH(url)) {
          if (auth.useSshLocalAgent) {
            return NodeGit.Cred.sshKeyFromAgent(userName);
          }
          return NodeGit.Cred.sshKeyMemoryNew(userName, auth.sshPublicContent, auth.sshPrivateContent, auth.password)
        }
        return NodeGit.Cred.userpassPlaintextNew(auth.username, auth.password);
      },
      certificateCheck: () => 1
    }
  }
}

const fetchAll = async (Repo, auth: IAuth) => {
  return await Repo.fetchAll(repoCallbacks(auth));
}

const getCurrentFirstRemote = async (Repo) => {
  const [firstRemote] = await Repo.getRemotes();
  if (!firstRemote) {
    return Promise.reject('NO_REMOTE');
  }
  return firstRemote;
}

const fetch = async (Repo, auth: IAuth) => {
  const remote = await getCurrentFirstRemote(Repo);
  return await Repo.fetch(remote, repoCallbacks(auth));
}

export const pull = async (Repo, origin, branch, auth) => {
  await Repo.fetch(origin, repoCallbacks(auth));
  return Repo.mergeBranches(branch, `${origin}/${branch}`)
}

export const push = async (repo, origin, branches, auth) => {
  const remote = await repo.getRemote(origin);
  const refs = branches.map((branch) => `${branch.path}:${branch.path}`);
  return remote.push(refs, repoCallbacks(auth))
}

export default {
  openRepo,
  getCommits,
  getStatus,
  getCurrentBranch,
  getReferences,
  getRefsChanges,
  getSubmodules,
  // getSubmoduleDetails,
  getCommitDetails,
  stageAll,
  unstageAll,
  fetchAll,
  fetch,
  pull,
  push,
};
