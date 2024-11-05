import React from 'react';
import PropTypes from 'prop-types';
import ConfirmationModal from './ConfirmationModal';

const DeleteModal = ({
  icon,
  open,
  setOpen,
  onDelete,
  title,
  message1,
  message2,
  buttonOkLabel,
  buttonCancelLabel,
  isLoading,
}) => (
  <ConfirmationModal
    icon={icon}
    open={open}
    setOpen={setOpen}
    onOk={onDelete}
    title={title}
    message1={message1}
    message2={message2}
    buttonOkLabel={buttonOkLabel}
    buttonCancelLabel={buttonCancelLabel}
    isDanger
    isLoading={isLoading}
  />
);

DeleteModal.propTypes = {
  icon: PropTypes.object,
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  onDelete: PropTypes.func,
  title: PropTypes.string,
  message1: PropTypes.any,
  message2: PropTypes.any,
  buttonOkLabel: PropTypes.string,
  buttonCancelLabel: PropTypes.string,
  isLoading: PropTypes.bool,
};

DeleteModal.defaultProps = {
  icon: {
    name: 'trash-can',
    size: 48,
    type: 'regular',
  },
  open: false,
  setOpen: () => {},
  onDelete: () => {},
  title: 'Delete Confirmation',
  message1: '',
  message2: '',
  buttonOkLabel: 'Delete',
  buttonCancelLabel: 'Cancel',
  isLoading: false,
};

export default DeleteModal;
