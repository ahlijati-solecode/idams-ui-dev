import React from 'react';
import { List as AntdList } from 'antd';
import PropTypes from 'prop-types';
import './List.scss';

const Size = {
  DEFAULT: 'default',
  SMALL: 'small',
  LARGE: 'large',
};

const List = ({
  header,
  footer,
  bordered,
  data,
  renderItem,
  size,
}) => (
  <div className="solecode-ui-list">
    <AntdList
      size={size}
      header={header}
      footer={footer}
      bordered={bordered}
      dataSource={data}
      renderItem={renderItem}
    />
  </div>
);

List.propTypes = {
  size: PropTypes.oneOf(Object.values(Size)),
  header: PropTypes.any,
  footer: PropTypes.any,
  bordered: PropTypes.bool,
  data: PropTypes.array,
  renderItem: PropTypes.func,
};

List.defaultProps = {
  size: Size.DEFAULT,
  header: null,
  footer: null,
  bordered: true,
  data: [],
  renderItem: (item) => (
    <AntdList.Item>
      {item}
    </AntdList.Item>
  ),
};

export default List;
