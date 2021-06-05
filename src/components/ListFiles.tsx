import React from "react";
import { Button, Intent } from '@blueprintjs/core';
import {
  FiFileText as FileIcon,
  FiFilePlus as FilePlusIcon,
  FiFileMinus as FileMinusIcon,
  FiAlertTriangle as AlertIcon,
} from 'react-icons/fi';
import {
  FaRegCopy as FileCopyIcon
} from 'react-icons/fa';
import { IFile } from "../utils/interfaces";
import Git from "../utils/git";


const ListFiles = (props) => {
    const { sha, files, selectedFile, setSelectedFile, repo, updateStatus } = props;

  const getShortenedPath = (path : string) => {
    if (path.length > 55) {
      let front = path.substring(0, 20);
      let over = path.length - 55 - 3;
      let back = path.substring(20 + over, path.length);
      return `${front}...${back}`;
    }
    return path;
  }

  const stage = async (file) => {
    await Git.stage(repo, [file]);
    await updateStatus();
  }

  const unstage = async (file) => {
    await Git.unstage(repo, [file]);
    await updateStatus();
  }
  
  return (
  <>
    <div className="modified-file-list card-field">
      {
        files.map((file : IFile, key : number) => (
        <div
          key={key}
          className={`modified-file-entry p-1 flex cursor-pointer ${selectedFile.path === file.path ? "bg-gray-700" : "hover:bg-gray-800"}`}
          onClick={() => setSelectedFile({ commit: sha, file: file })}
        >
        { file.isModified &&
          <span className="mr-2 text-yellow-500">
            <FileIcon />
          </span>
        }
        { file.isAdded && !file.isRenamed &&
          <span className="mr-2 text-green-500">
            <FilePlusIcon />
          </span>
        }
        { file.isDeleted && !file.isRenamed &&
          <span className="mr-2 text-red-500">
            <FileMinusIcon />
          </span>
        }
        { file.isRenamed &&
          <span className="mr-2 text-blue-500">
            <FileCopyIcon />
          </span>
        }
        { file.isConflicted &&
          <span className="mr-2 text-yellow-500">
            <AlertIcon />
          </span>
        }
        { getShortenedPath(file.path) }
        { sha === 'workdir' &&
          <Button
            className="action-btn"
            intent={Intent.SUCCESS}
            outlined
            onClick={e =>{ e.stopPropagation(); stage(file.path)}}
          >
            Stage file
          </Button>
        }
        { sha === 'tree' &&
          <Button
            className="action-btn"
            intent={Intent.DANGER}
            outlined
            onClick={e =>{ e.stopPropagation(); unstage(file.path)}}
          >
            Unstage file
          </Button>
        }
      </div>
      ))
      }
    </div>
  </>
  )
}

export default ListFiles;