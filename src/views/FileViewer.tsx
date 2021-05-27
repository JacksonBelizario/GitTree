import React, { useEffect, useState, useMemo } from 'react';
import refractor from 'refractor';
import {Diff, Hunk, Decoration, tokenize, markWord, markEdits, parseDiff} from 'react-diff-view';
import { IStore } from '../store/store';
import { ISelectedFile, IRepo } from '../utils/interfaces';
import { BoundActions } from 'redux-zero/types';
import actions from '../store/actions';
import { connect } from 'redux-zero/react';

import { FileDetails } from '../utils/file';
import { Button, ButtonGroup } from '@blueprintjs/core';

import '../assets/scss/file-viewer.scss'
import { FiColumns, FiList, FiFileText } from 'react-icons/fi';

const renderToken = (token, defaultRender, i) => {
  switch (token.type) {
    case 'space':
      return (
        <span key={i} className="space">
          {token.children && token.children.map((token, i) => renderToken(token, defaultRender, i))}
        </span>
      );
    default:
      return defaultRender(token, i);
  }
};

const renderHunk = (hunk) => [
  <Decoration key={'decoration-' + hunk.content}>
      {hunk.content}
  </Decoration>,
  <Hunk key={'hunk-' + hunk.content} hunk={hunk} />
];

interface StoreProps {
  repo: IRepo;
  selectedFile: ISelectedFile;
}

const mapToProps = (state: IStore): StoreProps => ({
  repo: state.repo,
  selectedFile: state.selectedFile
});

type FileViewerProps = StoreProps & BoundActions<IStore, typeof actions>;

const FileViewer = (props: FileViewerProps) => {
  const { repo, selectedFile: {file, commit}, setSelectedFile } = props;
  const [hunks, setHunks] = useState([]);
  const [viewType, setViewType] = useState<'unified' | 'split'>('unified');
  const [diffType, setDiffType] = useState<'rename' | 'modify' | 'add' | 'delete' | 'copy'>('modify');
  const [fullFile, setFullFile] = useState<boolean>(false);
  
  const tokens = useMemo(() =>
    tokenize(hunks, {
      highlight: true,
      refractor: refractor,
      language: file && refractor.listLanguages().includes(file.path.split('.').pop()) ? file.path.split('.').pop() : 'xml',
      enhancers: [
        markEdits(hunks, { type: 'block' }),
        // markWord('\r\n', 'carriage-return', '␍'),
        // markWord('\t', 'tab', '→'),
      ]
    }), [hunks, file]);

  useEffect(() => {
    const getFileDetails = async () => {
      if (!repo || !commit || !file) {
        return;
      }
      try {
        const fileDetails = new FileDetails(repo);

        if (file.isConflicted) {
          const res = await fileDetails.getConflictDiff(file.path);

          setViewType("split")
          setDiffType(res.diff.type);
          setHunks(res.diff.hunks);
        }
        else
        {
          setDiffType(file.isRenamed ? 'rename' : file.isModified ? 'modify' : file.isAdded ? 'add' : file.isDeleted ? 'delete' : 'copy');
          
          const hunks = await fileDetails.getFileDetail(file.path, commit, fullFile);
        
          setHunks(hunks);
        }
      } catch (err) {
        console.log({err});
      }
    }

    setHunks([]);
    getFileDetails();
  }, [repo, file, commit, fullFile]);

  useEffect(() => {
    // const element = document.getElementById(hash);
    const element = document.querySelector(".diff-gutter-insert");
    const container = document.querySelector(".file-viewer");
    if (container && element) {
      // const top = element.offsetTop - sidebar.clientHeight / 2;
      const top = element.getBoundingClientRect().top;
      container.scrollTo({ top: top > 0 ? top : 0, behavior: "smooth" });
    }
  }, [hunks]);


  if (!repo || !file || !commit || !file.path || tokens.length === 0) {
    return <></>;
  }
  return (
    <div className="file-viewer absolute top-0 bottom-0 left-0 right-0 z-10 bg-white text-black">
      <div className="flex justify-center space-x-4">
        <div className="flex-1 flex justify-center">
          {
            !file.isConflicted && 
            <ButtonGroup >
              <Button icon={<FiColumns />} active={viewType === "split" && fullFile} onClick={() => {setViewType("split"); setFullFile(true)}} />
              <Button icon={<FiFileText />} active={viewType === "unified" && fullFile} onClick={() => {setViewType("unified"); setFullFile(true)}} />
              <Button icon={<FiList />} active={viewType === "unified" && !fullFile} onClick={() => {setViewType("unified"); setFullFile(false)}} />
            </ButtonGroup>
          }
        </div>
        <Button className="self-end" onClick={() => setSelectedFile({commit: null, file: null})} >X</Button>
      </div>
      <div className="diff-viewer overflow-auto">
        <Diff
          viewType={viewType}
          diffType={diffType}
          hunks={hunks}
          tokens={tokens}
          renderToken={renderToken}
        >
          {hunks => hunks.flatMap(renderHunk)}
        </Diff>
      </div>
    </div>
  )

}

export default connect<IStore>(mapToProps, actions)(FileViewer);