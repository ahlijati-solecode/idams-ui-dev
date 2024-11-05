/* eslint-disable no-alert */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import moment from 'moment';
import { Button, Icon } from '@solecode/sole-ui';
import { ConfirmationModal } from '../../../../components';
import SetMilestonesContent from '../../createProject/SetMilestonesContent';
import useProjectManagementApi from '../../../../hooks/api/projectManagement';

const SetMilestonesModal = ({
  open,
  setOpen,
  projectId,
  projectVersion,
  projectData,
  onSubmit,
  isReadOnly,
  setProjectVersionHandler,
  setProjectVersionParams,
}) => {
  const {
    updateMilestone,
    getLatestVersion,
  } = useProjectManagementApi();

  const [keyCounter, setKeyCounter] = useState(1);
  const [milestoneFilled, setMilestoneFilled] = useState({});
  const [isLoading, setIsLoading] = useState({
    form: false,
    submit: false,
    refresh: false,
  });
  const [refreshModal, setRefreshModal] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setKeyCounter(keyCounter + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onNotifyUpdate = (e) => {
    setMilestoneFilled(e);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, submit: true }));

      const res = await updateMilestone({
        projectId,
        projectVersion,
        section: 'UpdateMilestone',
        milestone: Object.keys(milestoneFilled).map((e) => milestoneFilled[e]),
      });

      if (res.data?.code !== 200) {
        if (res.response.data.message.includes('inactive template')) {
          setRefreshModal(true);
          return;
        }

        console.log(res.response);
        window.alert('Something went wrong.');
        return;
      }

      setProjectVersionHandler(res.data.data);
      onSubmit(res.data.data);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  return (
    <Modal
      visible={open}
      onOk={() => { setOpen(false); }}
      onCancel={() => { setOpen(false); }}
      title={<b>Update Milestone</b>}
      width={1000}
      footer={isReadOnly ? null : (
        <div>
          <Button
            label="Save & Update"
            size={Button.Size.LARGE}
            onClick={handleSubmit}
            primaryIcon={isLoading.submit ? <Icon name="spinner-third" spin size={24} /> : <Icon name="floppy-disk" />}
            disabled={isLoading.submit}
          />
        </div>
      )}
    >
      <SetMilestonesContent
        key={keyCounter}
        projectId={projectId}
        projectVersion={projectVersion}
        isViewOnly={isReadOnly}
        onNotifyUpdate={onNotifyUpdate}
        surpressUpdate
        startDateLimit={projectData.proposalDate ? moment(projectData.proposalDate).toDate() : null}
        endDateLimit={projectData.estFidapproved ? moment(projectData.estFidapproved).toDate() : null}
      />

      <ConfirmationModal
        icon={{ name: 'refresh', type: 'solid' }}
        open={refreshModal}
        setOpen={setRefreshModal}
        title="Error"
        message1="SetMilestone has been updated by another person."
        buttonOkLabel="Refresh"
        buttonOkPrimaryIcon={<Icon name="refresh" type="solid" />}
        isSingleButton
        isLoading={isLoading?.refresh}
        onOk={async () => {
          try {
            setIsLoading((prev) => ({ ...prev, refresh: true }));
            const res = await getLatestVersion(projectId);

            if (res.data?.code !== 200) {
              window.alert('Something went wrong.');
              console.log(res.response);
              return;
            }

            setProjectVersionParams(res.data.data);
            setRefreshModal(false);
            window.location.reload();
          } catch (e) {
            console.log(e);
          } finally {
            setIsLoading((prev) => ({ ...prev, refresh: false }));
          }
        }}
      />
    </Modal>
  );
};

SetMilestonesModal.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  setProjectVersionHandler: PropTypes.func,
  projectId: PropTypes.string,
  projectVersion: PropTypes.any,
  projectData: PropTypes.object,
  onSubmit: PropTypes.func,
  isReadOnly: PropTypes.bool,
  setProjectVersionParams: PropTypes.func,
};

SetMilestonesModal.defaultProps = {
  open: false,
  setOpen: () => {},
  projectId: '',
  projectVersion: 1,
  projectData: {},
  onSubmit: () => {},
  isReadOnly: false,
  setProjectVersionHandler: () => {},
  setProjectVersionParams: () => {},
};

export default SetMilestonesModal;
