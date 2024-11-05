/* eslint-disable no-alert */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import { Button, Icon } from '@solecode/sole-ui';
import { ConfirmationModal } from '../../../../components';
import ScopeOfWorkContent from '../../createProject/components/ScopeOfWorkContent';
import { DEFAULT_SCOPE_OF_WORK_FORM_DATA } from '../../createProject/constants/formData';
import KEY_NAME from '../../createProject/constants/keyName';
import useProjectManagementApi from '../../../../hooks/api/projectManagement';
import '../../createProject/components/ScopeOfWorkForm.scss';

const ScopeOfWorkModal = ({
  open,
  setOpen,
  onSubmit,
  projectData,
  isReadOnly,
  setProjectVersionHandler,
  setProjectVersionParams,
}) => {
  const {
    getScopeOfWork,
    updateScopeOfWork,
    getLatestVersion,
  } = useProjectManagementApi();

  const [isLoading, setIsLoading] = useState({
    form: false,
    submit: false,
    refresh: false,
  });

  const { projectId, projectVersion } = projectData;

  const [scopeOfWorkForm, setScopeOfWorkForm] = useState(DEFAULT_SCOPE_OF_WORK_FORM_DATA);

  const [refreshModal, setRefreshModal] = useState(false);

  const getScopeOfWorkAction = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, form: true }));
      const res = await getScopeOfWork(projectId, projectVersion);

      if (res.code !== 200) return;

      const form = { ...scopeOfWorkForm };

      form[KEY_NAME.WELL_DRILL_PRODUCER_COUNT] = res.data[KEY_NAME.WELL_DRILL_PRODUCER_COUNT];
      form[KEY_NAME.WELL_DRILL_INJECTOR_COUNT] = res.data[KEY_NAME.WELL_DRILL_INJECTOR_COUNT];
      form[KEY_NAME.WELL_WORK_OVER_PRODUCER_COUNT] = res.data[KEY_NAME.WELL_WORK_OVER_PRODUCER_COUNT];
      form[KEY_NAME.WELL_WORK_OVER_INJECTOR_COUNT] = res.data[KEY_NAME.WELL_WORK_OVER_INJECTOR_COUNT];
      form[KEY_NAME.PLATFORM] = res.data[KEY_NAME.PLATFORM];
      form[KEY_NAME.PIPELINE] = res.data[KEY_NAME.PIPELINE];
      form[KEY_NAME.COMPRESSOR] = res.data[KEY_NAME.COMPRESSOR];
      form[KEY_NAME.EQUIPMENT] = res.data[KEY_NAME.EQUIPMENT];

      setScopeOfWorkForm(form);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading((prev) => ({ ...prev, form: false }));
    }
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    getScopeOfWorkAction();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onChangeFormData = (e, key) => {
    const payload = { ...scopeOfWorkForm };

    payload[key] = e;
    setScopeOfWorkForm(payload);
  };

  const disableSubmit = () => (
    !scopeOfWorkForm[KEY_NAME.WELL_DRILL_PRODUCER_COUNT] ||
    !scopeOfWorkForm[KEY_NAME.WELL_DRILL_INJECTOR_COUNT] ||
    !scopeOfWorkForm[KEY_NAME.WELL_WORK_OVER_PRODUCER_COUNT] ||
    !scopeOfWorkForm[KEY_NAME.WELL_WORK_OVER_INJECTOR_COUNT] ||
    Object.values(isLoading).includes(true)
  );

  const handleSubmit = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, submit: true }));

      const payload = {
        projectId,
        projectVersion,
        section: 'UpdateScopeOfWork',
        ...scopeOfWorkForm,
      };

      const res = await updateScopeOfWork(payload);
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
      title={<b>Update Scope Of Work</b>}
      width={1000}
      footer={isReadOnly ? null : (
        <div>
          <Button
            label="Save & Update"
            size={Button.Size.LARGE}
            onClick={handleSubmit}
            primaryIcon={isLoading.submit ? <Icon name="spinner-third" spin size={24} /> : <Icon name="floppy-disk" />}
            disabled={disableSubmit()}
          />
        </div>
      )}
    >
      <div className="project-sow-form form">
        <ScopeOfWorkContent
          form={scopeOfWorkForm}
          onChangeForm={onChangeFormData}
          isViewOnly={isReadOnly}
        />
      </div>

      <ConfirmationModal
        icon={{ name: 'refresh', type: 'solid' }}
        open={refreshModal}
        setOpen={setRefreshModal}
        title="Error"
        message1="Scope of Work has been updated by another person."
        buttonOkLabel="Refresh"
        buttonOkPrimaryIcon={<Icon name="refresh" type="solid" />}
        isSingleButton
        isLoading={isLoading?.refresh}
        onOk={async () => {
          try {
            setIsLoading((prev) => ({ ...prev, refresh: true }));
            const res = await getLatestVersion(projectData?.projectId);

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

ScopeOfWorkModal.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  onSubmit: PropTypes.func,
  setProjectVersionHandler: PropTypes.func,
  projectData: PropTypes.object,
  isReadOnly: PropTypes.bool,
  setProjectVersionParams: PropTypes.func,
};

ScopeOfWorkModal.defaultProps = {
  open: false,
  setOpen: () => {},
  onSubmit: () => {},
  projectData: {},
  isReadOnly: false,
  setProjectVersionHandler: () => {},
  setProjectVersionParams: () => {},
};

export default ScopeOfWorkModal;
