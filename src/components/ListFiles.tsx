import React from "react";
import {
  FiFileText as FileIcon,
  FiFilePlus as FilePlusIcon,
  FiFileMinus as FileMinusIcon,
} from 'react-icons/fi';
import {
  FaRegCopy as FileCopyIcon
} from 'react-icons/fa';
import { IFile } from "../utils/interfaces";


const ListFiles = (props) => {
    const { sha, files, selectedFile, setSelectedFile } = props;

  const getShortenedPath = (path : string) => {
    if (path.length > 55) {
      let front = path.substring(0, 20);
      let over = path.length - 55 - 3;
      let back = path.substring(20 + over, path.length);
      return `${front}...${back}`;
    }
    return path;
  }
  
  return (
  <>
    <span className="text-md font-bold mb-2">File Details</span>
    <div className="modified-file-list p-2">
      {
        files.map((file : IFile, key : number) => (
        <div key={key} className={`modified-file-entry p-1 flex cursor-pointer ${selectedFile.path === file.path ? "bg-gray-700" : "hover:bg-gray-800"}`} onClick={() => setSelectedFile({
          commit: sha,
          path: file.path,
          diffType: file.isRenamed ? 'rename' : file.isModified ? 'modify' : file.isAdded ? 'add' : file.isDeleted ? 'delete' : 'copy'
        })}>
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
        { getShortenedPath(file.path) }
      </div>
      ))
      }
    </div>
  </>
  )
}

export default ListFiles;