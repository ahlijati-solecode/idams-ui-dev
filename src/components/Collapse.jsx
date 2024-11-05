import React from 'react';
import { Collapse as AntdCollapse } from 'antd';
import { EmptyState } from '@solecode/sole-ui';
import PropTypes from 'prop-types';
import './Collapse.scss';

const { Panel } = AntdCollapse;

const Position = {
  START: 'start',
  END: 'end',
};

const Collapse = ({
  data,
  onChange,
  expandIcon,
  activeKey,
  expandIconPosition,
}) => {
  const Template = (
    <div className="solecode-ui-collapse">
      <AntdCollapse
        expandIconPosition={expandIconPosition}
        activeKey={activeKey}
        onChange={onChange}
        expandIcon={expandIcon}
      >
        {
          data.length ?
            (
              data.map((item) => (
                <Panel header={item.header} key={item.key} extra={item.extra || null}>
                  {item.children ? item.children : <EmptyState type="time" />}
                </Panel>
              ))
            )
            :
            null
        }
      </AntdCollapse>
    </div>
  );

  return data.length ? Template : null;
};

Collapse.propTypes = {
  expandIcon: PropTypes.func,
  expandIconPosition: PropTypes.oneOf(Object.values(Position)),
  activeKey: PropTypes.any,
  onChange: PropTypes.func,
  data: PropTypes.array,
};

Collapse.defaultProps = {
  expandIcon: () => {},
  expandIconPosition: Position.START,
  activeKey: null,
  onChange: () => {},
  data: [],
};

export default Collapse;
