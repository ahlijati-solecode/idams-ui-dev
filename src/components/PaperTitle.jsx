import React from 'react';
import PropTypes from 'prop-types';
import './PaperTitle.scss';

const PaperTitle = ({ children }) => (
  <div className="solecode-ui-paper-title">
    {children}
  </div>
);

PaperTitle.propTypes = {
  children: PropTypes.any,
};

PaperTitle.defaultProps = {
  children: <></>,
};

export default PaperTitle;
