/* eslint-disable no-alert */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import { Button, Icon } from '@solecode/sole-ui';
import { ConfirmationModal } from '../../../../components';
import ResourcesContent from '../../createProject/components/ResourcesContent';
import { DEFAULT_RESOURCES_FORM_DATA } from '../../createProject/constants/formData';
import KEY_NAME from '../../createProject/constants/keyName';
import useProjectManagementApi from '../../../../hooks/api/projectManagement';
import '../../createProject/components/ResourcesForm.scss';

const ResourcesModal = ({
  open,
  setOpen,
  onSubmit,
  projectData,
  isReadOnly,
  setProjectVersionHandler,
  setProjectVersionParams,
}) => {
  const {
    updateResources,
    getLatestVersion,
  } = useProjectManagementApi();

  const { projectId, projectVersion } = projectData;

  const [resourcesForm, setResourcesForm] = useState(DEFAULT_RESOURCES_FORM_DATA);

  const [refreshModal, setRefreshModal] = useState(false);

  const [isLoading, setIsLoading] = useState({
    form: false,
    submit: false,
    refresh: false,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const form = { ...resourcesForm };
    form[KEY_NAME.OIL] = projectData?.oil && String(projectData?.oil)?.indexOf('.') === -1 ? `${projectData?.oil}.00` : projectData?.oil;
    form[KEY_NAME.GAS] = projectData?.gas && String(projectData?.gas)?.indexOf('.') === -1 ? `${projectData?.gas}.00` : projectData?.gas;
    form[KEY_NAME.OIL_EQUIVALENT] = projectData?.oilEquivalent;

    setResourcesForm(form);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onChangeFormData = (e, key) => {
    const payload = { ...resourcesForm };
    payload[key] = e;

    setResourcesForm(payload);
  };

  const disableSubmit = () => (
    !resourcesForm[KEY_NAME.OIL] ||
    !resourcesForm[KEY_NAME.GAS] ||
    !resourcesForm[KEY_NAME.OIL_EQUIVALENT] ||
    Object.values(isLoading).includes(true)
  );

  const handleSubmit = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, submit: true }));
      const payload = {
        projectId,
        projectVersion,
        section: 'UpdateResources',
        [KEY_NAME.OIL]: Number(String(resourcesForm[KEY_NAME.OIL])?.replace(/[^.0-9.]/g, '')),
        [KEY_NAME.GAS]: Number(String(resourcesForm[KEY_NAME.GAS])?.replace(/[^.0-9.]/g, '')),
        [KEY_NAME.OIL_EQUIVALENT]: resourcesForm[KEY_NAME.OIL_EQUIVALENT],
      };

      const res = await updateResources(payload);

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
      title={<b>Update Resources</b>}
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
      <div className="project-resources-form form modal">
        <ResourcesContent
          form={resourcesForm}
          onChangeForm={onChangeFormData}
          isViewOnly={isReadOnly}
        />
      </div>
      <ConfirmationModal
        icon={{ name: 'refresh', type: 'solid' }}
        open={refreshModal}
        setOpen={setRefreshModal}
        title="Error"
        message1="Resources has been updated by another person."
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

ResourcesModal.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  onSubmit: PropTypes.func,
  setProjectVersionHandler: PropTypes.func,
  projectData: PropTypes.object,
  isReadOnly: PropTypes.bool,
  setProjectVersionParams: PropTypes.func,
};

ResourcesModal.defaultProps = {
  open: false,
  setOpen: () => {},
  onSubmit: () => {},
  projectData: {},
  isReadOnly: false,
  setProjectVersionHandler: () => {},
  setProjectVersionParams: () => {},
};

export default ResourcesModal;
