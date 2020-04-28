import React, { useState, useEffect } from 'react';

import { Author } from "../models/Author";

import { connect } from 'redux-zero/react';
import { IStore } from '../store/store';
import { IRepo } from '../utils/interfaces';

import Git from "../utils/git";

import '../assets/scss/commit-detail.scss';
import moment from 'moment';

import {
  FiFileText as FileIcon,
  FiFilePlus as FilePlusIcon,
  FiFileMinus as FileMinusIcon,
  FiGitCommit as CommitIcon,
  FiGitMerge as MergeIcon
} from 'react-icons/fi';
import {
  FaRegCopy as FileCopyIcon
} from 'react-icons/fa';

interface StoreProps {
  repo: IRepo;
  sha: string;
}

interface IFile {
  isModified: boolean;
  isAdded: boolean;
  isDeleted: boolean;
  isRenamed: boolean;
  path: string;
}

interface IDetails {
  sha: string;
  message: string;
  detail: string;
  date: Date;
  time: number;
  committer: any
  email: string;
  author: string;
  parents: string[];
  fileSummary: {
    added: number,
    deleted: number,
    modified: number,
    renamed: number
  }
  files: IFile[]
}

const mapToProps = (state: IStore): StoreProps => ({
  repo: state.repo,
  sha: state.selectedCommit,
});

const CommitDetail = (props : StoreProps) => {
  const { repo, sha } = props;

  useEffect(() => {
    getCommitDetails(repo, sha);
  }, [repo, sha]);

  const getCommitDetails = async (repo : IRepo, sha : string) => {
    if(!repo || !sha || sha === "000000") return;
    try {
      const details = await Git.getCommitDetails(repo, sha);
      console.log({details});
      setDetails(details);
    } catch(err) {
      console.log({err});
    }
  }

  const [details, setDetails] = useState<IDetails | null>(null);

  const getShortenedPath = (path : string) => {
    if (path.length > 55) {
      let front = path.substring(0, 20);
      let over = path.length - 55 - 3;
      let back = path.substring(20 + over, path.length);
      return `${front}...${back}`;
    }
    return path;
  }

  if(!details) {
    return <></>
  }
 
  return (
    <div className="commit-details-parent">
      <div className="commit-details flex mb-5">
        <div className="committer-badge mr-3"
          style={Author.getColors(details.email)}>
          {Author.getAcronym(details.author)}
        </div>
        <div className="committer-info-container flex flex-col">
          <span className="text-lg">{details.author}</span>
          <small>{details.email}</small>
          <small>{moment(details.date).format("YYYY-MM-DD")}</small>
        </div>
        <div className="flex flex-col text-right">
          <small className="flex"><CommitIcon />{sha.substring(0, 6)}</small>
          {
            details.parents.map((parent: string, idx: number) =>
              <small key={idx} className="flex"><MergeIcon />{parent.substring(0, 6)}</small>
            )
          }
        </div>
      </div>
      <div className="modified-file-list flex p-2 my-3">{details.message}</div>
      <div className="file-details-container flex flex-col">
        <span className="text-md font-bold">File Details</span>
        <div className="modified-file-list p-2">
          { details.files.map((file : IFile, key : number) => (
            <div key={key} className="modified-file-entry p-1 flex cursor-pointer hover:bg-gray-800">
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
      </div>
    </div>
  )
}

export default connect<IStore>(mapToProps)(CommitDetail);