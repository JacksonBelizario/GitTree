import React, { FormEvent, useState } from 'react';
import { Button } from '@blueprintjs/core';
import { FiX as CloseIcon, FiPlus as AddIcon } from 'react-icons/fi'

import '../Assets/scss/repo-tabs.scss';

const RepoTabs = (props) => {
  const {activeTab, children, onTabPositionChange, onTabSwitch, onTabAdd, onTabClose} = props;
  const [dragIndex, setDragIndex] = useState<number>(-1);

  const handleTabPositionChange = (a: number, b: number) => {
    onTabPositionChange(a, b);
    setDragIndex(-1)
	}

  const handleDragOver = (e: FormEvent<HTMLDivElement>)  => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: FormEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    handleTabPositionChange(dragIndex, index);
    (e.target as HTMLElement).classList.remove('drag-over');
  };

  const handleDragEnter = (e: FormEvent<HTMLDivElement>)  => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).classList.add('drag-over');
  };
  const handleDragLeave = (e: FormEvent<HTMLDivElement>)  => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).classList.remove('drag-over');
  };

  return (
    <>
      <div className={`repo-tabgroup ${dragIndex !== -1 ? 'dragging' : ''}`}>
        {
          children.map((tab, index) => {
            return (
              <div
                key={ index }
                className={`repo-tab ${index === activeTab ? 'active' : ''}`}
                onClick={() => onTabSwitch(index)}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDrop={e => handleDrop(e, index)}
                onDragOver={e => handleDragOver(e)}
                onDragEnter={e => handleDragEnter(e)}
                onDragLeave={e => handleDragLeave(e)}
              >
                <div className="repo-tab-inner">
                  <span>{ tab.props.title }</span>
                  <Button
                    small
                    minimal
                    icon={<CloseIcon />}
                    onClick={e => { e.stopPropagation(); onTabClose(index); }}
                  />
                </div>
              </div>
            );
          })
        }
        <div
          className="btn-add-tab"
          onClick={() => onTabAdd()}
        >
          <AddIcon />
        </div>
      </div>
    </>
  )
}

export const Tab = ({ children }: any) => {
	return (
		<div>{ children }</div>
	);
}


export default RepoTabs;