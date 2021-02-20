import NodeGit from "nodegit";

export class FileDetails {

  constructor(Repo) {
    this.Repo = Repo;
  }

  getFileDetail(path, commit, fullFile = false) {
    if (commit === 'tree') {
      let index;
      return this.Repo.index().then(ind => {
        index = ind;
        return this.Repo.getHeadCommit().then(cmt => {
          return cmt.getTree();
        }).then(tree => {
          return NodeGit.Diff.treeToIndex(this.Repo, tree, index);
        }).catch(err => {
          return NodeGit.Diff.treeToIndex(this.Repo, null, index);
        })
      }).then(diff => {
        return this.processDiff(diff, path, commit, fullFile);
      })
    } else if (commit === 'workdir') {
      return this.Repo.index().then(ind => {
        return NodeGit.Diff.indexToWorkdir(this.Repo, ind, {
          flags: NodeGit.Diff.OPTION.SHOW_UNTRACKED_CONTENT | NodeGit.Diff.OPTION.RECURSE_UNTRACKED_DIRS
        })
      }).then(diff => {
        return this.processDiff(diff, path, commit, fullFile);
      })
    } else {
      return this.Repo.getCommit(commit).then(x => {
        return x.getDiff().then(diffs => {
          return diffs[0];
        }).then(diff => {
          return this.processDiff(diff, path, commit, fullFile);
        })
      });
    }
  }

  processDiff(diff, path, commit, fullFile = false) {
    return diff.findSimilar({ renameThreshold: 50 }).then(() => {
      return diff.patches()
    }).then(async patches => {
      let patch;
      patches.forEach(p => {
        if (p.newFile().path() === path) {
          patch = p;
        }
      });
      if (patch) {
        const hunks = await patch.hunks();
        const result = [];
        for(let hunk of hunks){
          let lines = await hunk.lines();
          const changes = lines.map(line => {
            const op = String.fromCharCode(line.origin());
            const isNewLine = ['<','>','='].includes(op);
            const isNormal = op === " ";
            const isInsert = op === "+";
            const isDelete = op === "-";
            let type = 'normal';
            let lineNumber = line.newLineno();
            if (isInsert) {
              type = 'insert';
              lineNumber = line.newLineno();
            }
            if (isDelete) {
              type = 'delete';
              lineNumber = line.oldLineno();
            }
            return {
              type,
              content: isNewLine ? line.content().trim() : line.content(),
              isNormal,
              isInsert,
              isDelete,
              lineNumber,
              oldLineNumber: line.oldLineno(),
              newLineNumber: line.newLineno(),
              op,
            }
          })
          result.push({
            oldStart: hunk.oldStart(),
            oldLines: hunk.oldLines(),
            newStart: hunk.newStart(),
            newLines: hunk.newLines(),
            content: hunk.header(),
            highlight: true,
            changes: changes
          })
        }
        return result;
      } else {
        return Promise.reject('FILE_NOT_FOUND');
      }
    });
  }

  getFileLines(commit, path) {
    let getCmtPromise;
    if (commit === 'workdir' || commit === 'tree') {
      getCmtPromise = this.Repo.getHeadCommit();
    } else {
      getCmtPromise = this.Repo.getCommit(commit)
    };
    return getCmtPromise.then(cmt => {
      return cmt.getTree();
    }).then(tree => {
      return tree.getEntry(path);
    }).then(treeEntry => {
      if (treeEntry.isFile()) {
        return treeEntry.getBlob();
      } else {
        return Promise.reject('PATH_NOT_FILE');
      }
    }).then(blob => {
      if (blob.isBinary()) {
        return [{ op: "binary", content: "Binary File Content", oldLineno: -1, newLineno: -1 }]
      }
      let lines = blob.toString().split(/\r?\n/);
      let hunkLike = lines.map((l, index) => {
        return {
          op: "",
          content: l,
          oldLineno: -1,
          newLineno: index + 1
        }
      })
      return hunkLike;
    }).catch(err => {
      return Promise.resolve([]);
    });
  }
}