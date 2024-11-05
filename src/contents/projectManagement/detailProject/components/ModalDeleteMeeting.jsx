import { Modal } from 'antd';
import { Button, Icon } from '@solecode/sole-ui';
import PropTypes from 'prop-types';
import './Meeting.scss';

const ModalMeeting = ({
  deleteIsVisible,
  closeDeleteModal,
  removeMeeting,
}) => (
  <Modal
    className="rounded-modal"
    centered
    visible={deleteIsVisible}
    footer={null}
  >
    <div className="modal-delete">
      <div className="modal-header">
        <Icon name="trash-can" type="regular" size="48" />
        <div style={{ margin: '8px 0px' }}>Delete Confirmation</div>
      </div>
      <div className="modal-content">
        <div style={{ marginBottom: '8px' }}>
          Are you sure you want to delete this meeting?
        </div>
        <div className="light-text">This action can’t be undone.</div>
      </div>
      <div style={{ marginTop: '24px' }} className="modal-footer">
        <Button onClick={() => closeDeleteModal()} label="Cancel" size="middle" type="secondary" />
        <Button onClick={() => removeMeeting()} label="Delete" size="middle" type="danger" />
      </div>
    </div>
  </Modal>
);

ModalMeeting.propTypes = {
  deleteIsVisible: PropTypes.bool.isRequired,
  closeDeleteModal: PropTypes.func.isRequired,
  removeMeeting: PropTypes.func.isRequired,
};

export default ModalMeeting;
