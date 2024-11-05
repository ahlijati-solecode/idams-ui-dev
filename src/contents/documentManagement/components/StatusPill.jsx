import React from 'react';
import PropTypes from 'prop-types';
import './StatusPill.scss';

const StatusPill = ({ status, workflowType }) => (
  <div className={['status-pill', status === 'Completed' ? 'status-completed' : ''].join(' ')}>
    {`${status || '-'} | `}
    <strong>{workflowType}</strong>
  </div>
);

StatusPill.propTypes = {
  status: PropTypes.string,
  workflowType: PropTypes.string,
};

StatusPill.defaultProps = {
  status: null,
  workflowType: null,
};

export default StatusPill;
