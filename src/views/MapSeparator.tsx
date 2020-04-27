import React, { useEffect, useState } from 'react';
import { ICommit } from '../utils/interfaces';
import moment from 'moment';
import { Sep } from '../models/Sep';
import { Node } from '../models/Node';

import '../assets/scss/map-separator.scss';

interface MapSeparatorProps {
  commits: ICommit[];
}
const MapSeparator = (props: MapSeparatorProps) => {
  const { commits } = props;
  const [separators, setSeparators] = useState<any[]>([
    new Sep(moment().subtract(1, 'hour')),
    new Sep(moment().subtract(6, 'hour')),
    new Sep(moment().subtract(12, 'hour')),
    new Sep(moment().subtract(1, 'day')),
    new Sep(moment().subtract(2, 'day')),
    new Sep(moment().subtract(3, 'day')),
    new Sep(moment().subtract(4, 'day')),
    new Sep(moment().subtract(5, 'day')),
    new Sep(moment().subtract(6, 'day')),
    new Sep(moment().subtract(1, 'week')),
    new Sep(moment().subtract(2, 'week')),
    new Sep(moment().subtract(3, 'week')),
    new Sep(moment().subtract(1, 'month')),
    new Sep(moment().subtract(2, 'month')),
    new Sep(moment().subtract(3, 'month')),
    new Sep(moment().subtract(4, 'month')),
    new Sep(moment().subtract(5, 'month')),
    new Sep(moment().subtract(6, 'month')),
  ]);

  const processSeparators = () => {
    const seps = separators.map((sep: any) => {
      sep.visible = false;
      // update times
      sep.time.add(moment().diff(sep.baseTime, 'second'), 'second');
      sep.baseTime = moment();
      return sep;
    });
    for (let i = 1; i < commits.length; i++) {
      let cmt = commits[i];
      let cmtTime = moment(cmt.date);
      for (let j = 0; j < seps.length; j++) {
        let sep = seps[j];
        if (j < seps.length - 1 &&
          !sep.visible && cmtTime.diff(sep.time) < 0 && cmtTime.diff(seps[j + 1].time) > 0) {
          sep.commit = cmt.sha;
          sep.top = Node.height * i;
          sep.visible = true;
          break;
        } else if (j === seps.length - 1 && !sep.visible && cmtTime.diff(sep.time) < 0) {
          sep.commit = cmt.sha;
          sep.top = Node.height * i;
          sep.visible = true;
          break;
        }
      }
    }
    setSeparators(seps);
  }

  useEffect(() => {
    processSeparators();
  }, []);

  return (
    <div className="separator-container">
      {
        separators.map((sep: any, i: number) =>
          <div key={i} className={`separator ${!sep.visible ? 'hidden' : ''}`} style={{ top: sep.top }}>
            <small>{sep.display}</small>
          </div>
        )
      }
    </div>
  )
}

export default MapSeparator;