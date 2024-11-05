/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-alert */
/* eslint-disable max-len */
import React, { useState, useEffect } from 'react';
import { Button, Icon, Card } from '@solecode/sole-ui';
import { useNavigate, useSearchParams } from 'react-router-dom';
import moment from 'moment';

import { ConfirmationModal } from '../../../components';
import HeaderBanner from '../../../components/HeaderBanner';
import ButtonFooter from './components/ButtonFooter';
import ProjectInformationForm from './components/ProjectInformationForm';
import ScopeOfWorkForm from './components/ScopeOfWorkForm';
import ResourcesForm from './components/ResourcesForm';
import EconomicIndicatorForm from './components/EconomicIndicatorForm';
import RenderIf from '../../RenderIf';
import Alert from '../../../components/Alert';
import Steps from '../../../components/Steps';
import Popover from '../../../components/Popover';
import { STEP_ITEM } from './constants/enums';
import KEY_NAME from './constants/keyName';
import DEFAULT_FORM_DATA, { DEFAULT_RESOURCES_FORM_DATA, DEFAULT_SCOPE_OF_WORK_FORM_DATA, DEFAULT_ECONOMIC_INDICATOR_FORM_DATA } from './constants/formData';
import UploadDocument from './UploadDocument';
import SetMilestones from './SetMilestones';
import useProjectManagementApi from '../../../hooks/api/projectManagement';
import useWorkflowSettingsDetailApi from '../../../hooks/api/workflow/setting-detail';
import { goToTop } from '../../../libs/commonUtils';
import useMenuHelper from '../../useMenuHelper';

import './CreateProject.scss';
import Richtext from '../../../components/Richtext';

const CreateProject = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSelectedMenuKeys } = useMenuHelper();
  const {
    getDetermineTemplate,
    addNewProject,
    updateProjectInformation,
    updateScopeOfWork,
    getScopeOfWork,
    updateResources,
    updateEconomicIndicator,
    updateInitiationDocs,
    updateMilestone,
    getProjectDetail,
    initiateProject,
    lockTemplate,
    getLatestApproval,
  } = useProjectManagementApi();
  const { getDropdownList } = useWorkflowSettingsDetailApi();
  const [currentStep, setCurrentStep] = useState();
  const [projectId, setProjectId] = useState(searchParams.get('projectId') || null);
  const [projectVersion, setProjectVersion] = useState(searchParams.get('projectVersion') || null);
  const [projectInformationForm, setProjectInformationForm] = useState(DEFAULT_FORM_DATA);
  const [scopeOfWorkForm, setScopeOfWorkForm] = useState(DEFAULT_SCOPE_OF_WORK_FORM_DATA);
  const [resourcesForm, setResourcesForm] = useState(DEFAULT_RESOURCES_FORM_DATA);
  const [economicIndicatorForm, setEconomicIndicatorForm] = useState(DEFAULT_ECONOMIC_INDICATOR_FORM_DATA);
  const [determineTemplate, setDetermineTemplate] = useState({});
  const [projectCriteria, setProjectCriteria] = useState([]);
  const [latestApprovalDetails, setLatestApprovalDetail] = useState({});
  const [threshold, setThreshold] = useState([]);
  const [validStepIndex, setValidStepIndex] = useState([0]);

  const [isDisabled, setIsDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProjectStatus, setCurrentProjectStatus] = useState();
  const [projectCategory, setProjectCategory] = useState(null);
  const [isTemplateLocked, setIsTemplateLocked] = useState(false);
  const [currentThreshold, setCurrentThreshold] = useState('');
  const [isCapexErr, setIsCapexErr] = useState(false);

  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [confirmationContinueModalOpen, setConfirmationContinueModalOpen] = useState(false);

  const [milestoneFilled, setMilestoneFilled] = useState({});
  const [MM_DOLLAR] = useState(1000000);

  const navigateToAllProject = () => {
    setSelectedMenuKeys(['all-projects']);
    navigate('/project-management/all-projects');
  };

  const generateValidStepIndexArr = (num) => {
    const res = [];
    /* eslint-disable-next-line no-plusplus */
    for (let i = 0; i <= num; i++) {
      res.push(i);
    }

    return res;
  };

  const getLatestApprovalDetail = async (id) => {
    try {
      const res = await getLatestApproval(id);
      if (res.data?.code !== 200) {
        window.alert('Something went wrong.');
        console.log(res.response);
        return;
      }

      setLatestApprovalDetail(res.data.data);
    } catch (e) {
      console.log(e);
    }
  };

  // state form economic indicator
  const getProject = async (id, version) => {
    try {
      const res = await getProjectDetail(id, version);

      if (res.data?.code !== 200) {
        window.alert('Something went wrong.');
        console.log(res.response);
        return;
      }

      setCurrentProjectStatus(res.data.data?.status);
      setIsTemplateLocked(res.data.data?.templateLocked);
      setCurrentThreshold(res.data.data?.threshold);

      if (res.data.data?.status === 'Rejected') getLatestApprovalDetail(id);

      // set validStepIndex & currentStep state
      let latestStepIndex = 0;
      if (res.data.data?.section) {
        latestStepIndex = STEP_ITEM.findIndex((el) => el.key === res.data.data?.section.replace('Update', ''));
        if (latestStepIndex !== -1 && latestStepIndex !== currentStep) {
          setCurrentStep(latestStepIndex);
          const tempValidStepIndex = generateValidStepIndexArr(currentProjectStatus === 'Rejected' ? STEP_ITEM.length - 1 : latestStepIndex);
          setValidStepIndex(tempValidStepIndex);
        }
      }

      const leadingZero = (value) => {
        let result = null;

        if (value) {
          result = String(value).includes('.') ? String(value) : `${String(value)}.00`;
        }

        return result;
      };

      const form = { ...projectInformationForm };
      form[KEY_NAME.PROJECT_ID] = res.data.data?.projectId;
      form[KEY_NAME.PROJECT_VERSION] = res.data.data?.projectVersion;
      form[KEY_NAME.PROJECT_NAME] = res.data.data?.projectName;
      form[KEY_NAME.HIER_LVL_2] = res.data.data?.hierLvl2?.key;
      form[KEY_NAME.HIER_LVL_3] = res.data.data?.hierLvl3?.key;
      form[KEY_NAME.ENTITY_IDS] = res.data.data?.hierLvl4.map((el) => (el?.key));
      form[KEY_NAME.PROJECT_CATEGORY] = res.data.data?.projectCategory;
      form[KEY_NAME.PROJECT_CRITERIA] = res.data.data?.projectCriteria;
      form[KEY_NAME.PROJECT_SUB_CRITERIA] = res.data.data?.projectSubCriteria || '-';
      form[KEY_NAME.PROPOSAL_DATE] = res.data.data?.proposalDate ? moment(res.data.data.proposalDate).format('DD MMM YYYY') : null;
      form[KEY_NAME.PROJECT_ON_STREAM] = res.data.data?.projectOnStream ? moment(res.data.data?.projectOnStream).format('DD MMM YYYY') : null;
      form[KEY_NAME.PARTICIPATING_INTEREST] = `${String(res.data.data?.participatingInterest).includes('.') ? String(res.data.data?.participatingInterest) : `${String(res.data.data?.participatingInterest)}.00`}`;
      form[KEY_NAME.DRILLING_COST] = `${String(res.data.data?.drillingCost).includes('.') ? String(res.data.data?.drillingCost) : `${String(res.data.data?.drillingCost)}.00`}`;
      form[KEY_NAME.FACILITIES_COST] = `${String(res.data.data?.facilitiesCost).includes('.') ? String(res.data.data?.facilitiesCost) : `${String(res.data.data?.facilitiesCost)}.00`}`;
      form[KEY_NAME.CAPEX] = `${String(res.data.data?.capex).includes('.') ? String(res.data.data?.capex) : `${String(res.data.data?.capex)}.00`}`;
      form[KEY_NAME.EST_FIDAPPROVED] = res.data.data?.estFidapproved ? moment(res.data.data?.estFidapproved).format('DD MMM YYYY') : null;
      form[KEY_NAME.RKAP] = res.data.data?.rkap;
      form[KEY_NAME.REVISION] = Boolean(res.data.data?.revision);

      setProjectInformationForm(form);

      // initialize form resources
      const form2 = { ...resourcesForm };
      form2[KEY_NAME.OIL] = res.data.data?.oil && String(res.data.data?.oil)?.indexOf('.') === -1 ? `${res.data.data?.oil}.00` : res.data.data?.oil;
      form2[KEY_NAME.GAS] = res.data.data?.gas && String(res.data.data?.gas)?.indexOf('.') === -1 ? `${res.data.data?.gas}.00` : res.data.data?.gas;
      form2[KEY_NAME.OIL_EQUIVALENT] = res.data.data?.oilEquivalent;
      setResourcesForm(form2);

      // initialize form economic indicator

      const form3 = { ...economicIndicatorForm };

      form3[KEY_NAME.NET_PRESENT_VALUE] = leadingZero(res.data.data?.netPresentValue ? String(Number(res.data.data?.netPresentValue) / MM_DOLLAR) : null);
      form3[KEY_NAME.PROFITABILITY_INDEX] = res.data.data?.profitabilityIndex;
      form3[KEY_NAME.INTERNAL_RATE_OF_RETURN] = res.data.data?.internalRateOfReturn;
      form3[KEY_NAME.DISCOUNTED_PAY_OUT_TIME] = res.data.data?.discountedPayOutTime;
      form3[KEY_NAME.PV_IN] = leadingZero(res.data.data?.pvin ? String(Number(res.data.data?.pvin) / MM_DOLLAR) : null);
      form3[KEY_NAME.PV_OUT] = leadingZero(res.data.data?.pvout ? String(Number(res.data.data?.pvout) / MM_DOLLAR) : null);
      form3[KEY_NAME.BENEFIT_COST_RATIO] = res.data.data?.benefitCostRatio;
      setProjectCategory(res.data.data?.projectCategory);
      setEconomicIndicatorForm(form3);
    } catch (e) {
      console.log(e);
    }
  };

  const getScopeOfWorkAction = async () => {
    try {
      const res = await getScopeOfWork(projectId, projectVersion);

      if (res.code !== 200) return;
      const sowForm = { ...scopeOfWorkForm };

      sowForm[KEY_NAME.WELL_DRILL_PRODUCER_COUNT] = res.data[KEY_NAME.WELL_DRILL_PRODUCER_COUNT];
      sowForm[KEY_NAME.WELL_DRILL_INJECTOR_COUNT] = res.data[KEY_NAME.WELL_DRILL_INJECTOR_COUNT];
      sowForm[KEY_NAME.WELL_WORK_OVER_PRODUCER_COUNT] = res.data[KEY_NAME.WELL_WORK_OVER_PRODUCER_COUNT];
      sowForm[KEY_NAME.WELL_WORK_OVER_INJECTOR_COUNT] = res.data[KEY_NAME.WELL_WORK_OVER_INJECTOR_COUNT];
      sowForm[KEY_NAME.PLATFORM] = res.data[KEY_NAME.PLATFORM];
      sowForm[KEY_NAME.PIPELINE] = res.data[KEY_NAME.PIPELINE];
      sowForm[KEY_NAME.COMPRESSOR] = res.data[KEY_NAME.COMPRESSOR];
      sowForm[KEY_NAME.EQUIPMENT] = res.data[KEY_NAME.EQUIPMENT];
      setScopeOfWorkForm(sowForm);
    } catch (error) {
      console.log(error);
    }
  };

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

  const handleForm = (key, value) => {
    if (currentStep === 0) {
      setProjectInformationForm((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const isEmpty = (data) => Object.values(data).some((value) => ['null', '', 'undefined', '[]'].includes(String(value)));

  const isProhibitedToSubmit = () => {
    if (currentStep === 0) {
      setIsDisabled(
        [
          !determineTemplate?.templateId,
          !determineTemplate?.templateVersion,
          Object.values(projectInformationForm).some((value) => [null, '', undefined].includes(value)),
          (isTemplateLocked && isCapexErr),
        ].includes(true)
      );
    } else if (currentStep === 1) {
      const form = { ...scopeOfWorkForm };
      const checkedForm = {
        [KEY_NAME.WELL_DRILL_PRODUCER_COUNT]: form[KEY_NAME.WELL_DRILL_PRODUCER_COUNT],
        [KEY_NAME.WELL_WORK_OVER_PRODUCER_COUNT]: form[KEY_NAME.WELL_WORK_OVER_PRODUCER_COUNT],
        [KEY_NAME.WELL_DRILL_INJECTOR_COUNT]: form[KEY_NAME.WELL_DRILL_INJECTOR_COUNT],
        [KEY_NAME.WELL_WORK_OVER_INJECTOR_COUNT]: form[KEY_NAME.WELL_WORK_OVER_INJECTOR_COUNT],
      };

      setIsDisabled(!projectId || !projectVersion || isEmpty(checkedForm));
    } else if (currentStep === 2) {
      const checkedForm = { ...resourcesForm };

      setIsDisabled(
        !projectId
        || !projectVersion
        || isEmpty(checkedForm)
      );
    } else if (currentStep === 3) {
      if (projectCategory === 'BusDev') {
        if (
          economicIndicatorForm.discountedPayOutTime === null
          || economicIndicatorForm.internalRateOfReturn === null
          || economicIndicatorForm.netPresentValue === null
          || economicIndicatorForm.profitabilityIndex === null
        ) {
          setIsDisabled(true);
        } else {
          setIsDisabled(false);
        }
      } else {
        // eslint-disable-next-line no-lonely-if
        if (
          economicIndicatorForm.pvin === null
          || economicIndicatorForm.pvout === null
          || economicIndicatorForm.benefitCostRatio === null
        ) {
          setIsDisabled(true);
        } else {
          setIsDisabled(false);
        }
      }
    }
  };

  const onStepperChange = (idx) => {
    setCurrentStep(idx);
  };

  const updateResourcesHandler = async (idx, isNextPage = true, saveLog = false) => {
    const payload = {
      projectId,
      projectVersion,
      section: isNextPage ? `Update${STEP_ITEM[currentStep + 1].key}` : `Update${STEP_ITEM[currentStep].key}`,
      [KEY_NAME.OIL]: Number(String(resourcesForm[KEY_NAME.OIL])?.replace(/[^.0-9.]/g, '')),
      [KEY_NAME.GAS]: Number(String(resourcesForm[KEY_NAME.GAS])?.replace(/[^.0-9.]/g, '')),
      [KEY_NAME.OIL_EQUIVALENT]: resourcesForm[KEY_NAME.OIL_EQUIVALENT],
    };

    if (saveLog) {
      payload.saveLog = true;
    }

    const res = await updateResources(payload);
    if (res.data?.code !== 200) {
      console.log(res);
      window.alert('Something went wrong.');
      return;
    }

    if (!isNextPage) navigateToAllProject();
    else {
      setConfirmationContinueModalOpen(false);
      const stepTemp = [...validStepIndex];
      if (stepTemp.includes(idx + 1)) {
        onStepperChange(idx + 1);
      } else {
        stepTemp.push(idx + 1);
        setValidStepIndex(stepTemp);
        onStepperChange(idx + 1);
      }
      setIsDisabled(true);
    }
  };

  const lockTemplateHandler = async (id, ver) => {
    try {
      setIsLoading(true);
      const res = await lockTemplate(id, ver);

      if (res.data?.code !== 200) {
        window.alert('Something went wrong.');
        console.log(res.response);
        return;
      }

      await updateResourcesHandler(2);

      setIsTemplateLocked(true);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const submitForm = async (idx, isNextPage = true, saveLog = false) => {
    const lastAvailableStep = +Math.max(...validStepIndex);

    if (idx === 0) {
      setIsLoading(true);
      const payload = {
        templateId: projectInformationForm[KEY_NAME.TEMPLATE_ID] || determineTemplate?.templateId || null,
        templateVersion: (
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
        Section: `Update${STEP_ITEM[lastAvailableStep].key}` || null,
        entityIds: projectInformationForm[KEY_NAME.ENTITY_IDS] || [],
      };

      if (!projectId) {
        delete payload.projectId;
        delete payload.projectVersion;
      }

      if (saveLog) {
        payload.saveLog = true;
      }

      try {
        const res = projectId ?
          await updateProjectInformation(payload) :
          await addNewProject(payload);

        setProjectCategory(projectInformationForm[KEY_NAME.PROJECT_CATEGORY]);
        if (res.data?.code !== 200) {
          window.alert('Something went wrong.');
          console.log(res.response);
          return;
        }

        setProjectId(res.data.data?.projectId);
        setProjectVersion(res.data.data?.projectVersion);

        // add query url without reload
        const url = new URL(window.location);
        url.searchParams.set('projectId', res.data.data?.projectId);
        url.searchParams.set('projectVersion', res.data.data?.projectVersion);
        window.history.pushState(null, '', url.toString());

        await getProject(res.data.data?.projectId, res.data.data?.projectVersion);

        if (!isNextPage) navigateToAllProject();
        else {
          const stepTemp = [...validStepIndex];
          if (stepTemp.includes(idx + 1)) {
            onStepperChange(idx + 1);
          } else {
            stepTemp.push(idx + 1);
            setValidStepIndex(stepTemp);
            onStepperChange(idx + 1);
          }
          setIsDisabled(true);
          goToTop();
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    } else if (idx === 1) {
      setIsLoading(true);
      const payload = {
        projectId,
        projectVersion,
        section: isNextPage ? `Update${STEP_ITEM[currentStep + 1].key}` : `Update${STEP_ITEM[currentStep].key}`,
        ...scopeOfWorkForm,
      };

      if (saveLog) {
        payload.saveLog = true;
      }

      try {
        const res = await updateScopeOfWork(payload);
        if (res.data?.code === 200) {
          if (!isNextPage) navigateToAllProject();
          else {
            const stepTemp = [...validStepIndex];
            if (stepTemp.includes(idx + 1)) {
              onStepperChange(idx + 1);
            } else {
              stepTemp.push(idx + 1);
              setValidStepIndex(stepTemp);
              onStepperChange(idx + 1);
            }
            setIsDisabled(true);
          }
        } else {
          window.alert('Something went wrong.');
        }
      } catch (error) {
        window.alert('Something went wrong.');
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    } else if (idx === 2) {
      try {
        if (!isTemplateLocked && isNextPage) {
          setConfirmationContinueModalOpen(true);
          return;
        }
        setIsLoading(true);
        await updateResourcesHandler(idx, isNextPage, saveLog);
      } catch (e) {
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep === 3) {
      setIsLoading(true);
      const payload = economicIndicatorForm;
      payload.projectId = projectId;
      payload.projectVersion = projectVersion;
      payload.section = isNextPage ? 'UpdateInitiationDocument' : 'UpdateEconomicIndicator';
      if (projectCategory === 'BusDev') {
        payload.netPresentValue = typeof payload.netPresentValue === 'string' ? Number(payload.netPresentValue?.replace(/[^0-9.-]+/g, '')) * MM_DOLLAR : payload.netPresentValue;
      } else {
        payload.pvin = typeof payload.pvin === 'string' ? Number(payload.pvin?.replace(/[^0-9.-]+/g, '')) * MM_DOLLAR : payload.pvin;
        payload.pvout = typeof payload.pvout === 'string' ? Number(payload.pvout?.replace(/[^0-9.-]+/g, '')) * MM_DOLLAR : payload.pvout;
      }
      try {
        if (saveLog) {
          payload.saveLog = true;
        }

        const res = await updateEconomicIndicator(payload);
        if (res.data?.code !== 200) {
          console.log(res.response);
          return;
        }
        if (res.data?.code === 200) {
          await getProject(projectInformationForm?.projectId, projectInformationForm?.projectVersion);
          if (!isNextPage) navigateToAllProject();
          else {
            const stepTemp = [...validStepIndex];
            if (stepTemp.includes(idx + 1)) {
              onStepperChange(idx + 1);
            } else {
              stepTemp.push(idx + 1);
              setValidStepIndex(stepTemp);
              onStepperChange(idx + 1);
            }
            setIsDisabled(true);
          }
        }
      } catch (error) {
        window.alert('Something went wrong.');
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep === 4) {
      setIsLoading(true);
      const payload = {};
      payload.projectId = projectId;
      payload.projectVersion = projectVersion;
      payload.section = isNextPage ? 'UpdateMilestone' : 'UpdateInitiationDocument';

      if (saveLog) {
        payload.saveLog = true;
      }

      try {
        const res = await updateInitiationDocs(payload);

        if (res.code !== 200) {
          return;
        }

        if (res?.code === 200) {
          if (!isNextPage) navigateToAllProject();
          else {
            const stepTemp = [...validStepIndex];

            if (stepTemp.includes(idx + 1)) {
              onStepperChange(idx + 1);
            } else {
              stepTemp.push(idx + 1);
              setValidStepIndex(stepTemp);
              onStepperChange(idx + 1);
            }

            setIsDisabled(true);
          }
        }
      } catch (error) {
        window.alert('Something went wrong.');
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep === 5) {
      if (!isNextPage) {
        if (saveLog) {
          const milestone = Object.keys(milestoneFilled).map((e) => milestoneFilled[e]);

          const res = await updateMilestone({
            projectId,
            projectVersion,
            section: 'UpdateMilestone',
            milestone,
            saveLog: true,
          });

          if (res.data.code !== 200) {
            return;
          }
        }

        navigateToAllProject();

        return;
      }

      setConfirmationModalOpen(true);
    }
  };

  const onChangeFloatData = (e, key) => {
    const payload = { ...economicIndicatorForm };
    payload[key] = e;
    setEconomicIndicatorForm(payload);
  };

  const onChangeFormData = (e, key) => {
    if (currentStep === 0) {
      const payload = { ...projectInformationForm };
      if (![KEY_NAME.ENTITY_IDS].includes(key)) payload[key] = e;
      else payload[key] = e.map((item) => item?.key);

      setProjectInformationForm(payload);
    } else if (currentStep === 1) {
      const payload = { ...scopeOfWorkForm };
      payload[key] = e;
      setScopeOfWorkForm(payload);
    } else if (currentStep === 2) {
      const payload = { ...resourcesForm };
      payload[key] = e;
      setResourcesForm(payload);
    } else if (currentStep === 3) {
      const payload = { ...economicIndicatorForm };
      payload[key] = e;
      setEconomicIndicatorForm(payload);
    }
  };

  const pageHandler = (idx) => {
    if (currentStep < idx) submitForm(currentStep);
    else {
      const stepTemp = [...validStepIndex];
      if (stepTemp.includes(idx)) {
        onStepperChange(idx);
      } else {
        stepTemp.push(idx);
        setValidStepIndex(stepTemp);
        onStepperChange(idx);
      }
    }
  };

  const calculateCapex = (cost1, cost2, data) => {
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

    setIsCapexErr(projectId && currentThreshold ? currentThreshold !== thresholdRes : false);
    setProjectInformationForm((prev) => ({
      ...prev,
      [KEY_NAME.THRESHOLD]: projectId && isTemplateLocked ? currentThreshold || thresholdRes : thresholdRes,
      [KEY_NAME.CAPEX]: String(capex).includes('.') ? capex : `${capex}.00`,
    }));
  };

  const getProjectWorkflowType = async (category, criteria, subCriteria, thresholdParam) => {
    try {
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
    }
  };

  useEffect(() => {
    getDropdownListData();
    if (!projectId) setCurrentStep(0);
    else getProject(projectId, projectVersion);
  }, []);

  useEffect(() => {
    if (!projectId || currentStep !== 1) return;
    getScopeOfWorkAction();
  }, [currentStep]);

  useEffect(() => {
    isProhibitedToSubmit();
  }, [
    projectInformationForm,
    scopeOfWorkForm,
    resourcesForm,
    economicIndicatorForm,
  ]);

  const initiateProjectHandler = async () => {
    setIsLoading(true);
    const payload = {};
    payload.projectId = projectId;
    payload.projectVersion = projectVersion;

    try {
      const res = await initiateProject(payload);

      if (res?.data?.code !== 200) {
        return;
      }

      if (res?.data?.code === 200) {
        navigate(`/project-management/detail-project?projectId=${projectId}&projectVersion=${projectVersion}`, { state: { showAlertSuccess: true } });
      }
    } catch (error) {
      window.alert('Something went wrong.');
      console.log(error);
    } finally {
      setIsLoading(false);
      setConfirmationModalOpen(false);
    }
  };

  const setMilestonesOnNotifyUpdate = (e) => {
    setMilestoneFilled(e);
  };

  return (
    <div className="create-project-management-page">
      <div className="custom-row">
        <div className="custom-col-12 full">
          <HeaderBanner
            title="Create Project"
            breadcrumb={(
              <div
                className="header-navigation"
                onClick={() => {
                  navigateToAllProject();
                }}
                aria-hidden="true"
              >
                <Icon name="arrow-left" />
                <div className="breadcrumb">All Projects</div>
              </div>
            )}
            action={(
              <div className="header-action">
                <RenderIf isTrue={currentProjectStatus === 'Rejected'}>
                  <div className="alert-wrapper">
                    <Alert
                      message="This process need revision!"
                      showIcon
                      type="error"
                      descriptionRight={(
                        <Popover
                          content={(
                            <div className="popover-content header-banner-content">
                              <div className="form-wrapper custom-max-width">
                                <span className="form-title">Notes</span>
                                <Richtext
                                  value={latestApprovalDetails?.notes}
                                  disabled
                                />
                              </div>
                            </div>
                          )}
                          placement="bottomRight"
                          title={(
                            <div className="title-wrapper header-banner-content">
                              <div className="user">
                                <Icon name="user" />
                                <span>{latestApprovalDetails?.empName || '-'}</span>
                              </div>
                              <div className="date">
                                <Icon name="calendar" />
                                <span>
                                  {latestApprovalDetails?.approvalDate ? moment(latestApprovalDetails?.approvalDate).format('DD MMM YYYY') : '-'}
                                </span>
                              </div>
                            </div>
                          )}
                        >
                          <div className="icon-message-circle">
                            <Icon name="message-lines" type="regular" size="11" key="icon" />
                          </div>
                        </Popover>
                      )}
                      icon={{ name: 'hexagon-exclamation', type: 'regular' }}
                      closeable={false}
                    />
                  </div>
                </RenderIf>
                <div className="save-btn-wrapper">
                  <Button
                    label="Save as Draft"
                    type="secondary"
                    size="large"
                    onClick={() => submitForm(currentStep, false, true)}
                    disabled={currentStep === 0 && [null, '', 'Project Workflow Type not available yet'].includes(projectInformationForm[KEY_NAME.PROJECT_WORKFLOW_TYPE])}
                  />
                </div>
              </div>
            )}
            type="primary"
          />
        </div>
      </div>
      <div className="custom-row">
        <div className="custom-col-4">
          <div className="steps-wrapper">
            <Steps
              current={currentStep}
              direction="vertical"
              onChange={(e) => onStepperChange(e)}
              data={STEP_ITEM.map((item, idx) => {
                let status = null;

                if (idx > currentStep && idx < Math.max(...validStepIndex)) {
                  status = 'unlocked-next';
                } else if (idx === Math.max(...validStepIndex) && idx === currentStep) {
                  status = 'current-last';
                } else if (idx === Math.max(...validStepIndex)) {
                  status = 'unlocked';
                } else if (idx === currentStep && idx !== Math.max(...validStepIndex)) {
                  status = 'current-next';
                } else {
                  status = null;
                }

                return {
                  title: item.label,
                  key: item.key,
                  disabled: !validStepIndex.includes(idx),
                  status,
                };
              })}
            />
          </div>
        </div>
        <div className="custom-col-8">
          <Card body={(
            <>
              <RenderIf isTrue={currentStep === 0}>
                <ProjectInformationForm
                  currentStep={currentStep}
                  form={projectInformationForm}
                  onChangeForm={onChangeFormData}
                  getProjectWorkflowType={getProjectWorkflowType}
                  calculateCapex={calculateCapex}
                  handleForm={handleForm}
                  projectData={{ projectId, projectVersion }}
                  projectCriteria={projectCriteria}
                  thresholdRule={threshold}
                  isTemplateLocked={isTemplateLocked}
                  isCapexErr={isCapexErr}
                />
              </RenderIf>
              <RenderIf isTrue={currentStep === 1}>
                <ScopeOfWorkForm
                  form={scopeOfWorkForm}
                  onChangeForm={onChangeFormData}
                />
              </RenderIf>
              <RenderIf isTrue={currentStep === 2}>
                <ResourcesForm
                  form={resourcesForm}
                  onChangeForm={onChangeFormData}
                />
              </RenderIf>
              <RenderIf isTrue={currentStep === 3}>
                <EconomicIndicatorForm
                  isProhibitedToSubmit={isProhibitedToSubmit}
                  onChangeFormData={onChangeFormData}
                  onChangeFloatData={onChangeFloatData}
                  projectCategory={projectCategory}
                  economicIndicatorForm={economicIndicatorForm}
                />
              </RenderIf>
              <RenderIf isTrue={currentStep === 4}>
                <UploadDocument
                  projectId={projectId}
                  projectVersion={projectVersion}
                  onFormValidChange={(e) => {
                    if (currentStep !== 4) {
                      return;
                    }

                    setIsDisabled(!e);
                  }}
                />
              </RenderIf>
              <RenderIf isTrue={currentStep === 5}>
                <SetMilestones
                  projectId={projectId}
                  projectVersion={projectVersion}
                  onFormValidChange={(e) => {
                    if (currentStep !== 5) {
                      return;
                    }

                    setIsDisabled(!e);
                  }}
                  onNotifyUpdate={(setMilestonesOnNotifyUpdate)}
                  startDateLimit={moment(projectInformationForm[KEY_NAME.PROPOSAL_DATE]).toDate() || null}
                  endDateLimit={moment(projectInformationForm[KEY_NAME.EST_FIDAPPROVED]).toDate() || null}
                />
              </RenderIf>
            </>
            )}
          />
          <ButtonFooter
            index={currentStep}
            onClick={pageHandler}
            disableNext={isDisabled}
            item={STEP_ITEM}
            isLoading={isLoading}
            isTemplateLocked={isTemplateLocked}
          />
        </div>
      </div>
      <ConfirmationModal
        open={confirmationModalOpen}
        setOpen={setConfirmationModalOpen}
        onOk={() => initiateProjectHandler()}
        title="Initiate Confirmation"
        message1="Are you sure you want to initiate this project?"
        message2="This action can’t be undone."
        buttonOkLabel="Initiate"
        isLoading={isLoading}
      />

      <ConfirmationModal
        icon={{ name: 'square-check', type: 'regular' }}
        open={confirmationContinueModalOpen}
        setOpen={setConfirmationContinueModalOpen}
        onOk={() => lockTemplateHandler(projectId, projectVersion)}
        title="Continue Confirmation"
        message1="Are you sure you want to continue to next step?"
        message2="You can't edit project category, criteria, sub-criteria, & threshold after continue to next step."
        buttonOkLabel="Continue"
        isLoading={isLoading}
      />
    </div>
  );
};

export default CreateProject;
