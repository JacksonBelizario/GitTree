import NodeGit from "nodegit";
import {formatLines, diffLines} from 'unidiff';
import {parseDiff} from 'react-diff-view';

const fs = window.require('fs');

export class FileDetails {

  constructor(Repo) {
    this.Repo = Repo;
  }

  async getFileDetail(path, commit, fullFile = false, ignoreWhiteSpaces = true) {
    let diffOptions = {
      flags: NodeGit.Diff.OPTION.NORMAL
    };
    if (ignoreWhiteSpaces) {
      diffOptions.flags |= NodeGit.Diff.OPTION.IGNORE_WHITESPACE | NodeGit.Diff.OPTION.IGNORE_WHITESPACE_CHANGE | NodeGit.Diff.OPTION.IGNORE_WHITESPACE_EOL
    }
    if (commit === 'tree') {
      let index = await this.Repo.index();
      let cmt = await this.Repo.getHeadCommit();
      let tree = await cmt.getTree();
      try {
        let diff = await NodeGit.Diff.treeToIndex(this.Repo, tree, index, diffOptions);
        return this.processDiff(diff, path, commit, fullFile);
      } catch(err) {
        let diff = await NodeGit.Diff.treeToIndex(this.Repo, null, index, diffOptions);
        return this.processDiff(diff, path, commit, fullFile);
      }
    } else if (commit === 'workdir') {
      let index = await this.Repo.index();
      // if (index.hasConflicts()) {
      //   let conflict = await index.conflictGet(path);
      //   if (conflict) {
      //     return this.processConflictedDiff(conflict, path);
      //   }
      // }
      diffOptions.flags |= NodeGit.Diff.OPTION.SHOW_UNTRACKED_CONTENT | NodeGit.Diff.OPTION.RECURSE_UNTRACKED_DIRS;
      let diff = await NodeGit.Diff.indexToWorkdir(this.Repo, index, diffOptions);
      return this.processDiff(diff, path, commit, fullFile);
    } else {
      let x = await this.Repo.getCommit(commit);
      let [diff] = await x.getDiffWithOptions(diffOptions);
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
      this.removeEOL(result);
      return this.removeCarriageReturn(result);
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
      this.removeEOL(result);
      return this.removeCarriageReturn(result);
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

    const oldLines = hunkLikeLines[hunkLikeLines.length - 1].oldLineNumber;
    const newLines = hunkLikeLines[hunkLikeLines.length - 1].newLineNumber;

    return [{
      changes: hunkLikeLines,
      newStart: 1,
      oldStart: 1,
      oldLines,
      newLines,
      content: `@@ -1,${oldLines} +1,${newLines} @@`,
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
      if (lines.length > 0 && lines[lines.length -1].content === '\\ No newline at end of file') {
        lines.pop();
      }
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

  async processConflictedDiff(conflict, path) {
    let [ancestorBlob, ourBlob, theirBlob] = await Promise.all([
      this.Repo.getBlob(conflict.ancestor_out.id),
      this.Repo.getBlob(conflict.our_out.id),
      this.Repo.getBlob(conflict.their_out.id)
    ]);

    let hunks = [];
    let lines = [];
    await NodeGit.Diff.blobToBuffer(ourBlob, null, theirBlob.toString(), null, null, null,
      function() {/** Binary callback */},
      function(diffDelta, hunk) {
        // Hunk callback
        hunks.push({
          oldStart: hunk.oldStart(),
          oldLines: hunk.oldLines(),
          newStart: hunk.newStart(),
          newLines: hunk.newLines(),
          content: hunk.header(),
          highlight: true,
          changes: []
        });
      },
      function(diffDelta, diffHunk, line) {
        // Line callback
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
        lines.push({
          type,
          content: isNewLine ? line.content().trim() : line.content(),
          isNormal,
          isInsert,
          isDelete,
          lineNumber,
          oldLineNumber: line.oldLineno(),
          newLineNumber: line.newLineno(),
        });
      });
      
    const result = hunks.map(hunk => {
      return {
        ...hunk,
        changes: lines.splice(0, hunk.newLines + hunk.oldLines)
      }
    });
    this.removeEOL(result);
    return this.removeCarriageReturn(result);
  }

  async getDiffBetween(fromCommitSHA, toCommitSHA) {
    const from = await this.Repo.getCommit(fromCommitSHA);
    const fromTree = await from.getTree();

    const to = await this.Repo.getCommit(toCommitSHA);
    const toTree = await to.getTree();

    const diff = await toTree.diff(fromTree);
    const patches = await diff.patches();

    for (const patch of patches) {
      console.log(patch.newFile().path());
    }
  }

  async getConflictDiff(path) {
    let index = await this.Repo.index();
    if (!index.hasConflicts()) {
      return;
    }

    const fullPath = this.Repo.workdir() + path;

    const conflictedText = fs.readFileSync(fullPath, { encoding: "ascii" });

    // const regexp = RegExp('<<<<<<< HEAD(.+?)=======(.+?)>>>>>>> master','g');
    const regexp = /(<<<<<<<.+?[\r\n|\r|\n])(.+?)([\s\S]=======[\s\S])(.+?)([\s\S]>>>>>>>.+?[\r\n|\r|\n])/sg;
    const matches = conflictedText.matchAll(regexp);
    
    let firstText = conflictedText;
    let secondText = conflictedText;
    for (const match of matches) {
      firstText = firstText.replace(match[0], match[2]);
      secondText = secondText.replace(match[0], match[4]);
    }

    const diffText = formatLines(diffLines(firstText, secondText), { context: 10000 });
    
    let [diff] = parseDiff(diffText, {nearbySequences: 'zip'});
    return {
      diff: diff,
      source: firstText,
    };
  }
  
  /**
   * remove 'No newline at end of file' warning
   * @param {*} result 
   * @returns 
   */
  removeEOL(result) {
    if (result.length === 0 || result[result.length -1].changes.length === 0) {
      return;
    }
    if (result[result.length -1].changes[result[result.length -1].changes.length -1].content === '\\ No newline at end of file') {
      result[result.length -1].changes.pop();
    }
  }

  /**
   * Carriage-return is getting wrong on diff view with highlight
   * then let's remove
   * @param {*} result 
   * @returns 
   */
  removeCarriageReturn(result) {
    return result.map(hunk => {
      hunk.changes = hunk.changes.map(line => {
        line.content = line.content.replace(/(\r\n|\n|\r)/gm, "");
        return line;
      })
      return hunk;
    })
  }
}