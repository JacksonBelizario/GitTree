import React, { useEffect } from "react";
import { Node } from "../models/Node";
import { ICommit, IRepo, IRefDict, ICurrentCommit } from "../utils/interfaces";
import { IGraph } from "../models/SubwayMap";
import { colors } from "../models/Color";

import { connect } from "redux-zero/react";
import { IStore } from "../store/store";

import {
  Cloud as CloudIcon,
  Check as CheckIcon,
  Monitor as MonitorIcon,
  Tag as TagIcon,
} from "react-feather";

import '../assets/scss/subway-station-annot.scss'

interface IBranchInfo {
  top: number;
  color: string;
  target: string;
  names: [
    {
      isRemote: boolean;
      isBranch: boolean;
      isTag: boolean;
      current: boolean;
      display: string;
      remoteName: string;
      localName: string;
    }
  ];
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
    updateBranchInfo();
  }, []);

  const updateBranchInfo = () => {
    if (!commits || !refDict) {
      return;
    }
    const branchInfos: IBranchInfo[] = [];
    commits.forEach((cmt: ICommit, i: number) => {
      //@ts-ignore
      if (refDict[cmt.sha]) {
        let bi = {
          top: height * i,
          names: [],
          target: cmt.sha,
        };
        //@ts-ignore
        refDict[cmt.sha].forEach((ref: any) => {
          //@ts-ignore
          bi.names.push(ref);
        });
        //@ts-ignore
        branchInfos.push(bi);
      }
    });
    branchInfos.forEach((bi) => {
      let consolidated = new Map<string, IBranchInfo>();
      bi.names.forEach((na) => {
        //@ts-ignore
        if (!consolidated[na.display]) {
          //@ts-ignore
          consolidated[na.display] = na;
          na.current = false;
        } else {
          //@ts-ignore
          consolidated[na.display].isRemote =
            consolidated[na.display].isRemote || na.isRemote;
          //@ts-ignore
          consolidated[na.display].isBranch =
            consolidated[na.display].isBranch || na.isBranch;
          if (na.isBranch) {
            //@ts-ignore
            consolidated[na.display].shorthand = na.shorthand;
          }
        }
      });
      Object.values(consolidated).forEach((con) => {
        if (con.isBranch && con.display.includes(currentBranch.name)) {
          con.current = true;
        }
      });
      //@ts-ignore
      bi.names = Object.values(consolidated);
      if (graph && graph.nodeDict[bi.target]) {
        bi.color = colors[graph.nodeDict[bi.target].x_order % colors.length];
      }
    });
    setBranchInfos(branchInfos);
  };

  return (
    <div className="annot-root">
      <div className="annot-container">
        {branchInfos.map((branch: IBranchInfo, key: number) => (
          <div className="annot" style={{ height, top: branch.top }} key={key}>
            <ul className="ml-1 text-right">
              <li style={{ backgroundColor: branch.color }} className="summary">
                {!!branch.names[0].current && (
                  <CheckIcon size={12} />
                )}
                {!!branch.names[0].isRemote && (
                  <CloudIcon size={12} />
                )}
                {!!branch.names[0].isBranch && (
                  <MonitorIcon size={12} />
                )}
                {!!branch.names[0].isTag && <TagIcon size={12} />}
                <span className="">{branch.names[0].display}</span>
                {branch.names.length > 1 && <span className="ml-2">1+</span>}
              </li>
              {branch.names.map((name: any, key: number) => (
                <li
                  className="detail mb-1"
                  style={{ backgroundColor: branch.color }}
                  key={key}
                >
                  {!!name.current && <CheckIcon size={12} />}
                  {!!name.isRemote && <CloudIcon size={12} />}
                  {!!name.isBranch && <MonitorIcon size={12} />}
                  {!!name.isTag && <TagIcon size={12} />}
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
