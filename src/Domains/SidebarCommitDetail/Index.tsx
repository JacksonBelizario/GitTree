import React, { useState, useEffect } from 'react';
import { BoundActions } from 'redux-zero/types';
import { connect } from 'redux-zero/react';
import { Dialog, Button, Intent, Classes, Icon, InputGroup, TextArea, Colors } from '@blueprintjs/core';
import { IconNames } from "@blueprintjs/icons";
import {
  FiGitCommit as CommitIcon,
  FiGitMerge as MergeIcon,
  FiTrash2 as TrashIcon
} from 'react-icons/fi';

import moment from 'moment';

import { Author } from "../../Models/Author";
import { IRepo, ISelectedFile, IWipCommit, ICommit, IStore } from '../../Support/Interfaces';
import { showDanger, showInfo } from '../../Support/Toaster';
import ListFiles from "./Components/ListFiles";

import Actions from '../../Store/Actions';
import Git from "../../Services/Git";

import '../../Assets/scss/commit-detail.scss';

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

type CommitDetailProps = StoreProps & BoundActions<IStore, typeof Actions>;

const CommitDetail = (props : CommitDetailProps) => {
  const { repo, sha, selectedFile, setSelectedFile, setSelectedCommit, commit, updateStatus, setLoading } = props;

  const [details, setDetails] = useState<ICommit | IWipCommit>();
  const [showDiscardDialog, setShowDiscardDialog] = useState<boolean>(false);
  const [commitSummary, setCommitSummary] = useState<string>('');
  const [commitDescription, setCommitDescription] = useState<string>('');

  const stageAll = async () => {
    if (commit.virtual && commit.unstaged.length) {
      let unstagedPaths = commit.unstaged.map(s => s.path);
      await Git.stage(repo, unstagedPaths);
      updateStatus();
    }
  }

  const unstageAll = async () => {
    if (commit.virtual && commit.staged.length) {
      let stagedPaths = commit.staged.map(s => s.path);
      await Git.unstage(repo, stagedPaths);
      updateStatus();
    }
  }

  const commitStaged = async () => {
    if (commitSummary || commitDescription) {
      setLoading(true);
      try {
        await Git.commit(repo, commitSummary, commitDescription);
        setCommitSummary('');
        setCommitDescription('');
        updateStatus();
        showInfo('Commit successful');
      } catch(err) {
        console.warn(err);
        showDanger('Error on commit: ' + err.message);
      } finally {
        setLoading(true);
      }
    }
  }

  const discardAll = async () => {
    setLoading(true);
    setShowDiscardDialog(false);
    setSelectedFile({commit: null, file: null});
    await Git.discardAll(repo);
    updateStatus();
    setLoading(false);
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
              <Button
                className="mb-1 ml-1 cursor-default"
                icon={<CommitIcon />}
                intent={Intent.NONE}
                outlined
                small
              >
                {sha.substring(0, 6)}
              </Button>
              <span className="flex flex-row text-right">
              {
                details.parents.map((parent: string, idx: number) =>
                  <Button
                    key={idx}
                    className="ml-1"
                    icon={<MergeIcon />}
                    intent={Intent.PRIMARY}
                    outlined
                    small
                    onClick={() => setSelectedCommit(parent)}
                  >
                    {parent.substring(0, 6)}
                  </Button>
                )
              }</span>
            </div>
          </div>
          <div className="commit-message card-field">{details.message}</div>
          {
            details.files && <>
              <div className="file-list-title">
                <span className="title">Changed Files</span>
              </div>
              <ListFiles
                sha={sha}
                files={details.files}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
              />
            </>
          }
        </>
      }
      {
        sha === "workdir" && <>
        {
          details.unstaged && details.staged && (details.unstaged.length > 0 || details.staged.length > 0) &&
          <Button
            className="discard-btn"
            icon={<TrashIcon />}
            intent={Intent.DANGER}
            outlined
            onClick={() => setShowDiscardDialog(true)}
          >
            Discard all changes
          </Button>
        }
        {
          details.unstaged && <>
            <div className="file-list-title">
              <span className="title">Unstaged Files</span>
              { details.unstaged.length > 0 &&
                <Button
                  className="self-end"
                  intent={Intent.SUCCESS}
                  outlined
                  onClick={() => stageAll()}
                >
                  Stage All
                </Button>
              }
            </div>
            <ListFiles
              sha={'workdir'}
              files={details.unstaged}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              repo={repo}
              updateStatus={updateStatus}
            />
          </>
        }
        {
          details.staged && <>
            <div className="file-list-title">
              <span className="title">Staged Files</span>
              { details.staged.length > 0 &&
                <Button
                  className="self-end"
                  intent={Intent.DANGER}
                  outlined
                  onClick={() => unstageAll()}
                >
                  Unstage All
                </Button>
              }
            </div>
            <ListFiles
              sha={'tree'}
              files={details.staged}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              repo={repo}
              updateStatus={updateStatus}
            />
          </>
        }
          <div className="commit-area">
            <div className="file-list-title">
              <span className="title">Commit Message</span>
            </div>
            <InputGroup
              large
              placeholder="Summary"
              value={commitSummary}
              onChange={({target}) => setCommitSummary(target.value)}
            />
            <TextArea
              fill
              growVertically
              placeholder="Description"
              value={commitDescription}
              onChange={({target}) => setCommitDescription(target.value)}
            />
            <Button
              intent={Intent.SUCCESS}
              outlined
              disabled={!commitSummary && !commitDescription}
              onClick={() => commitStaged()}
            >
              Commit
            </Button>
          </div>
        </>
      }
      <Dialog
        className="bp3-dark"
        icon={<Icon icon={IconNames.WARNING_SIGN} color={Colors.RED3} iconSize={20} />}
        onClose={() => setShowDiscardDialog(false)}
        title="Discard all changes"
        isOpen={showDiscardDialog}
        canOutsideClickClose={false}
      >
        <div className={Classes.DIALOG_BODY}>
          <p>Are you sure that want to discard all changes?</p>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button
              onClick={() => setShowDiscardDialog(false)}
            >
              Cancel
            </Button>
            <Button
              intent={Intent.DANGER}
              onClick={() => discardAll()}
            >
              Reset all
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default connect<IStore>(mapToProps, Actions)(CommitDetail);