import React, { useState } from 'react';
import { Button, Card, Elevation } from "@blueprintjs/core";

import '../assets/scss/commit-detail.scss';

const CommitDetail = () => {

  const [authorIcn] = useState("JL");
  const [_author] = useState("Jackson Belizário");
  const [_email] = useState("email@example.com");
  const [timeStr] = useState("2020-04-27");
 
return (<div className="commit-detail">
      <div className="flex mb-5">
        <div className="committer-badge mr-3">
          {authorIcn}
        </div>
        <div className="committer-info-container flex flex-col">
          <span className="text-lg">{_author}</span>
          <small>{_email}</small>
          <small> {timeStr}</small>
        </div>
      </div>
    </div>
  )
}

export default CommitDetail;