import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import { Button, Icon } from '@solecode/sole-ui';
import UploadDocumentContent from '../../createProject/UploadDocumentContent';
import useProjectManagementApi from '../../../../hooks/api/projectManagement';

const UploadDocumentModal = ({
  open,
  setOpen,
  projectId,
  projectVersion,
  onSubmit,
  isReadOnly,
}) => {
  const {
    updateInitiationDocs,
  } = useProjectManagementApi();
  const uploadRes = useRef({});

  const onAfterUpload = async () => {
    const payload = {};
    payload.projectId = projectId;
    payload.projectVersion = projectVersion;
    payload.section = 'UpdateInitiationDocument';

    const { data } = await updateInitiationDocs(payload);
    uploadRes.current = data;
  };

  return (
    <Modal
      visible={open}
      onOk={() => { setOpen(false); }}
      onCancel={() => { setOpen(false); }}
      title={<b>Update Initiation Document</b>}
      width={1000}
      footer={isReadOnly ? null : (
        <div>
          <Button
            label="Save & Update"
            size={Button.Size.LARGE}
            onClick={() => onSubmit(uploadRes.current)}
            primaryIcon={<Icon name="floppy-disk" />}
          />
        </div>
      )}
    >
      <UploadDocumentContent
        projectId={projectId}
        projectVersion={projectVersion}
        disableDelete
        isViewOnly={isReadOnly}
        onAfterUpload={onAfterUpload}
      />
    </Modal>
  );
};

UploadDocumentModal.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  projectId: PropTypes.string,
  projectVersion: PropTypes.any,
  onSubmit: PropTypes.func,
  isReadOnly: PropTypes.bool,
};

UploadDocumentModal.defaultProps = {
  open: false,
  setOpen: () => {},
  projectId: '',
  projectVersion: 1,
  onSubmit: () => {},
  isReadOnly: false,
};

export default UploadDocumentModal;
