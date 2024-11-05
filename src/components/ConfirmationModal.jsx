import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import { Icon, Button } from '@solecode/sole-ui';
import RenderIf from '../contents/RenderIf';
import './ConfirmationModal.scss';

const ConfirmationModal = ({
  icon,
  open,
  setOpen,
  onOk,
  title,
  message1,
  message2,
  buttonOkLabel,
  buttonCancelLabel,
  isDanger,
  isSingleButton,
  isLoading,
  buttonOkPrimaryIcon,
  buttonOkDisabled,
}) => (
  <Modal
    className="solecode-ui-confirmation-modal"
    centered
    visible={open}
    footer={null}
  >
    <div className="modal-confirmation">
      <div
        className={[
          'modal-header',
          isDanger ? 'is-danger' : '',
        ].join(' ')}
      >
        <Icon
          name={icon?.name}
          size={icon?.size || 48}
          type={icon?.type}
        />
        <div>
          {title}
        </div>
      </div>
      <div className="modal-content">
        <div>
          {message1}
        </div>
        <div className="light-text">
          {message2}
        </div>
      </div>
      <div className="modal-footer">
        <RenderIf isTrue={!isSingleButton}>
          <Button
            label={buttonCancelLabel}
            size={Button.Size.LARGE}
            type={Button.Type.SECONDARY}
            onClick={() => { setOpen(false); }}
          />
        </RenderIf>

        <Button
          label={buttonOkLabel}
          size={Button.Size.LARGE}
          danger={isDanger}
          onClick={onOk}
          primaryIcon={isLoading ? <Icon name="spinner-third" spin size={24} /> : buttonOkPrimaryIcon}
          disabled={isLoading || buttonOkDisabled}
        />
      </div>
    </div>
  </Modal>
);

ConfirmationModal.propTypes = {
  icon: PropTypes.object,
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  onOk: PropTypes.func,
  title: PropTypes.string,
  message1: PropTypes.any,
  message2: PropTypes.any,
  buttonOkLabel: PropTypes.string,
  buttonCancelLabel: PropTypes.string,
  isDanger: PropTypes.bool,
  isSingleButton: PropTypes.bool,
  isLoading: PropTypes.bool,
  buttonOkPrimaryIcon: PropTypes.any,
  buttonOkDisabled: PropTypes.bool,
};

ConfirmationModal.defaultProps = {
  icon: {
    name: 'clipboard-list-check',
    size: 48,
    type: 'regular',
  },
  open: false,
  setOpen: () => {},
  onOk: () => {},
  title: 'Confirmation',
  message1: '',
  message2: '',
  buttonOkLabel: 'OK',
  buttonCancelLabel: 'Cancel',
  isDanger: false,
  isSingleButton: false,
  isLoading: false,
  buttonOkPrimaryIcon: null,
  buttonOkDisabled: false,
};

export default ConfirmationModal;
