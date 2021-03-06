import NodeGit, { Repository, Signature } from "nodegit"
import { isSSH } from "../Support/Utils"
import { IAuth, IRefDict, IReference, IRefs, ICommit, IStatusCommit } from "../Support/Interfaces";

export const openRepo = async (path: string) : Promise<Repository> => {
  return NodeGit.Repository.open(path);
};

export const getCommits = async (Repo: Repository, count: number = 500) : Promise<ICommit[]> => {
  let walker = NodeGit.Revwalk.create(Repo);
  //@ts-ignore
  walker.sorting(NodeGit.Revwalk.SORT.TOPOLOGICAL, NodeGit.Revwalk.SORT.TIME);
  walker.pushGlob("*");
  let stashes = [];
  await NodeGit.Stash.foreach(Repo, (index, msg, oid) => {
    stashes.push(oid.toString());
    walker.push(oid);
  });
  const res = await walker.getCommits(count);
  let commits = [];
  let stashIndicies = [];
  res.forEach((x) => {
    let stashIndex = stashes.indexOf(x.sha());
    let isStash = false;
    let parents = x.parents().map((p) => p.toString());
    if (stashIndex !== -1) {
      isStash = true;
      parents = [x.parents()[0].toString()];
      if (x.parents().length > 0) {
        for (let i = 1; i < x.parents().length; i++) {
          stashIndicies.push(x.parents()[i].toString());
        }
      }
    }
    if (stashIndicies.indexOf(x.sha()) === -1) {
      commits.push({
        sha: x.sha(),
        message: x.message().split("\n")[0],
        detail: x
          .message()
          .split("\n")
          .splice(1, x.message().split("\n").length)
          .join("\n"),
        date: x.date(),
        time: x.time(),
        committer: x.committer().name(),
        email: x.author().email(),
        author: x.author().name(),
        parents: parents,
        isStash: isStash,
        stashIndex: stashIndex,
      });
    }
  });
  return commits;
};

export const getStatus = async (Repo: Repository) : Promise<IStatusCommit> => {
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
      isConflicted: !!status.isConflicted(),
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
    if (status.isConflicted()) {
      unstaged.push(item);
    }
  });
  return {
    enabled: (staged.length > 0 || unstaged.length > 0),
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

export const getCurrentBranch = async (Repo: Repository) => {
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

export const compareCommits = async (Repo: Repository, firstSHA: string, secondSHA: string) => {

  let [localCommit, remoteCommit] = await Promise.all([
    Repo.getCommit(firstSHA),
    Repo.getCommit(secondSHA)
  ]);
  
  let [firstTree, secondTree] = await Promise.all([
    localCommit.getTree(),
    remoteCommit.getTree()
  ]);

  // const num = NodeGit.Tree.entryCmp(firstTree, secondTree);

  // return await NodeGit.Diff.treeToTree(Repo, ref.getTree(), matching.getTree());
  return await firstTree.diff(secondTree);
}

export const getRefsChanges = async (Repo: Repository, refs: IReference[]) : Promise<IReference[]> => {
  let remoteRefs = refs.filter((_) => _.isRemote);

  let res = [];
  for(let ref of refs) {
    if (ref.isBranch) {
      let remoteRefWithDiff = remoteRefs.find(remoteRef => remoteRef.shorthand.indexOf(ref.shorthand) !== -1 && remoteRef.target !== ref.target);
      if (remoteRefWithDiff) {
        const local = NodeGit.Oid.fromString(ref.target);
        const upstream = NodeGit.Oid.fromString(remoteRefWithDiff.target);
        //@ts-ignore
        ref.diff = await NodeGit.Graph.aheadBehind(Repo, local, upstream);
      }
    }
    res.push(ref)
  };

  return res;
}

export const getReferences = async (Repo: Repository) : Promise<IRefs> => {
  try {
    let refs = await Repo.getReferences();
    refs = refs.filter((_) => _.shorthand() !== "stash");

    const commits = refs.map(o => o.target().toString()).join(',');

    let references = refs.map((ref) : IReference => {
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
        display,
        target: ref.target().toString(),
        isBranch: !!ref.isBranch(),
        isRemote: !!ref.isRemote(),
        isTag: !!ref.isTag(),
        name: ref.name(),
        shorthand: ref.shorthand(),
        diff: { ahead: 0, behind: 0 },
      };
    });
    let refDict = {} as IRefDict;
    references.forEach((ref : IReference) => {
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

export const getSubmodules = async (Repo) => {
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
//   result.committer = cmt.committer().name();
//   result.email = cmt.author().email();
//   result.author = cmt.author().name();
//   return result;
// };

export const getCommitDetails = async (Repo: Repository, sha: string) : Promise<ICommit> => {
  if (typeof Repo.getCommit !== 'function') {
    return null;
  }
  let commit = await Repo.getCommit(sha);
  let [diff] = await commit.getDiff();
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
    sha: commit.sha(),
    message: commit.message().split('\n')[0],
    detail: commit.message().split('\n').splice(1, commit.message().split('\n').length).join('\n'),
    date: commit.date(),
    time: commit.time(),
    committer: commit.committer().name(),
    email: commit.author().email(),
    author: commit.author().name(),
    parents: commit.parents().map(p => p.toString()),
    fileSummary: {
      added: added,
      deleted: deleted,
      modified: modified,
      renamed: renamed,
    },
    files: files
  }
}

export const stage = async (Repo, paths) => {
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

export const unstage = async (Repo: Repository, paths: string[]) => {
  let commit = await Repo.getHeadCommit();
  await NodeGit.Reset.default(Repo, commit, paths);
}

export const repoCallbacks = (auth: IAuth) => {
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
      certificateCheck: () => 1,
      transferProgress: (stats) => {
        const progress = (100 * (stats.receivedObjects() + stats.indexedObjects())) / (stats.totalObjects() * 2);
        console.log({progress});
      }
    }
  }
}

export const fetchAll = async (Repo: Repository, auth: IAuth) => {
  return await Repo.fetchAll(repoCallbacks(auth));
}

export const getCurrentFirstRemote = async (Repo: Repository) => {
  const [firstRemote] = await Repo.getRemotes();
  if (!firstRemote) {
    throw new Error('No remote found');
  }
  return firstRemote;
}

export const fetch = async (Repo: Repository, auth: IAuth) => {
  const remote = await getCurrentFirstRemote(Repo);
  return await Repo.fetch(remote, repoCallbacks(auth));
}

export const pull = async (Repo: Repository, reference: IReference = null, auth: IAuth) => {
  const remote = await getCurrentFirstRemote(Repo);
  await Repo.fetch(remote, repoCallbacks(auth));

  if (reference) {
    const branch = reference.shorthand;
    return Repo.mergeBranches(branch, `${remote.name()}/${branch}`);
  }
  else {
    const head = await Repo.head();
    return Repo.mergeBranches(head, `${remote.name()}/${head.shorthand()}`);
  }
}

export const push = async (Repo: Repository, reference: IReference = null, auth: IAuth) => {
  const remote = await getCurrentFirstRemote(Repo);
  await Repo.fetch(remote, repoCallbacks(auth));

  if (reference) {
    const branch = reference.shorthand;
    const ref = await Repo.getReference(branch);
    return remote.push([ref], repoCallbacks(auth));
  }
  else {
    const head = await Repo.head();
    return remote.push([head], repoCallbacks(auth));
  }
}

export const checkout = async (Repo: Repository, reference: IReference) => {
  const branch = reference.shorthand;
  const ref = await Repo.getReference(branch);
  if (reference.isRemote && !reference.isBranch) {
    // Removes 'origin/' from branch name
    const newName = branch.split('/').slice(1).join('/');
    const localRef = await Repo.createBranch(newName, ref.target(), true);
    await NodeGit.Branch.setUpstream(localRef, branch);
    return Repo.checkoutBranch(localRef);
  }
  else {
    return Repo.checkoutBranch(ref);
  }
}

export const discardAll = async (Repo: Repository) => {
  await stage(Repo, []);
  const commit = await Repo.getHeadCommit();
  //@ts-ignore
  await NodeGit.Reset.reset(Repo, commit, NodeGit.Reset.TYPE.HARD, {});
}

export const getSignature = async (Repo: Repository) : Promise<Signature> => {
  try {
    //@ts-ignore
    const { email, name } = Repo.ident();
    if (email && name) {
      return NodeGit.Signature.now(name, email);
    }
    return NodeGit.Signature.default(Repo);
  } catch(err) {
    return NodeGit.Signature.now("unknown", "unknown");
  }
}

export const commit = async (Repo: Repository, summary: string, description: string) => {
  const index = await Repo.index();
  await index.writeTree();

  const signature = await getSignature(Repo);
  const oid = await index.writeTree();
  const parent = await Repo.getHeadCommit();

  const message = description ? `${summary}\n\n${description}` : summary;

  await Repo.createCommit("HEAD", signature, signature, message, oid, [parent]);
}

export const createBranch = async (Repo: Repository, branchName: string, sha?: string) => {
  const commit = sha ? await Repo.getCommit(sha) : await Repo.getHeadCommit();
  
  const ref = await Repo.createBranch(branchName, commit, false);
  return Repo.checkoutBranch(ref);
}

export const dropStash = (Repo: Repository, index: number) => {
  return NodeGit.Stash.drop(Repo, index)
}

export const applyStash = (Repo: Repository, index: number) => {
  //@ts-ignore
  return NodeGit.Stash.apply(Repo, index, NodeGit.Stash.APPLY_FLAGS.APPLY_DEFAULT)
}

export const popStash = (Repo: Repository, index: number = 0) => {
  //@ts-ignore
  return NodeGit.Stash.pop(Repo, index, NodeGit.Stash.APPLY_FLAGS.APPLY_DEFAULT)
}

export const saveStash = async (Repo: Repository) => {
  const signature = await getSignature(Repo);
  //@ts-ignore
  return NodeGit.Stash.save(Repo, signature, "", NodeGit.Stash.FLAGS.DEFAULT)
}

// eslint-disable-next-line import/no-anonymous-default-export
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
  stage,
  unstage,
  fetchAll,
  fetch,
  pull,
  push,
  checkout,
  discardAll,
  getSignature,
  commit,
  createBranch,
  compareCommits,
  dropStash,
  applyStash,
  popStash,
  saveStash,
};
