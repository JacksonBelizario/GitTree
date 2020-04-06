import React from 'react';
import {ICommit} from '../utils/interfaces';

export interface SubwayStations {
    commits: ICommit[];
}

const SubwayStations = (props: SubwayStations) => {
    const {commits} = props;

    const getAuthor = (author: string) => {
      let firstChars = author.split(' ').map(n => n.length > 0 ? n[0].toUpperCase() : "");
      let name = "";
      firstChars.forEach(f => {
        if (f > 'A' && f < 'Z' && name.length < 2) {
          name += f;
        }
      });
      return name;
    }
    return (
        <div className="commit-info-container" style={{height: '100%', paddingTop: '3px', minWidth: 0}}>
            {commits.map((commit : ICommit, idx: number) => (
                <div className="commit-info" key={idx}>
                    <div className="background"></div>
                    <div className="commit-info-detail-container d-flex">
                        <div className="ml-1 committer text-center">{getAuthor(commit.author)}</div>
                        <div>
                        {
                            commit.virtual && <div className="files-summary ml-1">
                                {commit.fileSummary.modified && <span className="mr-1 commit-summary modification">
                                    <i className="icon-file-text"></i>{commit.fileSummary.modified}</span> }
                                {commit.fileSummary.newCount && <span className="mr-1 commit-summary addition">
                                    <i className="icon-file-plus"></i>{commit.fileSummary.newCount}</span>}
                                {commit.fileSummary.deleted && <span className="mr-1 commit-summary deletion">
                                    <i className="icon-file-minus"></i>{commit.fileSummary.deleted}</span>}
                                {commit.fileSummary.renamed && <span className="mr-1 commit-summary rename">
                                    <i className="icon-file-minus"></i>{commit.fileSummary.renamed}</span>}
                                {commit.fileSummary.ignored && <span className="mr-1 commit-summary ignored">
                                    <i className="icon-file-minus"></i>{commit.fileSummary.ignored}</span>}
                            </div>
                        }
                        </div>
                        <div className="ml-2 commit-message full-width">
                            {commit.message && <div><span className="text-muted">Message...</span>{commit.message}</div>}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default SubwayStations;