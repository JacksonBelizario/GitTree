import React, { useEffect, useState } from 'react';
import SubwayStations from './SubwayStations';
import SubwayMapVisual from './SubwayMapVisual';
import { connect } from 'redux-zero/react';
import { IStore } from '../store/store';
import { useInterval } from '../utils/hooks';

import Git from '../utils/git';
import {IRepo, ICommit} from '../utils/interfaces';

const INITIAL_WIP = {
    sha: "00000",
    author: "",
    email: "",
    parents: [],
    message: "",
    date: new Date(),
    ci: "",
    virtual: true,
    isStash: false,
    enabled: false,
    fileSummary: {}
};

interface StoreProps {
    folder: string;
}

const mapToProps = (state : IStore) : StoreProps => ({ folder: state.folder });

const INTERVAL = 5 * 1000;

const Main = (props : StoreProps) => {
    const { folder } = props;

    const [repo, setRepo] = useState<IRepo>(null);
    const [currentBranch, setCurrentBranch] = useState<object | any>({});
    const [commits, setCommits] = useState<ICommit[]>([]);
    const [wipCommit, setWipCommit] = useState<ICommit>(INITIAL_WIP);

    useEffect(() => {
        loadRepo(folder);
    }, [folder]);

    useInterval(() => {
        watchChanges();
    }, INTERVAL);


    const loadRepo = async (folder: string) => {
        try {
            let repo = await Git.openRepo(folder);

            setRepo(repo);
            const commits = await Git.getCommits(repo);
            console.log({commits});
            setCommits(commits);
            const currentBranch = await Git.getCurrentBranch(repo);
            setCurrentBranch(currentBranch);
            setWipCommit(INITIAL_WIP);
        } catch (error) {
            console.warn({error});
        }
    }

    const watchChanges = async () => {
        if (!repo || commits.length === 0) {
            return;
        }
        let changes = await Git.watchStatus(repo);
        console.log({changes});
        let oldStatus = wipCommit.enabled;
        console.log({oldStatus});
        let wip = wipCommit;
        wip.fileSummary = changes.summary;
        if (changes.staged.length || changes.unstaged.length) {
            wip.enabled = true;
        } else {
            wip.enabled = false;
        }
        if (oldStatus !== wip.enabled) {
            wip.parents = currentBranch ? [currentBranch.target] : [];
            console.log('oldStatus !== wip.enabled');
            if (wip.enabled) {
                let newCommits = [wip, ...commits];
                setCommits(newCommits);
                console.log({newCommits});
            } else {
                //return this.commits;
            }
        }
        setWipCommit(wip);
    };

    console.log({repo});

    return (
        <div className="host">
            <div className="subway-outer">
                <div className="d-flex subway-container">
                    <div style={{ height: '100%', paddingTop: '4px', width: '180px'}}></div>
                    <SubwayMapVisual commits={commits} />
                    <div style={{width: '600px'}}><SubwayStations commits={commits} /></div>
                </div>
                <div className="app-map-separator"></div>
                <div className="eoh-container text-center mt-1">
                    <p><span className="mr-1 icon-info"></span>End of History</p>
                </div>
            </div>
        </div>
    );
}

export default connect<IStore>(mapToProps)(Main);