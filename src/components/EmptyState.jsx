import React from 'react';
import PropTypes from 'prop-types';
import EmptyStateImg from '../assets/empty-state.png';
import './EmptyState.scss';

const EmptyState = ({ text }) => (
  <div className="solecode-ui-empty-state">
    <img alt="empty-state" src={EmptyStateImg} />
    <span className="text">
      {text}
    </span>
  </div>
);

EmptyState.propTypes = {
  text: PropTypes.any,
};

EmptyState.defaultProps = {
  text: '',
};

export default EmptyState;
