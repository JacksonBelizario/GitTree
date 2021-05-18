import React, { useState, useEffect } from 'react';

import { Author } from "../models/Author";

import { connect } from 'redux-zero/react';
import { IStore } from '../store/store';
import { IRepo, ISelectedFile, ICommitDetail, IWipCommit } from '../utils/interfaces';
import ListFiles from "../components/ListFiles";

import Git from "../utils/git";

import '../assets/scss/commit-detail.scss';
import moment from 'moment';

import {
  FiGitCommit as CommitIcon,
  FiGitMerge as MergeIcon
} from 'react-icons/fi';
import actions from '../store/actions';
import { BoundActions } from 'redux-zero/types';
import { Button, Intent } from '@blueprintjs/core';

interface StoreProps {
  repo: IRepo;
  sha: string;
  selectedFile: ISelectedFile;
  commit: IWipCommit;
}

const mapToProps = (state: IStore): StoreProps => ({
  repo: state.repo,
  sha: state.selectedCommit,
  selectedFile: state.selectedFile,
  commit: state.commit,
});

type CommitDetailProps = StoreProps & BoundActions<IStore, typeof actions>;

const CommitDetail = (props : CommitDetailProps) => {
  const { repo, sha, selectedFile, setSelectedFile, setSelectedCommit, commit, setCommit } = props;

  const [details, setDetails] = useState<ICommitDetail | IWipCommit>();

  const updateStatus = async () => {
    let changes = await Git.getStatus(repo);
    setCommit({...commit, ...changes});
  }

  const stageAll = async () => {
    if (commit.virtual && commit.unstaged.length) {
      let unstagedPaths = commit.unstaged.map(s => s.path);
      await Git.stageAll(repo, unstagedPaths);
      await updateStatus();
    }
  }

  const unstageAll = async () => {
    if (commit.virtual && commit.staged.length) {
      let stagedPaths = commit.staged.map(s => s.path);
      await Git.unstageAll(repo, stagedPaths);
      await updateStatus();
    }
  }

  useEffect(() => {
    const getCommitDetails = async (repo : IRepo, sha : string) => {
      if (sha === "workdir") {
        setDetails(commit);
      }
      else if(!!repo && !!sha) {
        try {
          const details = await Git.getCommitDetails(repo, sha);
          setDetails(details);
        } catch(err) {
          console.warn({err});
        }
      }
    }

    getCommitDetails(repo, sha);
  }, [repo, sha, commit]);

  if (!details) {
    return <></>
  }
 
  return (
    <div className="commit-details-parent flex flex-col">
      {
        sha !== "workdir" && <>
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
        </>
      }
      {
        details.unstaged && <>
          <div className="flex justify-between mb-2">
            <span className="text-md font-bold mt-2">Unstaged Files</span>
            { details.unstaged.length > 0 && <Button className="self-end" onClick={() => stageAll()}>Stage All</Button> }
          </div>
          <ListFiles sha={'workdir'} files={details.unstaged} selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
        </>
      }
      {
        details.staged && <>
          <div className="flex justify-between mb-2">
            <span className="text-md font-bold mt-2">Staged Files</span>
            { details.staged.length > 0 && <Button className="self-end" onClick={() => unstageAll()}>Unstage All</Button> }
          </div>
          <ListFiles sha={'tree'} files={details.staged} selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
        </>
      }
      {
        details.files && <>
          <span className="text-md font-bold mb-2">Changed Files</span>
          <ListFiles sha={sha} files={details.files} selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
        </>
      }
    </div>
  )
}

export default connect<IStore>(mapToProps, actions)(CommitDetail);