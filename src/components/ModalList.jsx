import React from 'react';
import PropTypes from 'prop-types';
import { Modal, List } from 'antd';
import moment from 'moment';
import Richtext from './Richtext';
import './ModalList.scss';

const ModalList = ({
  open,
  title,
  // setOpen,
  data,
  onCancel,
}) => (
  <Modal
    className="solecode-ui-list-modal"
    centered
    visible={open}
    footer={null}
    title={title}
    onCancel={onCancel}
  >
    <div className="list-modal-content">
      <List
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <div className="title">
              <Richtext
                value={item?.notes}
                disabled
              />
            </div>
            <div className="details">
              <span className="user">{item?.empName}</span>
              <span className="date">{item?.date ? moment(item?.date).format('DD MMM YYYY HH.MM') : '-'}</span>
            </div>
          </List.Item>
        )}
      />
    </div>
  </Modal>
);

ModalList.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.string,
  data: PropTypes.array,
  onCancel: PropTypes.func,
};

ModalList.defaultProps = {
  open: false,
  title: 'Rejected Notes History',
  data: [],
  onCancel: () => {},
};

export default ModalList;
