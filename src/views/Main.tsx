import React, { useEffect, useState } from 'react';
import SubwayStations from './SubwayStations';
import SubwayMapVisual from './SubwayMapVisual';

import Git from '../utils/git';
import {IRepo, ICommit} from '../utils/interfaces';

const Main = () => {
    useEffect(() => {
        const folder = '';
        loadRepo(folder)
    }, []);

    const loadRepo = async (folder: string) => {
        let repo = await Git.openRepo(folder);

        setRepo(repo);
        const commits = await Git.getCommits(repo);
        console.log({commits});
        setCommits(commits);
    }

    const [repo, setRepo] = useState<IRepo>(null);
    const [commits, setCommits] = useState<ICommit[]>([]);

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

export default Main;