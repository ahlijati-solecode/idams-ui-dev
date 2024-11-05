import React from 'react';
import PropTypes from 'prop-types';
import './Paper.scss';

const Paper = ({ children }) => (
  <div className="solecode-ui-paper">
    {children}
  </div>
);

Paper.propTypes = {
  children: PropTypes.any,
};

Paper.defaultProps = {
  children: <></>,
};

export default Paper;
