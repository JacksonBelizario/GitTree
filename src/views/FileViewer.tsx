import React, { useEffect, useState, useMemo } from 'react';
import refractor from 'refractor';
import {Diff, Hunk, tokenize, markWord, markEdits} from 'react-diff-view';
import { IStore } from '../store/store';
import { ISelectedFile, IRepo } from '../utils/interfaces';
import { BoundActions } from 'redux-zero/types';
import actions from '../store/actions';
import { connect } from 'redux-zero/react';

import { FileDetails } from '../utils/file';
import { Button, ButtonGroup } from '@blueprintjs/core';

import '../assets/scss/file-viewer.scss'
import { FiColumns, FiList } from 'react-icons/fi';

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
  const [viewType, setViewTipe] = useState<'unified' | 'split'>('split');
  
  const tokens = useMemo(() =>
    tokenize(hunks, {
      highlight: true,
      refractor: refractor,
      language: selectedFile.path && refractor.listLanguages().includes(selectedFile.path.split('.').pop()) ? selectedFile.path.split('.').pop() : 'xml',
      enhancers: [
          markWord('\r', 'carriage-return'),
          markWord('\t', 'tab'),
          markEdits(hunks)
      ]
    }), [hunks, selectedFile]);

  useEffect(() => {
    getFileDetails();
  }, [repo, selectedFile]);

  const getFileDetails = async () => {
    console.log({repo, selectedFile});
    if (!repo || !selectedFile.commit || !selectedFile.path) {
      return;
    }
    try {
      const file = new FileDetails(repo);
      const hunks = await file.getFileDetail(selectedFile.path, selectedFile.commit, true);
    
      setHunks(hunks);
    } catch (err) {
      console.log({err});
    }
  }


  if (!repo || !selectedFile.commit || !selectedFile.path) {
    return <></>;
  }
  return (
    <div className="file-viewer absolute top-0 bottom-0 left-0 right-0 z-10 bg-white text-black">
      <div className="flex justify-center space-x-4">
        <div className="flex-1 flex justify-center">
          <ButtonGroup >
            <Button icon={<FiColumns />} active={viewType === "split"} onClick={() => setViewTipe("split")} />
            <Button icon={<FiList />} active={viewType === "unified"} onClick={() => setViewTipe("unified")} />
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
          {hunks => hunks.map(hunk => <Hunk key={hunk.content} hunk={hunk} />)}
        </Diff>
      </div>
    </div>
  )

}

export default connect<IStore>(mapToProps, actions)(FileViewer);