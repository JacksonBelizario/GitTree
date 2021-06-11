import React, { FormEvent, useState } from 'react';
import { Button } from '@blueprintjs/core';
import { FiX as CloseIcon, FiPlus as AddIcon } from 'react-icons/fi'

import '../Assets/scss/repo-tabs.scss';

const RepoTabs = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [dragIndex, setDragIndex] = useState<number>(-1);
  const [tabs , setTabs] = useState<any[]>([
    { title: 'New Tab 1', content: 'foo' },
    { title: 'New Tab 2', content: 'bar' },
    { title: 'New Tab 3', content: 'baz' },
  ]);

  const handleTabPositionChange = (a: number, b: number) => {
    const localTabs = [...tabs];
    const [moved] = localTabs.splice(a, 1);
    localTabs.splice(b, 0, moved);
    setTabs(localTabs);

		if (activeTab === a) {
			setActiveTab(b);
		} else if(activeTab > b && activeTab < a) {
			setActiveTab(activeTab + 1);
		} else if(activeTab < b && activeTab > a) {
			setActiveTab(activeTab - 1);
		}
    setDragIndex(-1)
	}

  
	const handleTabClose = (index: number) => {
    setTabs(tabs => tabs.filter((_, i) => i !== index));
		if (activeTab >= tabs.length - 1) {
			setActiveTab(tabs.length - 2);
		}
	}

	const handleTabAdd = () => {
    setTabs([...tabs, { title: `New Tab ${tabs.length + 1}`, content: 'Hey Buddy!' }])

    setActiveTab(tabs.length);
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
          tabs.map((value, index) => {
            return (
              <div
                key={ index }
                className={`repo-tab ${index === activeTab ? 'active' : ''}`}
                onClick={() => setActiveTab(index)}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDrop={e => handleDrop(e, index)}
                onDragOver={e => handleDragOver(e)}
                onDragEnter={e => handleDragEnter(e)}
                onDragLeave={e => handleDragLeave(e)}
              >
                <div className="repo-tab-inner">
                  <span>{ value.title }</span>
                  <Button
                    small
                    minimal
                    icon={<CloseIcon />}
                    onClick={e => { e.stopPropagation(); handleTabClose(index); }}
                  />
                </div>
              </div>
            );
          })
        }
        <div
          className="btn-add-tab"
          onClick={() => handleTabAdd()}
        >
          <AddIcon />
        </div>
      </div>
    </>
  )
}


export default RepoTabs;