import React, { useState, useEffect } from 'react';
import { Popover as AntdPopover } from 'antd';
import PropTypes from 'prop-types';
import './Popover.scss';

const Popover = ({
  title,
  children,
  content,
  placement,
  trigger,
  visible,
  onVisibleChange,
}) => {
  const [visibleState, setVisibleState] = useState(false);

  useEffect(() => {
    setVisibleState(visible);
  }, [visible]);

  const handleVisibleChange = (newVisible) => {
    setVisibleState(newVisible);
    onVisibleChange(newVisible);
  };

  if (title) {
    return (
      <AntdPopover
        overlayClassName="solecode-ui-popover"
        content={content}
        trigger={trigger}
        visible={visibleState}
        onVisibleChange={handleVisibleChange}
        placement={placement}
        title={title}
      >
        {children}
      </AntdPopover>
    );
  }

  return (
    <AntdPopover
      overlayClassName="solecode-ui-popover"
      content={content}
      trigger={trigger}
      visible={visibleState}
      onVisibleChange={handleVisibleChange}
      placement={placement}
    >
      {children}
    </AntdPopover>
  );
};

Popover.propTypes = {
  trigger: PropTypes.string,
  title: PropTypes.any,
  children: PropTypes.any,
  content: PropTypes.any,
  placement: PropTypes.any,
  visible: PropTypes.bool,
  onVisibleChange: PropTypes.func,
};

Popover.defaultProps = {
  trigger: 'click',
  title: null,
  children: <></>,
  content: <></>,
  placement: 'bottom',
  visible: false,
  onVisibleChange: () => {},
};

export default Popover;
