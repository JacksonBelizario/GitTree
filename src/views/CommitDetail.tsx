import React, { useState, useEffect } from 'react';

import { Author } from "../models/Author";

import { connect } from 'redux-zero/react';
import { IStore } from '../store/store';
import { IRepo, ISelectedFile, ICommitDetail, IFile, IWipCommit } from '../utils/interfaces';
import ListFiles from "../components/ListFiles";

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
import actions from '../store/actions';
import { BoundActions } from 'redux-zero/types';
import { Button, Intent } from '@blueprintjs/core';

interface StoreProps {
  repo: IRepo;
  sha: string;
  selectedFile: ISelectedFile;
  wipCommit: IWipCommit;
}

const mapToProps = (state: IStore): StoreProps => ({
  repo: state.repo,
  sha: state.selectedCommit,
  selectedFile: state.selectedFile,
  wipCommit: state.wipCommit,
});

type CommitDetailProps = StoreProps & BoundActions<IStore, typeof actions>;

const CommitDetail = (props : CommitDetailProps) => {
  const { repo, sha, selectedFile, setSelectedFile, setSelectedCommit, wipCommit } = props;

  useEffect(() => {
    getCommitDetails(repo, sha);
  }, [repo, sha]);

  const getCommitDetails = async (repo : IRepo, sha : string) => {
    console.log("getCommitDetail");
    if (sha === "workdir") {
      setDetails(wipCommit);
      console.log({details: wipCommit});
    }
    if(!repo || !sha || sha === "workdir") return;
    try {
      const details = await Git.getCommitDetails(repo, sha);
      console.log({details});
      setDetails(details);
    } catch(err) {
      console.log({err});
    }
  }

  const [details, setDetails] = useState<ICommitDetail | IWipCommit | null>(null);

  if(!details) {
    return <></>
  }
 
  return (
    <div className="commit-details-parent flex flex-col">
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
          <Button className="mb-1 ml-1 cursor-default" icon={<CommitIcon />} intent={Intent.NONE}>{sha.substring(0, 6)}</Button>
          <span className="flex flex-row text-right">
          {
            details.parents.map((parent: string, idx: number) =>
              <Button key={idx} className="ml-1" icon={<MergeIcon />} intent={Intent.PRIMARY} onClick={() => setSelectedCommit(parent)}>{parent.substring(0, 6)}</Button>
            )
          }</span>
        </div>
      </div>
      <div className="commit-message flex p-2 my-3">{details.message}</div>
      {
        //@ts-ignore
        details.staged && <ListFiles sha={sha} files={details.staged} selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
      }
      {
        //@ts-ignore
        details.unstaged && <ListFiles sha={sha} files={details.unstaged} selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
      }
      {
        //@ts-ignore
        details.files && <ListFiles sha={sha} files={details.files} selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
      }
    </div>
  )
}

export default connect<IStore>(mapToProps, actions)(CommitDetail);