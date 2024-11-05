import React from 'react';
import { Button } from '@solecode/sole-ui';
import PropTypes from 'prop-types';
import './BasicButton.scss';

const BasicButton = ({
  label,
  size,
  type,
  shape,
  danger,
  disabled,
  primaryIcon,
  secondaryIcon,
  onClick,
}) => (
  <div className="solecode-ui-basic-button">
    <Button
      label={label}
      size={size}
      type={type}
      shape={shape}
      danger={danger}
      disabled={disabled}
      onClick={onClick}
      primaryIcon={primaryIcon}
      secondaryIcon={secondaryIcon}
    />
  </div>
);

BasicButton.propTypes = {
  label: PropTypes.string,
  size: PropTypes.string,
  type: PropTypes.string,
  shape: PropTypes.string,
  danger: PropTypes.bool,
  disabled: PropTypes.bool,
  primaryIcon: PropTypes.any,
  secondaryIcon: PropTypes.any,
  onClick: PropTypes.func,
};

BasicButton.defaultProps = {
  label: null,
  size: 'medium',
  type: 'primary',
  shape: 'default',
  danger: false,
  disabled: false,
  primaryIcon: null,
  secondaryIcon: null,
  onClick: () => {},
};

export default BasicButton;
