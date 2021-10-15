import React, { Fragment } from 'react';

function Links(props) {
  return (
    <div className="links">
      <span>לינקים: </span>
      {props.links.map((link, i) => (
        <Fragment key={link[1]}>
          <span>
            <a target="_blank" rel="noopener noreferrer" href={link[1]}>{link[0]}</a>
          </span>
          {i+1 < props.links.length && (
            <span>&nbsp;| </span>
          )}
        </Fragment>
      ))}
    </div>
  );
}

export default Links;
