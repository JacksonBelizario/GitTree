import React from "react";
import { Link } from "../models/Link";

interface ILinkVisual {
  link: Link;
}

const LinkVisual = (props: ILinkVisual) => {
  const { link } = props;
  const [linkDirection, setLinkDirection] = React.useState<number>(-1);
  const [mergeDirection, setMergeDirection] = React.useState<number>(1);
  React.useEffect(() => {
    if (!link.merge) {
      setMergeDirection(-1);
    }
    if (link.target.y > link.source.y && link.target.x > link.source.x) {
      setLinkDirection(1);
    }
    return () => {
      setMergeDirection(1);
      setLinkDirection(-1);
    };
  }, [link]);

  if (!link.source.commit || !link.color) {
    return <></>;
  }
  return (
    <g>
    {
      link.source && !link.merge &&
      <g>{`<!--link.source && !link.merge | ${linkDirection < 0 ? '╝' : ''} ${linkDirection > 0 ? '╚' : ''} -->`}
        <line strokeDasharray={link.source.commit.virtual || link.source.commit.isStash? '2' : 'none'} className="line" x1={link.source.x} y1={link.source.y + 10} x2={link.source.x} y2={(link.target.y || 0) - 5}
          style={{ stroke: link.color.stringValue }}></line>
        { (link.target.x !== link.source.x) &&
          <line strokeDasharray={link.source.commit.virtual || link.source.commit.isStash? '2' : 'none'} className="line" x1={link.source.x + (linkDirection < 0 ? - 15 : 15)} y1={link.target.y} x2={link.target.x} y2={link.target.y}
            style={{ stroke: link.color.stringValue }}></line>
        }
        { (link.target.x !== link.source.x) &&
          <path
            strokeDasharray={link.source.commit.virtual || link.source.commit.isStash? '2' : 'none'} className="line"
            style={{ stroke: link.color.stringValue }} d={'M' + link.source.x + ',' + ((link.target.y || 0) - 10) + ' C' + link.source.x + ',' + link.target.y + ' ' + (link.source.x) + ',' + (link.target.y) + ' ' + ((link.source.x || 0) + (linkDirection < 0 ? - 15 : 15))  + ',' + link.target.y} />
        }
      </g>
    }
    {
      link.target && link.merge &&
      <g>{'<!--link.target && link.merge ╔ -->'}
        { link.target.x !== link.source.x &&
          <line strokeDasharray={link.source.commit.virtual || link.source.commit.isStash? '2' : 'none'} className="line" x1={link.source.x} y1={link.source.y} x2={(link.target.x || 0) - (10 * linkDirection)} y2={link.source.y}
            style={{ stroke: link.color.stringValue }}></line>
        }
        <line strokeDasharray={link.source.commit.virtual || link.source.commit.isStash? '2' : 'none'} className="line" x1={link.target.x} y1={(link.source.y || 0 ) + 5} x2={link.target.x} y2={link.target.y - 5}
          style={{ stroke: link.color.stringValue }}></line>
        { link.target.x !== link.source.x &&
          <path strokeDasharray={link.source.commit.virtual || link.source.commit.isStash? '2' : 'none'} className="line" style={{ stroke: link.color.stringValue }} d={'M' + ((link.target.x || 0) - (15 * linkDirection)) + ',' + (link.source.y) + ' C' + link.target.x + ',' + link.source.y + ' ' + ((link.target.x || 0) + 1) + ',' + ((link.source.y || 0) + 1) + ' ' + (link.target.x)  + ',' + ((link.source.y || 0) + 15)} />
        }
      </g>
    }
    </g>
  )
}

export default LinkVisual;