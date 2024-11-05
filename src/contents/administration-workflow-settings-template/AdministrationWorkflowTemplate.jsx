import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Icon, Card, InputText, SelectSearch, Modal, Tooltip } from '@solecode/sole-ui';
import { Input, Checkbox } from 'antd';
import DocumentTable from './DocumentTable';
import RenderIf from '../RenderIf';
import useWorkflowDetailApi from '../../hooks/api/workflow/workflow-detail';
import './AdministrationWorkflowTemplate.scss';

const AdmininstrationWorkflowTemplate = () => {
  const [optional, setOptional] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [workflowTypes, setWorkflowTypes] = useState([]);
  const [workflowType, setWorkflowType] = useState('');
  const [workflowTypeLabel, setWorkflowTypeLabel] = useState('');
  const [workflowName, setWorkflowName] = useState('');
  const [sla, setSla] = useState(null);
  const [stage, setStage] = useState(null);
  const [templateVersion, setTemplateVersion] = useState(null);
  const [workflowSequenceId, setWorkflowSequenceId] = useState(null);
  const [templateId, setTemplateId] = useState(null);
  const [documentGroup, setDocumentGroup] = useState([]);
  const [workflowTypesText, setWorkflowTypesText] = useState({});

  const navigate = useNavigate();
  const { search } = useLocation();
  const { getWorkflowTypes, getWorkflowSequence, postWorkflowSequence } = useWorkflowDetailApi();
  const getWorkflowTypeList = async () => {
    try {
      const res = await getWorkflowTypes(stage);
      if (res?.status === 'Success') {
        const mappingWorkflowTypes = [];
        const mappingText = {};
        for (let i = 0; i < res.data.length; i += 1) {
          mappingWorkflowTypes.push({
            label: res.data[i].value,
            value: res.data[i].key,
          });

          mappingText[res.data[i].key] = res.data[i].value;
        }

        setWorkflowTypesText(mappingText);
        setWorkflowTypes(mappingWorkflowTypes);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getWorkflowSequenceData = async (workflowSeqId) => {
    try {
      const res = await getWorkflowSequence(workflowSeqId);
      if (res?.status === 'Success') {
        setWorkflowTypeLabel(res.data.workflowType);
        setWorkflowName(res.data.workflowName);
        setSla(res.data.sla);
        setOptional(res.data.isOptional);
        setDocumentGroup(res.data.documentGroup);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveWorkflowSequence = async (callback) => {
    const data = {
      workflowSequenceId: workflowSequenceId || '',
      templateId,
      templateVersion,
      workflowId: workflowType,
      workflowName,
      SLA: sla,
      SLAUoM: 'day',
      isOptional: optional,
    };
    try {
      await postWorkflowSequence(data).then((res) => {
        if (res?.data?.status === 'Success') {
          setWorkflowSequenceId(res.data.data.workflowSequenceId);
          getWorkflowSequenceData(res.data.data.workflowSequenceId);
          // eslint-disable-next-line no-unused-expressions
          callback && callback();
        }
      });
    } catch (e) {
      console.log(e);
    }
  };

  function selectSearchBy(e) {
    setWorkflowType(e);
  }

  useEffect(() => {
    const paramsStage = new URLSearchParams(search).get('stage');
    const paramsWorkflowId = new URLSearchParams(search).get('workflowId');
    const paramsWorkflowSequenceId = new URLSearchParams(search).get('workflowSequenceId');
    const paramsTemplateId = new URLSearchParams(search).get('templateId');
    const paramsTemplateVersion = new URLSearchParams(search).get('templateVersion');
    setStage(paramsStage);
    setWorkflowSequenceId(paramsWorkflowSequenceId);
    setWorkflowType(paramsWorkflowId);
    setTemplateId(paramsTemplateId);
    setTemplateVersion(paramsTemplateVersion);
    if (stage) getWorkflowTypeList();
    if (workflowSequenceId) getWorkflowSequenceData(workflowSequenceId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  function openModal() {
    setIsVisible(true);
  }

  function closeModal() {
    setIsVisible(false);
  }

  function approveOptional() {
    setOptional(true);
    closeModal();
  }

  function ModalConfirm() {
    return (
      <Modal
        className="custom-modal"
        body={(
          <div className="modal-confirm">
            <div className="modal-header">
              <Icon style={{ marginBottom: '8px' }} name="circle-question" type="regular" size="48" />
              <div style={{ marginBottom: '8px' }}>Are you sure you want to set this workflow as optional?</div>
            </div>
            <div className="modal-content">
              <div className="light-text">If the workflow is set as optional,  user can skip this workflow.</div>
            </div>
            <div style={{ marginTop: '24px' }} className="modal-footer">
              <Button onClick={() => closeModal()} label="Cancel" size="middle" type="secondary" />
              <Button onClick={() => approveOptional()} label="Yes I'm sure" size="middle" type="primary" />
            </div>
          </div>
        )}
        footer=""
        visible={isVisible}
        title=""
        type="default"
      />
    );
  }

  function goBack() {
    navigate(`/administration/workflow-settings/details?templateId=${templateId}&templateVersion=${templateVersion}`);
  }

  return (
    <div className="administration-create-workflow-template">
      <ModalConfirm />
      <div className="header">
        <div className="header-menu">
          <div
            className="navigation"
            role="button"
            tabIndex={-1}
            onClick={goBack}
            onKeyDown={() => {}}
          >
            <Icon name="arrow-left" />
            <h2 className="breadcrumb">Project Workflow Setting</h2>
          </div>
          <h1 className="header-title">Manage Project Workflow</h1>
        </div>

        <div className="header-action">
          <Button
            onClick={() => {
              saveWorkflowSequence(goBack);
            }}
            label="Save Workflow"
            type="primary"
            disabled={workflowSequenceId ? 0 : 1}
          />
        </div>
      </div>
      <Card body={(
        <div>
          <div className="workflow-setting-form">
            <h2 className="form-title">Workflow Information</h2>
            <div className="form">
              <div className="form-field">
                <div className="form-label">Workflow Type</div>
                <RenderIf isTrue={!workflowSequenceId}>
                  <SelectSearch
                    options={workflowTypes}
                    placeholder="Select Workflow Type"
                    size="large"
                    value={workflowTypesText[workflowType]}
                    onChange={(e) => selectSearchBy(e)}
                    disabled={workflowSequenceId}
                  />
                </RenderIf>
                <RenderIf isTrue={workflowSequenceId}>
                  <InputText
                    type="text"
                    size="large"
                    value={workflowTypeLabel}
                    disabled={workflowSequenceId}
                  />
                </RenderIf>
              </div>
              <div className="form-field">
                <div className="form-label" style={{ display: 'flex' }}>
                  Workflow Name
                  <Tooltip
                    placement="right"
                    title="“Workflow Name” will be displayed as workflow template identity."
                  >
                    <span style={{ marginLeft: '4px' }}>
                      <Icon name="circle-info" type="solid" size="16" />
                    </span>
                  </Tooltip>
                </div>
                <InputText
                  type="text"
                  placeholder="Input Workflow Name"
                  size="large"
                  max={200}
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                />
              </div>
              <div className="form-field">
                <div className="form-label">SLA</div>
                <div className="sla-input-container">
                  <div className="input-suffix solecode-ui-input-text">
                    <Input
                      placeholder="Input SLA"
                      size="large"
                      type="number"
                      min={0}
                      suffix={<div>day(s)</div>}
                      value={sla}
                      onChange={(e) => setSla(e.target.value)}
                    />
                  </div>
                  <Checkbox
                    checked={optional}
                    onChange={(e) => e.target.checked ? openModal() : setOptional(e.target.checked)}
                  >
                    Set Workflow as Optional
                  </Checkbox>
                </div>
              </div>
            </div>
            { workflowSequenceId ?
              documentGroup.map((item) => <DocumentTable stage={stage} documentGroup={item} key={item.docGroupParId} />)
              : (
                <div className="form-footer">
                  <Button
                    onClick={() => saveWorkflowSequence()}
                    label="Add Document Checklist"
                    type="primary"
                    disabled={!(workflowType && workflowName && sla)}
                  />
                </div>
              )}
          </div>
        </div>
      )}
      />
    </div>
  );
};
export default AdmininstrationWorkflowTemplate;
