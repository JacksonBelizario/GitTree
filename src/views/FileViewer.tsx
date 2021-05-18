import React, { useEffect, useState, useMemo } from 'react';
import refractor from 'refractor';
import {Diff, Hunk, Decoration, tokenize, markWord, markEdits} from 'react-diff-view';
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
  const { repo, selectedFile, setSelectedFile } = props;
  const [hunks, setHunks] = useState([]);
  const [viewType, setViewTipe] = useState<'unified' | 'split'>('unified');
  const [fullFile, setFullFile] = useState<boolean>(false);
  
  const tokens = useMemo(() =>
    tokenize(hunks, {
      highlight: true,
      refractor: refractor,
      language: selectedFile.path && refractor.listLanguages().includes(selectedFile.path.split('.').pop()) ? selectedFile.path.split('.').pop() : 'xml',
      enhancers: [
        markEdits(hunks, { type: 'block' }),
        markWord('\r\n', 'carriage-return', '␍'),
        markWord('\t', 'tab', '→'),
      ]
    }), [hunks, selectedFile]);

  useEffect(() => {
    const getFileDetails = async () => {
      if (!repo || !selectedFile.commit || !selectedFile.path) {
        return;
      }
      try {
        const file = new FileDetails(repo);
        const hunks = await file.getFileDetail(selectedFile.path, selectedFile.commit, fullFile);
      
        setHunks(hunks);
      } catch (err) {
        console.log({err});
      }
    }

    setHunks([]);
    getFileDetails();
  }, [repo, selectedFile, fullFile]);


  if (!repo || !selectedFile.commit || !selectedFile.path || tokens.length === 0) {
    return <></>;
  }
  return (
    <div className="file-viewer absolute top-0 bottom-0 left-0 right-0 z-10 bg-white text-black">
      <div className="flex justify-center space-x-4">
        <div className="flex-1 flex justify-center">
          <ButtonGroup >
            <Button icon={<FiColumns />} active={viewType === "split" && fullFile} onClick={() => {setViewTipe("split"); setFullFile(true)}} />
            <Button icon={<FiFileText />} active={viewType === "unified" && fullFile} onClick={() => {setViewTipe("unified"); setFullFile(true)}} />
            <Button icon={<FiList />} active={viewType === "unified" && !fullFile} onClick={() => {setViewTipe("unified"); setFullFile(false)}} />
          </ButtonGroup>
        </div>
        <Button className="self-end" onClick={() => setSelectedFile({commit: null, path: null, diffType: null})} >X</Button>
      </div>
      <div className="diff-viewer overflow-auto">
        <Diff
          viewType={viewType}
          diffType={selectedFile.diffType}
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