import React, { useEffect } from "react";
import { connect } from "redux-zero/react";

import {
  FiCloud as CloudIcon,
  FiCheck as CheckIcon,
  FiMonitor as MonitorIcon,
  FiTag as TagIcon,
} from "react-icons/fi";

import { ICommit, IRepo, IRefDict, ICurrentCommit, IReference, IStore } from "../../../Support/Interfaces";

import { Node } from "../../../Models/Node";
import { IGraph } from "../../../Models/SubwayMap";
import { colors } from "../../../Models/Color";

import '../../../Assets/scss/subway-station-annot.scss'

interface IBranchInfo {
  top: number;
  color?: string;
  target: string;
  names: IReference[];
}

interface ISubwayStationAnnot {
  repo: IRepo;
  commits: ICommit[];
  currentBranch: ICurrentCommit;
}

interface StoreProps {
  graph: IGraph | null;
  refDict: IRefDict;
}

const mapToProps = (state: IStore): StoreProps => ({
  graph: state.graph,
  refDict: state.refs.refDict,
});

type SubwayStationAnnotProps = ISubwayStationAnnot & StoreProps;

const SubwayStationAnnot = (props: SubwayStationAnnotProps) => {
  const { commits, graph, currentBranch, refDict } = props;
  const height = Node.height;

  const [branchInfos, setBranchInfos] = React.useState<IBranchInfo[]>([]);

  useEffect(() => {
    const updateBranchInfo = () => {
      if (!commits || !refDict) {
        return;
      }
      const branchInfos: IBranchInfo[] = commits.reduce(
        (acc: IBranchInfo[], cmt: ICommit, i: number) => {
          if (refDict[cmt.sha]) {
            acc.push({
              top: height * i,
              names: Object.values(
                refDict[cmt.sha].reduce(
                  (acc: Map<string, IReference>, cur: IReference) => {
                    if (!acc[cur.display]) {
                      acc[cur.display] = cur;
                    } else {
                      acc[cur.display].isRemote = acc[cur.display].isRemote || cur.isRemote;
                      acc[cur.display].isBranch = acc[cur.display].isBranch || cur.isBranch;
                      if (cur.isBranch) {
                        acc[cur.display].shorthand = cur.shorthand;
                      }
                    }
                    return acc;
                  }, {})
              ),
              target: cmt.sha,
              color: graph.nodeDict[cmt.sha] ? colors[graph.nodeDict[cmt.sha].x_order % colors.length] : null
            });
          }
          return acc;
        }, []);
      
      setBranchInfos(branchInfos);
    };

    updateBranchInfo();
  }, [commits, graph, currentBranch, refDict, height]);

  return (
    <div className="annot-root">
      <div className="annot-container">
        {branchInfos.map((branch: IBranchInfo, key: number) => (
          <div className="annot" style={{ height, top: branch.top }} key={key}>
            <ul>
              <li style={{ backgroundColor: branch.color }} className="summary">
                {branch.names[0].shorthand === currentBranch.shorthand && (
                  <CheckIcon size={14} />
                )}
                {!!branch.names[0].isRemote && (
                  <CloudIcon size={14} />
                )}
                {!!branch.names[0].isBranch && (
                  <MonitorIcon size={14} />
                )}
                {!!branch.names[0].isTag && <TagIcon size={14} />}
                <span className="">{branch.names[0].display}</span>
                {branch.names.length > 1 && <span className="ml-2">1+</span>}
              </li>
              {branch.names.map((name: any, key: number) => (
                <li
                  className="detail"
                  style={{ backgroundColor: branch.color }}
                  key={key}
                >
                  {name.shorthand === currentBranch.shorthand && <CheckIcon size={14} />}
                  {!!name.isRemote && <CloudIcon size={14} />}
                  {!!name.isBranch && <MonitorIcon size={14} />}
                  {!!name.isTag && <TagIcon size={14} />}
                  <span>{name.display}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default connect<IStore>(mapToProps)(SubwayStationAnnot);
