import NodeGit from "nodegit";

export class FileDetails {

  constructor(Repo) {
    this.Repo = Repo;
  }

  async getFileDetail(path, commit, fullFile = false) {
    if (commit === 'tree') {
      let index = await this.Repo.index();
      let cmt = await this.Repo.getHeadCommit();
      let tree = await cmt.getTree();
      try {
        let diff = await NodeGit.Diff.treeToIndex(this.Repo, tree, index);
        return this.processDiff(diff, path, commit, fullFile);
      } catch(err) {
        let diff = await NodeGit.Diff.treeToIndex(this.Repo, null, index);
        return this.processDiff(diff, path, commit, fullFile);
      }
    } else if (commit === 'workdir') {
      let index = await this.Repo.index();
      let diff = await NodeGit.Diff.indexToWorkdir(this.Repo, index, {
        flags: NodeGit.Diff.OPTION.SHOW_UNTRACKED_CONTENT | NodeGit.Diff.OPTION.RECURSE_UNTRACKED_DIRS
      });
      return this.processDiff(diff, path, commit, fullFile);
    } else {
      let x = await this.Repo.getCommit(commit);
      let [diff] = await x.getDiff();
      return this.processDiff(diff, path, commit, fullFile);
    }
  }

  async processDiff(diff, path, commit, fullFile = false) {
    await diff.findSimilar({ renameThreshold: 50 });
    let patches = await diff.patches();
    let patch = patches.find(p => p.newFile().path() === path);
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
      // Carriage-return is getting wrong on diff view with highlight
      // then let's remove
      return result.map(hunk => {
        hunk.changes = hunk.changes.map(line => {
          line.content = line.content.replace(/(\r\n|\n|\r)/gm, "");
          return line;
        })
        return hunk;
      });
    }
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
      // Carriage-return is getting wrong on diff view with highlight
      // then let's remove
      return result.map(hunk => {
        hunk.changes = hunk.changes.map(line => {
          line.content = line.content.replace(/(\r\n|\n|\r)/gm, "");
          return line;
        })
        return hunk;
      });
    }

    let oldLineNumber = 1;
    let newLineNumber = 1;
    hunkLikeLines = hunkLikeLines.map(line => {
      if (!line.isInsert) {
        line.oldLineNumber = oldLineNumber++;
        line.lineNumber = line.oldLineNumber;
      }
      if (!line.isDelete) {
        line.newLineNumber = newLineNumber++;
        line.lineNumber = line.newLineNumber;
      }
      // Carriage-return is getting wrong on diff view with highlight
      // then let's remove
      line.content = line.content.replace(/(\r\n|\n|\r)/gm, "");
      return line;
    });

    return [{
      changes: hunkLikeLines,
      newStart: 1,
      oldStart: 1,
      oldLines: hunkLikeLines[hunkLikeLines.length - 1].oldLineNumber,
      newLines: hunkLikeLines[hunkLikeLines.length - 1].newLineNumber,
      content: '-',
    }];
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