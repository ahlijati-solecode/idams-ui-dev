/* eslint-disable no-alert */
/* eslint-disable no-plusplus */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, Icon } from '@solecode/sole-ui';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { useRoleHelper } from '../../../common';
import Richtext from '../../../../components/Richtext';
import Popover from '../../../../components/Popover';
import Alert from '../../../../components/Alert';
import Collapse from '../../../../components/Collapse';
import ProgressBar from '../../../../components/ProgressBar';
import Steps from '../../../../components/Steps';
import BasicButton from '../../../../components/BasicButton';
import ConfirmationApproval from './ConfirmationApproval';
import { ConfirmationModal, DeleteModal, ModalList } from '../../../../components';
import useProjectManagementApi from '../../../../hooks/api/projectManagement';
import RenderIf from '../../../RenderIf';
import UpdateProjectData from '../updateProjectData/UpdateProjectData';
import UpdateUploadData from '../updateProjectData/UpdateUploadData';
import UploadDocumentContent from '../../createProject/UploadDocumentContent';
import './ProjectWorkflow.scss';
import Meeting from './Meeting';
import convertToLocalTime from '../../../../libs/convertToLocalTime';
import { getActorName, findCommonElement } from '../../../../libs/commonUtils';

const PopoverBody = ({ data }) => (
  <div className="body-wrapper">
    {
      data.map((item) => (
        <div className="item-wrapper">
          <Icon name={item.status === 'Completed' ? 'circle-check' : 'circle'} />
          <span className="item">{item?.workflowActionName}</span>
        </div>
      ))
    }
  </div>
);

const ProjectWorkflow = ({
  projectParams,
  getProjectDetail,
  projectData,
  setProjectVersionHandler,
}) => {
  const { userRoles } = useRoleHelper();

  const [currentStep, setCurrentStep] = useState(1);
  const [defaultExpanded, setDefaultExpanded] = useState({});
  const { userData } = useSelector((x) => x.appReducer);
  const [validStepIndex, setValidStepIndex] = useState([0, 1]);
  const [stepsData, setStepsData] = useState([]);
  const [projectSequence, setProjectSequence] = useState({});
  const [projectSequenceDetail, setProjectSequenceDetail] = useState([]);
  const [currentProjectAction, setCurrentProjectAction] = useState({});
  const [showRejectedNotesHistoryModal, setShowRejectedNotesHistoryModal] = useState(false);
  const [showConfirmationApproveModal, setShowConfirmationApproveModal] = useState(false);
  const [showConfirmationRejectModal, setShowConfirmationRejectModal] = useState(false);
  const [notes, setNotes] = useState({});
  const [tempActionId, setTempActionId] = useState();
  const [refetch, setRefetch] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshModal, setRefreshModal] = useState(false);
  const {
    getProjectSequenceList,
    getProjectSequenceDetail,
    getApprovalDetail,
    postApproval,
  } = useProjectManagementApi();

  const setStepsParentHtml = (data) => {
    if (!data) return;

    const pos = [];

    data.map((el, idx) => {
      if (!('progressDot' in el)) pos.push(idx + 1);

      return pos;
    });

    pos.map((el, idx) => {
      const target = document.querySelector(`.solecode-ui-steps .ant-steps .ant-steps-item:nth-child(${el}) .ant-steps-item-container .ant-steps-item-icon .ant-steps-icon`);
      if (target) target.innerHTML = idx + 1;

      return target;
    });
  };

  const generateValidStepIndexArr = (num) => {
    const res = [];
    /* eslint-disable-next-line no-plusplus */
    for (let i = 0; i <= num; i++) {
      res.push(i);
    }

    return res;
  };

  const validateAllowedActor = (data) => {
    const listOfActor = data.map((el) => el?.actor);
    // console.log('validateAllowedActor@listOfActor', listOfActor);
    const listOfCurrentUserRoles = userData?.roles.map((el) => el?.key);
    // console.log('validateAllowedActor@listOfCurrentUserRoles', listOfCurrentUserRoles);
    const res = listOfActor.some((item) => listOfCurrentUserRoles.includes(item));
    // console.log('validateAllowedActor@res', res);
    return res;
  };

  const getPADetail = async (id) => {
    try {
      const res = await getApprovalDetail(id);

      if (res.data?.code !== 200) {
        window.alert('Something went wrong.');
        console.log(res.response);
        return;
      }

      if (res.data.data?.status === 'In-Progress') {
        setNotes((prev) => ({
          ...prev,
          [id]: null,
        }));
      }

      if (res.data.data?.notes) {
        setNotes((prev) => ({
          ...prev,
          [id]: res.data.data?.notes,
        }));
      }

      setCurrentProjectAction((prev) => ({
        ...prev,
        [id]: res.data.data,
      }));
    } catch (e) {
      console.log(e);
    }
  };

  const validateProjectActionType = (rawData, projectActionId) => {
    const idx = rawData.findIndex((el) => el.projectAction?.projectActionId === projectActionId);
    return rawData[idx].workflowAction?.workflowActionTypeParId;
  };

  const getProjectSeqDetail = async (id, seqId) => {
    if (!seqId) return;

    try {
      const res = await getProjectSequenceDetail(id, seqId);

      if (res.data?.code !== 200) {
        window.alert('Something went wrong.');
        console.log(res.data);
        return;
      }

      setProjectSequenceDetail(res.data.data?.actions);
      const defaultActiveKey = res.data.data?.actions.map((item) => item?.projectAction).filter((el) => el?.status === 'In-Progress')?.map((el) => el?.projectActionId);

      for (let i = 0; i < res.data.data?.actions.length; i++) {
        setDefaultExpanded((prev) => ({
          ...prev,
          [res.data.data?.actions[i].projectAction?.projectActionId]: defaultActiveKey,
        }));
      }

      if (!defaultActiveKey.length) return;

      for (let i = 0; i < defaultActiveKey.length; i++) {
        if (validateProjectActionType(res.data.data?.actions, defaultActiveKey[i]) === 'Approval') {
          getPADetail(defaultActiveKey[i]);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const postActionApproval = async (form) => {
    try {
      setIsLoading(true);
      const res = await postApproval(form);

      if (res.data?.code !== 200) {
        if (res.response.data.message?.toLowerCase().includes('already completed')) {
          setRefreshModal(true);
          return;
        }

        window.alert('Something went wrong.');
        console.log(res.response);
        return;
      }

      getProjectDetail(projectParams?.projectId, projectParams?.projectVersion);

      if (form?.approval) setRefetch((prev) => prev + 1);
    } catch (e) {
      console.log(e);
    } finally {
      if (form?.approval) setShowConfirmationApproveModal(false);
      else setShowConfirmationRejectModal(false);
      setIsLoading(false);
    }
  };

  const onStepperChange = (idx) => {
    if (!validStepIndex.includes(idx)) {
      const arr = [...validStepIndex];
      arr.push(idx);
      setValidStepIndex(arr);
    }

    getProjectSeqDetail(projectParams?.projectId, stepsData[idx]?.key);
    setCurrentStep(idx);
  };

  const mappingStepsData = (rawWorkflows) => {
    const uniqueParentList = [...new Set(rawWorkflows.map((el) => el.workflowCategory))];
    const groupedData = rawWorkflows.reduce((r, a) => {
      r[a.workflowCategory] = r[a.workflowCategory] || [];
      r[a.workflowCategory].push(a);
      return r;
    }, []);

    const res = [];

    /* eslint-disable no-plusplus */
    for (let i = 0; i < uniqueParentList.length; i++) {
      for (let j = 0; j < groupedData[uniqueParentList[i]].length; j++) {
        if (res.find((item) => item.key === uniqueParentList[i].replace(/\s/g, '-').toLowerCase()) === undefined) {
          res.push({
            key: uniqueParentList[i].replace(/\s/g, '-').toLowerCase(),
            label: uniqueParentList[i],
            disabled: true,
          });
        }
        res.push({
          key: groupedData[uniqueParentList[i]][j].workflowSequenceId,
          label: (
            <div className="custom-title-wrapper">
              <span>{groupedData[uniqueParentList[i]][j].workflowName}</span>
              <Popover
                content={(
                  groupedData[uniqueParentList[i]][j]?.workflowActions.map((item) => (
                    <div className="item-wrapper" key={`content-${item?.workflowActionName?.toLowerCase()}`}>
                      <Icon name={item.status === 'Completed' ? 'circle-check' : 'circle'} style={{ cursor: 'pointer' }} />
                      <span className="item">{item?.workflowActionName}</span>
                    </div>
                  ))
                )}
                placement="right"
                title={(
                  <div className="title-wrapper">
                    <div>
                      <Icon name="calendar-clock" />
                      <span>
                        {
                          `${Number(moment(groupedData[uniqueParentList[i]][j].end).diff(moment(groupedData[uniqueParentList[i]][j].start), 'days')) + 1} Days (${moment(groupedData[uniqueParentList[i]][j]?.end).format('DD MMM YYYY')})`
                        }
                      </span>
                    </div>
                    <RenderIf isTrue={Boolean(groupedData[uniqueParentList[i]][j].actionEnd)}>
                      <div className="actual-days">
                        <span>
                          {
                            `Actual: ${Number(moment(groupedData[uniqueParentList[i]][j].actionEnd).diff(moment(groupedData[uniqueParentList[i]][j].actionStart), 'days')) + 1} Days (${moment(groupedData[uniqueParentList[i]][j]?.actionEnd).format('DD MMM YYYY')})`
                          }
                        </span>
                      </div>
                    </RenderIf>
                  </div>
                )}
              >
                <div className="icon-info-circle">
                  <Icon name="info-circle" type="regular" size="14" key="icon" />
                </div>
              </Popover>
            </div>
          ),
          progressDot: true,
          isSkipped: groupedData[uniqueParentList[i]][j]?.status === 'Skipped',
        });
      }
    }

    onStepperChange(res.findIndex((el) => el.key === projectParams?.currentStep));
    return res;
  };

  const getProjectSequence = async (id, version) => {
    if (!projectParams?.currentStep) return;

    try {
      const res = await getProjectSequenceList(id, version);

      if (res.data?.code !== 200) {
        window.alert('Something went wrong.');
        console.log(res.data);
        return;
      }

      setProjectSequence((prev) => ({
        ...prev,
        percentageCompleted: res.data.data?.percentageCompleted,
        worflows: res.data.data?.workflows,
      }));

      const mappedStepsData = mappingStepsData(res.data.data?.workflows);

      let latestStepIndex = 1;
      latestStepIndex = mappedStepsData.findIndex((el) => el.key === projectParams?.currentStep);
      let tempValidStepIndex = validStepIndex;
      if (latestStepIndex !== -1 && latestStepIndex !== currentStep) {
        onStepperChange(latestStepIndex);
        tempValidStepIndex = generateValidStepIndexArr(latestStepIndex);
        setValidStepIndex(tempValidStepIndex);
      }

      setStepsData(mappedStepsData.map((el, idx) => ({
        ...el,
        disabled: el?.progressDot ? idx > Math.max(...tempValidStepIndex) : true,
      })));
      getProjectSeqDetail(projectParams?.projectId, projectParams?.currentStep);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getProjectSequence(projectParams?.projectId, projectParams?.projectVersion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectParams, refetch]);

  useEffect(() => {
    if (!stepsData) return;
    setStepsParentHtml(stepsData);
  }, [stepsData]);

  const getReadOnlyMessage = (type, refActor, listOfActorName) => {
    const actor = getActorName(refActor, listOfActorName);

    switch (type) {
      case 'Confirmation':
        return `Waiting to be confirmed by ${actor}`;
      case 'UploadUpdateData':
        return `Waiting to be updated by ${actor}`;
      default:
        return `Waiting for Approval by ${actor}`;
    }
  };

  const getLockedMessage = (idx) => `Will be unlocked after ${projectSequenceDetail[idx - 1]?.workflowAction?.workflowActionName} Completed`;

  function childComponent(obj, idx) {
    if (obj.workflowAction?.workflowActionTypeParId === 'Meeting') {
      return (
        <Meeting
          projectActionId={obj?.projectAction?.projectActionId}
          projectActionStatus={obj?.projectAction?.status}
          isAllowed={validateAllowedActor(obj?.workflowAction?.refWorkflowActors)}
          userRoles={userData?.roles}
          refWorkflowActors={obj?.workflowAction?.refWorkflowActors}
          listOfActorName={obj?.actorName}
          index={idx}
          getProjectDetail={() => getProjectDetail(projectParams?.projectId, projectParams?.projectVersion)}
          headerBefore={
            idx !== 0 ? projectSequenceDetail[idx - 1].workflowAction?.workflowActionName : null
          }
          beforeStatus={
            idx !== 0 ? projectSequenceDetail[idx - 1].projectAction?.status : null
          }
        />
      );
    }

    if (
      obj.workflowAction?.workflowActionTypeParId === 'UpdateData'
    ) {
      return (
        <UpdateProjectData
          projectId={projectData?.projectId}
          projectVersion={projectData?.projectVersion}
          projectActionId={obj?.projectAction?.projectActionId}
          projectData={projectData}
          refreshProjectDetail={getProjectDetail}
          status={obj?.projectAction?.status}
          actors={obj?.workflowAction?.refWorkflowActors}
          userRoles={userData?.roles?.map((el) => el?.key)}
          listOfActorName={obj?.actorName}
          updatedBy={obj?.projectAction?.updatedBy ?? ''}
          updatedDate={obj?.projectAction?.updatedDate ?? ''}
          createdDate={obj?.projectAction?.createdDate ?? ''}
          setProjectVersionHandler={setProjectVersionHandler}
        />
      );
    }

    if (
      (obj.workflowAction?.workflowActionTypeParId === 'Upload'
      || obj.workflowAction?.workflowActionTypeParId === 'UploadFID')
      && obj?.projectAction?.projectActionId
    ) {
      const actor =
        obj?.workflowAction?.refWorkflowActors?.length
          ? obj.workflowAction.refWorkflowActors
          : '';
      // const readOnlyUser = !(userRoles.find((e) => e.key === actor?.[0]?.actor));
      const readOnlyUser = !findCommonElement(userRoles?.map((el) => el?.key), actor?.map((el) => el?.actor));

      return (
        <UploadDocumentContent
          workflowActionTypeParId={obj.workflowAction?.workflowActionTypeParId}
          projectActionId={obj?.projectAction?.projectActionId}
          isViewOnly={obj?.projectAction?.status !== 'In-Progress'}
          showComplete={!readOnlyUser && obj?.projectAction?.status === 'In-Progress'}
          waiting={readOnlyUser && obj?.projectAction?.status === 'In-Progress'}
          actors={actor}
          listOfActorName={obj?.actorName}
          onComplete={() => {
            getProjectDetail(projectParams?.projectId, projectParams?.projectVersion);
          }}
          projectId={projectData?.projectId}
          projectVersion={projectData?.projectVersion}
          projectCategory={projectData?.projectCategory}
          regional={projectData?.hierLvl2?.key}
          threshold={projectData?.threshold}
          fidCode={projectData?.fidcode}
          status={obj?.projectAction?.status}
          isLoading={isLoading}
          setIsLoading={(value) => setIsLoading(value)}
        />
      );
    }

    if (
      obj.workflowAction?.workflowActionTypeParId === 'UploadUpdateData'
    ) {
      return (
        <UpdateUploadData
          projectId={projectParams?.projectId}
          projectVersion={projectParams?.projectVersion}
          projectActionId={obj?.projectAction?.projectActionId}
          projectData={projectData}
          refreshProjectDetail={getProjectDetail}
          status={obj?.projectAction?.status}
          updatedBy={obj?.projectAction?.updatedBy ?? ''}
          updatedDate={obj?.projectAction?.updatedDate ?? ''}
          createdDate={obj?.projectAction?.createdDate ?? ''}
          isAllowed={validateAllowedActor(obj?.workflowAction?.refWorkflowActors)}
          actors={obj?.workflowAction?.refWorkflowActors}
          listOfActorName={obj?.actorName}
          setProjectVersionHandler={setProjectVersionHandler}
        />
      );
    }

    return (
      <>
        {/* user isn't allowed to take an action... */}
        <RenderIf
          isTrue={
            !validateAllowedActor(obj?.workflowAction?.refWorkflowActors) &&
            Boolean(obj?.projectAction?.status === 'In-Progress')
          }
        >
          <Alert
            showIcon
            icon={{ name: 'hourglass-clock', size: 40 }}
            message={
              getReadOnlyMessage(
                obj?.workflowAction?.workflowActionTypeParId,
                obj?.workflowAction?.refWorkflowActors,
                obj?.actorName,
              )
            }
            type="warning"
          />
        </RenderIf>

        <RenderIf isTrue={obj?.workflowAction?.workflowActionTypeParId === 'Confirmation'}>
          <ConfirmationApproval
            projectActionDetail={obj?.projectAction}
            setRefetch={setRefetch}
            isValidActor={validateAllowedActor(obj?.workflowAction?.refWorkflowActors)}
          />
        </RenderIf>

        {/* project isn't available... */}
        <RenderIf isTrue={Boolean(!obj?.projectAction)}>
          <Alert
            showIcon
            icon={{ name: 'lock', size: 40 }}
            message={getLockedMessage(idx)}
            type="info"
          />
        </RenderIf>

        {/* user is allowed to take an action... */}
        <RenderIf
          isTrue={
            !['Optional Workflow Confirmation', 'Update Data Project'].includes(obj?.workflowAction?.workflowActionName)
          }
        >
          <div className="form-wrapper">
            {/* project status is completed */}
            <RenderIf isTrue={Boolean(currentProjectAction[obj?.projectAction?.projectActionId]?.status === 'Completed')}>
              <div className="alert-success-wrapper">
                <Alert
                  showIcon
                  icon={{ name: 'hexagon-check', size: 40, type: 'regular' }}
                  message="This process has been approved"
                  descriptionRight={(
                    <div className="details-wrapper">
                      <div className="user">
                        <Icon name="user" size={14} />
                        <span>
                          {currentProjectAction[obj?.projectAction?.projectActionId]?.empName || '-'}
                        </span>
                      </div>
                      <div className="date">
                        <Icon name="calendar" size={14} />
                        <span>{currentProjectAction[obj?.projectAction?.projectActionId]?.date ? convertToLocalTime(currentProjectAction[obj?.projectAction?.projectActionId]?.date, 'DD MMM YYYY HH:mm') : '-'}</span>
                      </div>
                    </div>
                  )}
                  type="success"
                />
              </div>
            </RenderIf>

            {/* project status is Revised */}
            <RenderIf isTrue={Boolean(currentProjectAction[obj?.projectAction?.projectActionId]?.status === 'Revised')}>
              <div className="alert-error-wrapper">
                <Alert
                  showIcon
                  icon={{ name: 'hexagon-exclamation', size: 40, type: 'regular' }}
                  message="This process need revision"
                  descriptionRight={(
                    <div className="details-wrapper">
                      <div className="user">
                        <Icon name="user" size={16} />
                        <span>
                          {currentProjectAction[obj?.projectAction?.projectActionId]?.empName}
                        </span>
                      </div>
                      <div className="date">
                        <Icon name="calendar" size={16} />
                        <span>{currentProjectAction[obj?.projectAction?.projectActionId]?.date ? convertToLocalTime(currentProjectAction[obj?.projectAction?.projectActionId]?.date, 'DD MMM YYYY HH:mm') : '-'}</span>
                      </div>
                    </div>
                  )}
                  type="error"
                />
              </div>
            </RenderIf>

            <div className="form-title">
              <RenderIf isTrue={
                (['Completed', 'Revised'].includes(currentProjectAction[obj?.projectAction?.projectActionId]?.status) ? true : validateAllowedActor(obj?.workflowAction?.refWorkflowActors)) &&
                Boolean(obj?.projectAction)
              }
              >
                <span>Notes</span>
              </RenderIf>
              <RenderIf
                isTrue={
                  (['Completed', 'Revised'].includes(currentProjectAction[obj?.projectAction?.projectActionId]?.status) ? true : validateAllowedActor(obj?.workflowAction?.refWorkflowActors)) &&
                  Boolean(obj?.projectAction) &&
                  Boolean(currentProjectAction[obj?.projectAction?.projectActionId]?.approvalHistory.length)
                }
              >
                <span
                  className="link"
                  onClick={() => setShowRejectedNotesHistoryModal(true)}
                  onKeyDown={() => setShowRejectedNotesHistoryModal(true)}
                  role="button"
                  tabIndex={0}
                >
                  {`Rejection Notes History (${currentProjectAction[obj?.projectAction?.projectActionId]?.approvalHistory.length})`}
                </span>
              </RenderIf>
              <ModalList
                title={`Rejection Notes History (${currentProjectAction[obj?.projectAction?.projectActionId]?.approvalHistory.length})`}
                data={currentProjectAction[obj?.projectAction?.projectActionId]?.approvalHistory}
                open={showRejectedNotesHistoryModal}
                onCancel={() => setShowRejectedNotesHistoryModal(false)}
              />
            </div>

            <RenderIf
              isTrue={
                obj?.workflowAction?.workflowActionTypeParId !== 'Confirmation' &&
                ['Completed', 'Revised'].includes(currentProjectAction[obj?.projectAction?.projectActionId]?.status) ? true : validateAllowedActor(obj?.workflowAction?.refWorkflowActors) &&
                !['Optional Workflow Confirmation', 'Update Data Project'].includes(obj?.workflowAction?.workflowActionName) &&
                Boolean(obj?.projectAction)
              }
            >
              <Richtext
                onChange={(e) => {
                  setNotes((prev) => ({
                    ...prev,
                    [obj?.projectAction?.projectActionId]: e,
                  }));
                }}
                value={notes[obj?.projectAction?.projectActionId]}
                disabled={Boolean(currentProjectAction[obj?.projectAction?.projectActionId]?.status !== 'In-Progress')}
              />
            </RenderIf>

            <RenderIf isTrue={
              (currentProjectAction[obj?.projectAction?.projectActionId]?.status === 'In-Progress' ? validateAllowedActor(obj?.workflowAction?.refWorkflowActors) : false)
            }
            >
              <div className="form-btn-action">
                <BasicButton
                  label="Reject"
                  danger
                  primaryIcon={<Icon name="xmark" />}
                  disabled={Object.keys(notes).length === 0 || [null, '<p><br></p>'].includes(notes[obj?.projectAction?.projectActionId])}
                  onClick={() => {
                    setTempActionId(obj?.projectAction?.projectActionId);
                    setShowConfirmationRejectModal(true);
                  }}
                />
                <BasicButton
                  type="primary"
                  label="Approve"
                  primaryIcon={<Icon name="check" />}
                  disabled={Object.keys(notes).length === 0 || [null, '<p><br></p>'].includes(notes[obj?.projectAction?.projectActionId])}
                  onClick={() => {
                    setTempActionId(obj?.projectAction?.projectActionId);
                    setShowConfirmationApproveModal(true);
                  }}
                />
              </div>
            </RenderIf>

          </div>
        </RenderIf>
      </>
    );
  }

  return (
    <div className="project-workflow-page">
      <div className="custom-row custom-gap" style={{ background: '#fff' }}>
        <div className="custom-col-4">
          <Card body={(
            <>
              <div className="progress-bar-wrapper">
                <ProgressBar
                  value={projectSequence?.percentageCompleted}
                  showInfo={false}
                  title="FID Completion"
                />
              </div>
              <div className="steps-wrapper">
                <Steps
                  current={currentStep}
                  direction="vertical"
                  data={stepsData.map((item, idx) => {
                    let status = null;

                    if (idx > currentStep && idx < Math.max(...validStepIndex)) {
                      status = ['unlocked-next', item.progressDot ? 'dot' : '', item.isSkipped ? 'skipped' : ''].join(' ');
                    } else if (idx === Math.max(...validStepIndex) && idx === currentStep) {
                      status = ['current-last', item.progressDot ? 'dot' : '', item.isSkipped ? 'skipped' : ''].join(' ');
                    } else if (idx === Math.max(...validStepIndex)) {
                      status = ['unlocked', item.progressDot ? 'dot' : ''].join(' ');
                    } else if (idx === currentStep && idx !== Math.max(...validStepIndex)) {
                      status = ['current-next', item.progressDot ? 'dot' : '', item.isSkipped ? 'skipped' : ''].join(' ');
                    } else if (idx > Math.max(...validStepIndex)) {
                      status = ['wait', item.progressDot ? 'dot' : ''].join(' ');
                    } else if (idx < Math.max(...validStepIndex)) {
                      status = ['finish', item.progressDot ? 'dot' : '', item.isSkipped ? 'skipped' : ''].join(' ');
                    } else {
                      status = null;
                    }

                    return {
                      title: item?.label,
                      subtitle: item?.subtitle,
                      key: item?.key,
                      icon: item?.icon,
                      progressDot: item?.progressDot,
                      disabled: item?.disabled,
                      status,
                    };
                  })}
                  onChange={onStepperChange}
                />
              </div>
            </>
          )}
          />
        </div>
        <div className="custom-col-8">
          <RenderIf isTrue={Boolean(projectSequenceDetail.length)}>
            <div className="collapse-wrapper">
              {
                projectSequenceDetail?.map((obj, idx) => (
                  <Collapse
                    expandIcon={({ isActive }) => <Icon name={isActive ? 'angle-up' : 'angle-down'} />}
                    data={[
                      {
                        header: obj?.workflowAction?.workflowActionName,
                        children: (
                          childComponent(obj, idx)
                        ),
                        key: obj?.projectAction?.projectActionId || `panel-${idx}`,
                        extra: obj?.projectAction?.status ? <span className={`badge-status-${obj?.projectAction?.status?.toLowerCase()}`}>{obj?.projectAction?.status}</span> : <span />,
                      },
                    ]}
                    expandIconPosition="end"
                    activeKey={defaultExpanded[obj?.projectAction?.projectActionId]}
                    key={`collapse-${obj?.workflowAction?.workflowActionName?.replace(/\s+/g, '-').toLowerCase()}`}
                    onChange={(e) => {
                      setDefaultExpanded((prev) => ({
                        ...prev,
                        [obj?.projectAction?.projectActionId]: e,
                      }));

                      if (e.includes(obj?.projectAction?.projectActionId)) {
                        if (obj?.workflowAction?.workflowActionTypeParId === 'Approval') {
                          getPADetail(obj?.projectAction?.projectActionId);
                        }
                      }
                    }}
                  />
                ))
              }
            </div>
          </RenderIf>
        </div>
      </div>

      <ConfirmationModal
        icon={{ name: 'square-check', type: 'regular' }}
        open={showConfirmationApproveModal}
        setOpen={setShowConfirmationApproveModal}
        title="Approval Confirmation"
        message1="Are you sure you want to approve this project?"
        message2="This action can’t be undone."
        buttonOkLabel="Yes, I'm sure"
        isLoading={isLoading}
        onOk={() => {
          const payload = {
            projectActionId: tempActionId,
            notes: notes[tempActionId],
            approval: true,
          };

          postActionApproval(payload);
        }}
      />

      <DeleteModal
        icon={{ name: 'triangle-exclamation', type: 'regular' }}
        open={showConfirmationRejectModal}
        setOpen={setShowConfirmationRejectModal}
        title="Reject Confirmation"
        message1="Are you sure you want to reject this project?"
        message2="This action can’t be undone."
        buttonOkLabel="Reject"
        isLoading={isLoading}
        onDelete={() => {
          const payload = {
            projectActionId: tempActionId,
            notes: notes[tempActionId],
            approval: false,
          };

          postActionApproval(payload);
        }}
      />

      <ConfirmationModal
        icon={{ name: 'refresh', type: 'solid' }}
        open={refreshModal}
        setOpen={setRefreshModal}
        title="Error"
        message1="This section has been updated by another person."
        buttonOkLabel="Refresh"
        buttonOkPrimaryIcon={<Icon name="refresh" type="solid" />}
        isSingleButton
        isLoading={isLoading?.refresh}
        onOk={() => window.location.reload()}
      />
    </div>
  );
};

ProjectWorkflow.propTypes = {
  projectParams: PropTypes.object,
  getProjectDetail: PropTypes.func,
  projectData: PropTypes.object,
  setProjectVersionHandler: PropTypes.func,
};

ProjectWorkflow.defaultProps = {
  projectParams: {},
  getProjectDetail: () => {},
  projectData: {},
  setProjectVersionHandler: () => {},
};

PopoverBody.propTypes = {
  data: PropTypes.array,
};

PopoverBody.defaultProps = {
  data: [],
};

export default ProjectWorkflow;
