import React from 'react';
import { Tabs as AntdTabs } from 'antd';
import PropTypes from 'prop-types';
import './Tabs.scss';

const { TabPane } = AntdTabs;

const Tabs = ({
  data,
  defaultActiveKey,
  onChange,
}) => (
  <div className="solecode-ui-tabs">
    <AntdTabs
      defaultActiveKey={defaultActiveKey}
      onChange={onChange}
    >
      {
        data.map((item, idx) => (
          <TabPane
            tab={item?.title}
            key={item?.key || `tab-${idx}`}
            disabled={Boolean(item?.disabled) || false}
          >
            {item.content}
          </TabPane>
        ))
      }
    </AntdTabs>
  </div>
);

Tabs.propTypes = {
  defaultActiveKey: PropTypes.string,
  data: PropTypes.array,
  onChange: PropTypes.func,
};

Tabs.defaultProps = {
  data: [],
  defaultActiveKey: null,
  onChange: () => {},
};

export default Tabs;
