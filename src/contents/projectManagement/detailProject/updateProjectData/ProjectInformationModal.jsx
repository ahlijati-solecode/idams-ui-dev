/* eslint-disable no-alert */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import moment from 'moment';
import { Button, Icon } from '@solecode/sole-ui';
import { ConfirmationModal } from '../../../../components';
import ProjectInformationContent from '../../createProject/components/ProjectInformationContent';
import DEFAULT_FORM_DATA from '../../createProject/constants/formData';
import KEY_NAME from '../../createProject/constants/keyName';
import useProjectManagementApi from '../../../../hooks/api/projectManagement';
import useWorkflowSettingsDetailApi from '../../../../hooks/api/workflow/setting-detail';
import '../../createProject/components/ProjectInformationForm.scss';

const ProjectInformationModal = ({
  open,
  setOpen,
  onSubmit,
  projectData,
  isReadOnly,
  setProjectVersionHandler,
  status,
  setProjectVersionParams,
}) => {
  const {
    getDetermineTemplate,
    updateProjectInformation,
    getLatestVersion,
  } = useProjectManagementApi();
  const { getDropdownList } = useWorkflowSettingsDetailApi();

  const { projectId, projectVersion } = projectData;

  const [isLoading, setIsLoading] = useState({
    form: false,
    submit: false,
    refresh: false,
  });
  const [projectInformationForm, setProjectInformationForm] = useState(DEFAULT_FORM_DATA);
  const [determineTemplate, setDetermineTemplate] = useState({});
  const [isCapexErr, setIsCapexErr] = useState(false);
  const [isTemplateLocked, setIsTemplateLocked] = useState(false);
  const [projectCriteria, setProjectCriteria] = useState([]);
  const [threshold, setThreshold] = useState([]);
  const [refreshModal, setRefreshModal] = useState(false);

  const getDropdownListData = async () => {
    try {
      const res = await getDropdownList();
      setProjectCriteria(res.data?.projectCriteria.map((item) => ({
        label: item.value,
        value: item.key,
      })));

      setThreshold(res.data?.threshold);
    } catch (error) {
      console.log(error);
    }
  };

  const loadForm = () => {
    setIsLoading((prev) => ({ ...prev, form: true }));
    setIsTemplateLocked(projectData?.templateLocked);

    const form = { ...projectInformationForm };
    const entityIdsValue = projectData?.hierLvl4?.map((el) => (el?.key));
    form[KEY_NAME.PROJECT_ID] = projectData?.projectId;
    form[KEY_NAME.PROJECT_VERSION] = projectData?.projectVersion;
    form[KEY_NAME.PROJECT_NAME] = projectData?.projectName;
    form[KEY_NAME.HIER_LVL_2] = projectData?.hierLvl2?.key || projectData?.hierLvl2?.value;
    form[KEY_NAME.HIER_LVL_3] = projectData?.hierLvl3?.key || projectData?.hierLvl3?.value;
    form[KEY_NAME.ENTITY_IDS] = entityIdsValue;
    form[KEY_NAME.PROJECT_CATEGORY] = projectData?.projectCategory;
    form[KEY_NAME.PROJECT_CRITERIA] = projectData?.projectCriteria;
    form[KEY_NAME.PROJECT_SUB_CRITERIA] = projectData?.projectSubCriteria || '-';
    form[KEY_NAME.PROPOSAL_DATE] = projectData?.proposalDate ? moment(projectData.proposalDate).format('DD MMM YYYY') : null;
    form[KEY_NAME.PROJECT_ON_STREAM] = projectData?.projectOnStream ? moment(projectData?.projectOnStream).format('DD MMM YYYY') : null;
    form[KEY_NAME.PARTICIPATING_INTEREST] = `${String(projectData?.participatingInterest).includes('.') ? String(projectData?.participatingInterest) : `${String(projectData?.participatingInterest)}.00`}`;
    form[KEY_NAME.DRILLING_COST] = `${String(projectData?.drillingCost).includes('.') ? String(projectData?.drillingCost) : `${String(projectData?.drillingCost)}.00`}`;
    form[KEY_NAME.FACILITIES_COST] = `${String(projectData?.facilitiesCost).includes('.') ? String(projectData?.facilitiesCost) : `${String(projectData?.facilitiesCost)}.00`}`;
    form[KEY_NAME.CAPEX] = `${String(projectData?.capex).includes('.') ? String(projectData?.capex) : `${String(projectData?.capex)}.00`}`;
    form[KEY_NAME.EST_FIDAPPROVED] = projectData?.estFidapproved ? moment(projectData?.estFidapproved).format('DD MMM YYYY') : null;
    form[KEY_NAME.RKAP] = projectData?.rkap;
    form[KEY_NAME.REVISION] = Boolean(projectData?.revision);

    getDropdownListData();
    setProjectInformationForm(form);
    setIsLoading((prev) => ({ ...prev, form: false }));
  };

  useEffect(() => {
    if (!projectData) return;
    loadForm();
  }, [projectData]);

  const onChangeFormData = (e, key) => {
    const payload = { ...projectInformationForm };

    if (![KEY_NAME.ENTITY_IDS].includes(key)) payload[key] = e;
    else payload[key] = e.map((item) => item?.key);

    setProjectInformationForm(payload);
  };

  const getProjectWorkflowType = async (category, criteria, subCriteria, thresholdParam) => {
    try {
      setIsLoading((prev) => ({ ...prev, form: true }));
      const res = await getDetermineTemplate(category, criteria, subCriteria, thresholdParam);

      if (res.data?.code !== 200) {
        window.alert('Something went wrong.');
        console.log(res.response);
        return;
      }

      setDetermineTemplate(res.data.data);
      setProjectInformationForm((prev) => ({
        ...prev,
        [KEY_NAME.TEMPLATE_ID]: res.data.data?.templateId,
        [KEY_NAME.TEMPLATE_VERSION]: res.data.data?.templateVersion,
        [KEY_NAME.PROJECT_WORKFLOW_TYPE]: res.data.data?.templateName || 'Project Workflow Type not available yet',
      }));
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading((prev) => ({ ...prev, form: false }));
    }
  };

  const calculateCapex = (cost1, cost2, data = threshold) => {
    const re = /[^0-9.-]+/g;
    const capex = Number(cost1.replace(re, '')) + Number(cost2.replace(re, ''));
    let thresholdRes = null;

    thresholdRes = data?.thresholdRule.map((item) => {
      let temp = null;
      if (item.mathOps === '>') {
        temp = capex > +item.capex1 ? item.value : null;
      }
      if (item.mathOps === '<') {
        temp = capex < +item.capex1 ? item.value : null;
      }
      if (item.mathOps === '-') {
        temp = capex >= +item.capex1 && capex <= +item.capex2 ? item.value : null;
      }

      return temp;
    }).filter((el) => el).join('');

    setIsCapexErr(
      projectData?.threshold
        ? projectData?.threshold !== (thresholdRes.length ? thresholdRes : projectData?.threshold)
        : false
    );
    setProjectInformationForm((prev) => ({
      ...prev,
      [KEY_NAME.THRESHOLD]: isTemplateLocked ? projectData?.threshold : thresholdRes || projectData?.threshold,
      [KEY_NAME.CAPEX]: capex,
    }));
    setIsLoading((prev) => ({ ...prev, form: false }));
  };

  const handleForm = (key, value) => {
    setProjectInformationForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const disableSubmit = () => (
    !projectInformationForm[KEY_NAME.PROJECT_NAME] ||
    !projectInformationForm[KEY_NAME.PROJECT_ON_STREAM] ||
    !projectInformationForm[KEY_NAME.PARTICIPATING_INTEREST] ||
    !projectInformationForm[KEY_NAME.DRILLING_COST] ||
    !projectInformationForm[KEY_NAME.FACILITIES_COST] ||
    !projectInformationForm[KEY_NAME.PROPOSAL_DATE] ||
    !projectInformationForm[KEY_NAME.EST_FIDAPPROVED] ||
    !projectInformationForm[KEY_NAME.RKAP] ||
    projectInformationForm[KEY_NAME.ENTITY_IDS].length < 1 ||
    Object.values(isLoading).includes(true) ||
    isCapexErr
  );

  const handleSubmit = async () => {
    const payload = {
      templateId: status === 'In-Progress' ?
        projectData[KEY_NAME.TEMPLATE_ID]
        : projectInformationForm[KEY_NAME.TEMPLATE_ID] || determineTemplate?.templateId || null,
      templateVersion: status === 'In-Progress' ?
        projectData[KEY_NAME.TEMPLATE_VERSION]
        : (
          projectInformationForm[KEY_NAME.TEMPLATE_VERSION] ||
          determineTemplate?.templateVersion ||
          null
        ),
      projectId,
      projectVersion,
      projectName: projectInformationForm[KEY_NAME.PROJECT_NAME] || null,
      projectOnStream: moment(projectInformationForm[KEY_NAME.PROJECT_ON_STREAM]).format('YYYY-MM-DD') || null,
      participatingInterest: Number(projectInformationForm[KEY_NAME.PARTICIPATING_INTEREST]?.replace(/[^0-9.-]+/g, '')) || null,
      drillingCost: Number(projectInformationForm[KEY_NAME.DRILLING_COST]?.replace(/[^0-9.-]+/g, '')) || 0,
      facilitiesCost: Number(projectInformationForm[KEY_NAME.FACILITIES_COST]?.replace(/[^0-9.-]+/g, '')) || 0,
      capex: projectInformationForm[KEY_NAME.CAPEX] || null,
      EstFidapproved: moment(projectInformationForm[KEY_NAME.EST_FIDAPPROVED]).format('YYYY-MM-DD') || null,
      ProposalDate: moment(projectInformationForm[KEY_NAME.PROPOSAL_DATE]).format('YYYY-MM-DD') || null,
      Rkap: Number(projectInformationForm[KEY_NAME.RKAP]) || null,
      Revision: Boolean(projectInformationForm[KEY_NAME.REVISION]),
      Section: 'UpdateProjectInformation',
      entityIds: projectInformationForm[KEY_NAME.ENTITY_IDS] || [],
    };

    try {
      setIsLoading((prev) => ({ ...prev, submit: true }));
      const res = await updateProjectInformation(payload);

      if (res.data?.code !== 200) {
        if (res.response.data.message.includes('inactive template')) {
          setRefreshModal(true);
          return;
        }

        window.alert('Something went wrong.');
        console.log(res.response);
        return;
      }

      setProjectVersionHandler(res.data.data);
      onSubmit(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  return (
    <Modal
      visible={open}
      onOk={() => { setOpen(false); }}
      onCancel={() => { setOpen(false); }}
      title={<b>Update Project Information</b>}
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
      <div className="create-project-form-page">
        <ProjectInformationContent
          form={projectInformationForm}
          onChangeForm={onChangeFormData}
          getProjectWorkflowType={getProjectWorkflowType}
          calculateCapex={calculateCapex}
          handleForm={handleForm}
          projectData={{ projectId, projectVersion }}
          // projectCriteriaOpt={projectCriteria}
          projectCriteria={projectCriteria}
          thresholdRule={threshold}
          isTemplateLocked={isTemplateLocked}
          isCapexErr={isCapexErr}
          isViewOnly={isReadOnly}
          disabledFields={[KEY_NAME.HIER_LVL_2, KEY_NAME.HIER_LVL_3, KEY_NAME.ENTITY_IDS]}
        />
      </div>

      <ConfirmationModal
        icon={{ name: 'refresh', type: 'solid' }}
        open={refreshModal}
        setOpen={setRefreshModal}
        title="Error"
        message1="Project Information has been updated by another person."
        buttonOkLabel="Refresh"
        buttonOkPrimaryIcon={<Icon name="refresh" type="solid" />}
        isSingleButton
        isLoading={isLoading?.refresh}
        onOk={async () => {
          try {
            setIsLoading((prev) => ({ ...prev, refresh: true }));
            const res = await getLatestVersion(projectInformationForm[KEY_NAME.PROJECT_ID]);

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

ProjectInformationModal.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  onSubmit: PropTypes.func,
  setProjectVersionHandler: PropTypes.func,
  projectData: PropTypes.object,
  isReadOnly: PropTypes.bool,
  status: PropTypes.string.isRequired,
  projectVersion: PropTypes.string,
  setProjectVersionParams: PropTypes.func,
};

ProjectInformationModal.defaultProps = {
  open: false,
  setOpen: () => {},
  onSubmit: () => {},
  projectData: {},
  isReadOnly: false,
  setProjectVersionHandler: () => {},
  projectVersion: null,
  setProjectVersionParams: () => {},
};

export default ProjectInformationModal;
