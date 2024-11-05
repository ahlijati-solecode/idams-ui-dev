import React, { useState, useEffect } from 'react';
import { ProgressBar as ProgressSole } from '@solecode/sole-ui';
import PropTypes from 'prop-types';
import './ProgressBar.scss';

const ProgressBar = ({
  type,
  value,
  showInfo,
  title,
}) => {
  const [val, setVal] = useState(value);

  useEffect(() => {
    setVal(value);
  }, [value]);

  const StatusBar = {
    PROGRESS: 'success',
    COMPLETE: 'normal',
  };

  return (
    <div className="custom-progress-bar">
      <div className="title-wrapper">
        <span className="title">{title}</span>
        <span className="info">{`${val}%`}</span>
      </div>
      <ProgressSole
        type={type}
        // percent={value}
        value={value}
        status={+val === 100 ? StatusBar.COMPLETE : StatusBar.PROGRESS}
        showInfo={showInfo}
      />
    </div>
  );
};

ProgressBar.propTypes = {
  type: PropTypes.string,
  value: PropTypes.number,
  showInfo: PropTypes.bool,
  title: PropTypes.string,
};

ProgressBar.defaultProps = {
  type: 'line',
  value: 0,
  showInfo: true,
  title: null,
};

export default ProgressBar;
