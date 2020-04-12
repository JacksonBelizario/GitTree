import React, { useEffect, useState } from 'react';
import SubwayStations from './SubwayStations';
import SubwayMapVisual from './SubwayMapVisual';
import SubwayStationAnnot from './SubwayStationAnnot';
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
            const repo = await Git.openRepo(folder);
            setRepo(repo);
            setCommits(await Git.getCommits(repo));
            setCurrentBranch(await Git.getCurrentBranch(repo));
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
        let oldStatus = wipCommit.enabled;
        let wip = wipCommit;
        wip.fileSummary = changes.summary;
        if (changes.staged.length || changes.unstaged.length) {
            wip.enabled = true;
        } else {
            wip.enabled = false;
        }
        if (oldStatus !== wip.enabled) {
            wip.parents = currentBranch ? [currentBranch.target] : [];
            if (wip.enabled) {
                let newCommits = [wip, ...commits];
                setCommits(newCommits);
            } else {
                // TODO
            }
        }
        setWipCommit(wip);
    };

    if (!repo) {
        return <div>Loading</div>;
    }

    return (
        <div className="host">
            <div className="subway-outer">
                <div className="d-flex subway-container">
                    <SubwayStationAnnot repo={repo} commits={commits} currentBranch={currentBranch} />
                    <SubwayMapVisual commits={commits} />
                    <SubwayStations commits={commits} />
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