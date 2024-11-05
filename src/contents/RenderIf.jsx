/* eslint arrow-body-style: ["error", "always"] */
/* eslint-env es6 */

import PropTypes from 'prop-types';

const RenderIf = ({ children, isTrue }) => {
  return isTrue ? children : null;
};

RenderIf.propTypes = {
  children: PropTypes.any,
  isTrue: PropTypes.bool,
};

RenderIf.defaultProps = {
  children: '',
  isTrue: null,
};

export default RenderIf;
