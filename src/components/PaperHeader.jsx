import React from 'react';
import PropTypes from 'prop-types';
import './PaperHeader.scss';

const PaperHeader = ({ children }) => (
  <div className="solecode-ui-paper-header">
    {children}
  </div>
);

PaperHeader.propTypes = {
  children: PropTypes.any,
};

PaperHeader.defaultProps = {
  children: <></>,
};

export default PaperHeader;
