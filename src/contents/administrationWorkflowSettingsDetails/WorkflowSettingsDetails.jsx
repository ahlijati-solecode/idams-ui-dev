/* eslint-disable no-unused-expressions */
import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Icon, Card } from '@solecode/sole-ui';
import HeaderBanner from '../../components/HeaderBanner';
import RenderIf from '../RenderIf';
import ConfirmationModal from '../../components/ConfirmationModal';
import WorkflowSettingsDetailsForm from './WorkflowSettingsDetailsForm';
import WorkflowSettingsDetailsManage from './WorkflowSettingsDetailsManage';
import useWorkflowSettingsDetailApi from '../../hooks/api/workflow/setting-detail';
import './WorkflowSettingsDetails.scss';

const AdmininstrationWorkflowSettingsDetail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('templateId');
  const templateVersion = searchParams.get('templateVersion');

  const [isCreate, setIsCreate] = useState(true);
  const [dropdownList, setDropdownList] = useState({});
  const [form, setForm] = useState();
  const [workflowDetail, setWorkflowDetail] = useState(null);
  const [updatedWorkflow, setUpdatedWorkflow] = useState(null);
  const [firstLoad, setFirstLoad] = useState(false);
  // save all changes modal
  const [isOpenModal, setIsOpenModal] = useState(false);
  // duplicate modal
  const [isOpenModalDuplicate, setIsOpenModalDuplicate] = useState(false);

  const {
    getDropdownList,
    postWorkflowSettingSave,
    postWorkflowSettingSequenceDelete,
    getWorkflowSettingDetail,
    postWorkflowSettingSaveAllChanges,
  } = useWorkflowSettingsDetailApi();

  const getDropdownListAction = async () => {
    try {
      const res = await getDropdownList();

      setDropdownList(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const getWorkflowSettingDetailAction = async () => {
    setFirstLoad(false);
    try {
      const res = await getWorkflowSettingDetail(templateId, templateVersion);
      if (res?.status === 'Success') {
        setWorkflowDetail(res.data);
        setForm(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const postWorkflowSettingSaveAction = async (callback, data, status) => {
    try {
      const params = {
        ...form,
        ...data,
        workflowSequence: updatedWorkflow,
        templateId,
        templateVersion,
      };

      if (status) {
        params.status = status;
      }

      const res = await postWorkflowSettingSave(params);

      if (res?.response?.data?.code === 400) {
        setIsOpenModalDuplicate(true);
      }

      if (res?.data?.status === 'Success' || res?.status === 'Success') {
        workflowDetail && getWorkflowSettingDetailAction();
        callback && callback(res?.data?.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const postWorkflowSettingSequenceDeleteAction = async (workflowSequenceId) => {
    try {
      const res = await postWorkflowSettingSequenceDelete(workflowSequenceId);
      if (res?.status === 'Success') {
        getWorkflowSettingDetailAction();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const goToWorkflowSettingList = () => {
    navigate('/administration/workflow-settings');
  };

  const handleSaveAllChange = async () => {
    try {
      const res = await postWorkflowSettingSaveAllChanges({
        templateId,
        templateVersion,
      });

      if (res?.data?.status === 'Success' || res?.status === 'Success') {
        workflowDetail && getWorkflowSettingDetailAction();
        goToWorkflowSettingList();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isShowSaveAllChanges = (data) => data?.status?.toLowerCase() === 'draft' && !data?.isActive;

  useEffect(() => {
    getDropdownListAction();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIsCreate(true);
    if (!templateId || !templateVersion) return;
    setIsCreate(false);
    getWorkflowSettingDetailAction();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, templateVersion]);

  useEffect(() => {
    if (!workflowDetail) return;
    setTimeout(() => setFirstLoad(true), 1000);
    if (!firstLoad) return;
    postWorkflowSettingSaveAction();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedWorkflow, workflowDetail]);

  const CardContent = useCallback(() => (
    <>
      <WorkflowSettingsDetailsForm
        dropdownList={dropdownList}
        isCreate={isCreate}
        workflowDetail={workflowDetail}
        updateForm={(value) => setForm(value)}
        onSave={postWorkflowSettingSaveAction}
      />
      {!isCreate && workflowDetail?.workflowSequence?.length > 0 && (
      <WorkflowSettingsDetailsManage
        workflowDetail={workflowDetail}
        setUpdatedWorkflow={setUpdatedWorkflow}
        deleteWorkflow={(value) => postWorkflowSettingSequenceDeleteAction(value)}
      />
      ) }
    </>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [dropdownList, isCreate, workflowDetail]);

  return (
    <div className="administration-workflow-setting-detail-page">
      <ConfirmationModal
        className="confirmation-modal"
        icon={{
          name: 'square-check',
          size: 48,
          type: 'regular',
        }}
        open={isOpenModal}
        setOpen={setIsOpenModal}
        onOk={() => postWorkflowSettingSaveAction(handleSaveAllChange, {}, 'Published')}
        title="Save Changes Confirmation"
        message1="Are you sure you want to save all changes in this project workflow template?"
        message2={'This action can\'t be undone'}
        buttonOkLabel={'Yes, I\'m sure'}
        buttonCancelLabel="Cancel"
      />

      <ConfirmationModal
        icon={{ name: 'triangle-exclamation', type: 'regular' }}
        open={isOpenModalDuplicate}
        setOpen={setIsOpenModalDuplicate}
        onOk={() => {
          setIsOpenModalDuplicate(false);
        }}
        title="You can't add this workflow template."
        message1="The same project workflow template already exists."
        message2="You need to change the project criteria and threshold information to continue."
        isDanger
        isSingleButton
      />
      <HeaderBanner
        title="Manage Project Workflow"
        breadcrumb={(
          <div
            className="header-navigation"
            onClick={() => goToWorkflowSettingList()}
            aria-hidden="true"
          >
            <Icon name="arrow-left" />
            <div className="breadcrumb">Project Workflow Setting</div>
          </div>
        )}
        action={(
          <div className="header-action">
            <RenderIf isTrue={!isShowSaveAllChanges(workflowDetail)}>
              <Button
                label="Save as Draft"
                type="secondary"
                size="large"
                onClick={() => postWorkflowSettingSaveAction(goToWorkflowSettingList)}
              />
              <Button
                label="Publish as Active"
                type="secondary"
                size="large"
                disabled={!templateId || !templateVersion}
                onClick={() => postWorkflowSettingSaveAction(goToWorkflowSettingList, {}, 'Published')}
              />
            </RenderIf>

            <RenderIf isTrue={isShowSaveAllChanges(workflowDetail)}>
              <Button
                label="Save All Changes"
                type="secondary"
                size="large"
                disabled={!templateId || !templateVersion}
                onClick={() => setIsOpenModal(true)}
              />
            </RenderIf>
          </div>
        )}
        type="primary"
      />
      <Card body={<CardContent />} />
    </div>
  );
};

export default AdmininstrationWorkflowSettingsDetail;
