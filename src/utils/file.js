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

  async processDiff(diff, path, commit, fullFile = false) {
    await diff.findSimilar({ renameThreshold: 50 });
    let patches = await diff.patches();
    let patch;
    patches.forEach(p => {
      if (p.newFile().path() === path) {
        patch = p;
      }
    });
    if (!patch) {
      return Promise.reject('FILE_NOT_FOUND');
    }
    const hunks = await patch.hunks();
    const result = [];
    for(let hunk of hunks) {
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
    if (!fullFile) {
      return result;
    }
    else {
      let hunkLikeLines = await this.getFileLines(commit, path);
      for (let j = 0; j < result.length; j++) {
        for (let i = 0; i < hunkLikeLines.length; i++) {
          if (hunkLikeLines[i].newLineNumber === result[j].changes[0].newLineNumber ||
            hunkLikeLines[i].newLineNumber === result[j].changes[0].oldLineNumber) {
            // found a line with a hunk starting the line
            // get ending line number
            let lastLineNum = result[j].changes[result[j].changes.length - 1].newLineNumber;
            // get endling line index in hunkLikeLines
            let iEnd;
            for (iEnd = i; iEnd < hunkLikeLines.length; iEnd++) {
              if (hunkLikeLines[iEnd].newLineNumber === lastLineNum) {
                break;
              }
            }
            let lineCount = iEnd - i + 1;
            hunkLikeLines.splice(i, lineCount, ...result[j].changes);
            break;
          }
        }
      }
      if (hunkLikeLines.length === 0) {
        return result;
      }
      return [{
        changes: hunkLikeLines,
        newStart: 1,
        oldStart: 1,
        oldLines: hunkLikeLines[hunkLikeLines.length - 1].oldLineNumber,
        newLines: hunkLikeLines[hunkLikeLines.length - 1].newLineNumber,
      }];
    }
  }

  async getFileLines(commit, path) {
    try {
      let cmt = ['workdir','tree'].includes(commit)
        ? await this.Repo.getHeadCommit()
        : await this.Repo.getCommit(commit);
      let tree = await cmt.getTree();
      let treeEntry = await tree.getEntry(path);
      if (!treeEntry.isFile()) {
        return Promise.reject('PATH_NOT_FILE');
      }
      let blob = await treeEntry.getBlob();
      if (blob.isBinary()) {
        return [{ op: "binary", content: "Binary File Content", oldLineNumber: -1, newLineNumber: -1 }]
      }
      let lines = blob.toString().split(/\r?\n/);
      let hunkLike = lines.map((l, index) => {
        return {
          op: " ",
          type: "normal",
          content: l,
          oldLineNumber: index + 1,
          newLineNumber: index + 1,
          lineNumber: index + 1,
          isNormal: true,
          isInsert: false,
          isDelete: false,
        }
      })
      return hunkLike;
    } catch(err) {
      return Promise.resolve([]);
    }
  }
}