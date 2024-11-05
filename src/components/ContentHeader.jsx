import React from 'react';
import PropTypes from 'prop-types';
import './ContentHeader.scss';

const ContentHeader = ({ title }) => (
  <div className="solecode-ui-content-header">
    {title}
  </div>
);

ContentHeader.propTypes = {
  title: PropTypes.string,
};

ContentHeader.defaultProps = {
  title: '',
};

export default ContentHeader;
