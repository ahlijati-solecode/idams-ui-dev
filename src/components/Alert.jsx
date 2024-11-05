import React from 'react';
import { Icon as IconSole, Alert as SoleAlert } from '@solecode/sole-ui';
import PropTypes from 'prop-types';
import RenderIf from '../contents/RenderIf';
import './Alert.scss';

const Type = {
  ERROR: 'error',
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
};

const Icon = {
  error: 'circle-xmark',
  info: 'circle-info',
  success: 'circle-check',
  warning: 'circle-exclamation',
};

const Alert = ({
  message,
  description,
  descriptionRight,
  type,
  icon,
  closeable,
  showIcon,
  onClose,
}) => {
  const header = (
    <>
      <RenderIf isTrue={showIcon}>
        <div className="inner-wrapper">
          <IconSole name={icon?.name || Icon[type]} type={icon?.type || 'solid'} size={icon?.size || 16} />
          <span>{message}</span>
        </div>
      </RenderIf>
      <RenderIf>
        <span>{message}</span>
      </RenderIf>
      <RenderIf isTrue={descriptionRight}>
        <div className="description-right">{descriptionRight}</div>
      </RenderIf>
    </>
  );

  const body = (
    <div className="description-wrapper">
      <div className={showIcon ? 'inner-wrapper-with-icon' : 'inner-wrapper'}>
        <span>{description}</span>
      </div>
    </div>
  );

  return (
    <div className="solecode-ui-alert">
      <SoleAlert
        message={header}
        description={description ? body : null}
        type={type}
        closeable={closeable}
        onClose={closeable ? onClose : null}
      />
    </div>
  );
};

Alert.propTypes = {
  icon: PropTypes.any,
  message: PropTypes.string.isRequired,
  description: PropTypes.any,
  descriptionRight: PropTypes.any,
  showIcon: PropTypes.bool,
  type: PropTypes.oneOf(Object.values(Type)),
  closeable: PropTypes.bool,
  onClose: PropTypes.func,
};

Alert.defaultProps = {
  icon: null,
  description: '',
  descriptionRight: null,
  showIcon: false,
  type: Type.SUCCESS,
  closeable: false,
  onClose: () => {},
};

export default Alert;
