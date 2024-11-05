/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-alert */
/* eslint-disable max-len */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment/moment';
import { useSearchParams } from 'react-router-dom';
import ButtonFooter from '../../createProject/components/ButtonFooter';
import ProjectInformationForm from '../../createProject/components/ProjectInformationForm';
import ScopeOfWorkForm from '../../createProject/components/ScopeOfWorkForm';
import ResourcesForm from '../../createProject/components/ResourcesForm';
import EconomicIndicatorForm from '../../createProject/components/EconomicIndicatorForm';
import UploadDocument from '../../createProject/UploadDocument';
import SetMilestones from '../../createProject/SetMilestones';
import { STEP_ITEM } from '../../createProject/constants/enums';
import Steps from '../../../../components/Steps';
import RenderIf from '../../../RenderIf';
import KEY_NAME from '../../createProject/constants/keyName';
import useProjectManagementApi from '../../../../hooks/api/projectManagement';
import useWorkflowSettingsDetailApi from '../../../../hooks/api/workflow/setting-detail';
import './ProjectInformation.scss';

const ProjectInformation = ({
  data,
}) => {
  const { getDropdownList } = useWorkflowSettingsDetailApi();
  const { getScopeOfWork, getProjectDetail } = useProjectManagementApi();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState({});
  const isViewOnly = true;
  const validStepIndex = [0, 1, 2, 3, 4, 5];
  const projectId = searchParams.get('projectId') || null;
  const projectVersion = searchParams.get('projectVersion') || null;
  const [projectCriteria, setProjectCriteria] = useState([]);
  const [MM_DOLLAR] = useState(1000000);

  const remapForm = async (idx) => {
    const tempForm = { ...form };

    if (idx === 0) {
      try {
        const res = await getProjectDetail(projectId, projectVersion);

        if (res.data?.code !== 200) {
          window.alert('Something went wrong.');
          console.log(res.response);
          return;
        }

        tempForm.projectInformationForm = {
          [KEY_NAME.TEMPLATE_ID]: res.data.data?.[KEY_NAME.TEMPLATE_ID],
          [KEY_NAME.TEMPLATE_VERSION]: res.data.data?.[KEY_NAME.TEMPLATE_VERSION],
          [KEY_NAME.PROJECT_NAME]: res.data.data?.[KEY_NAME.PROJECT_NAME],
          [KEY_NAME.PROJECT_ON_STREAM]: res.data.data?.[KEY_NAME.PROJECT_ON_STREAM] ? moment(res.data.data?.[KEY_NAME.PROJECT_ON_STREAM]).format('DD MMM YYYY') : null,
          [KEY_NAME.PARTICIPATING_INTEREST]: `${String(data.participatingInterest).includes('.') ? String(data.participatingInterest) : `${String(data.participatingInterest)}.00`}`,
          [KEY_NAME.DRILLING_COST]: `${String(data.drillingCost).includes('.') ? String(data.drillingCost) : `${String(data.drillingCost)}.00`}`,
          [KEY_NAME.FACILITIES_COST]: `${String(data.facilitiesCost).includes('.') ? String(data.facilitiesCost) : `${String(data.facilitiesCost)}.00`}`,
          [KEY_NAME.CAPEX]: `${String(data.capex).includes('.') ? String(data.capex) : `${String(data.capex)}.00`}`,
          [KEY_NAME.EST_FIDAPPROVED]: res.data.data?.estFidapproved ? moment(res.data.data?.estFidapproved).format('DD MMM YYYY') : null,
          [KEY_NAME.PROPOSAL_DATE]: res.data.data?.proposalDate ? moment(res.data.data?.proposalDate).format('DD MMM YYYY') : null,
          [KEY_NAME.RKAP]: res.data.data?.rkap,
          [KEY_NAME.REVISION]: res.data.data?.revision,
          [KEY_NAME.ENTITY_IDS]: res.data.data?.[KEY_NAME.HIER_LVL_4]?.map((el) => el?.value),
          [KEY_NAME.HIER_LVL_2]: res.data.data?.[KEY_NAME.HIER_LVL_2]?.value,
          [KEY_NAME.HIER_LVL_3]: res.data.data?.[KEY_NAME.HIER_LVL_3]?.value,
          [KEY_NAME.PROJECT_CATEGORY]: res.data.data?.[KEY_NAME.PROJECT_CATEGORY],
          [KEY_NAME.PROJECT_CRITERIA]: res.data.data?.[KEY_NAME.PROJECT_CRITERIA],
          [KEY_NAME.PROJECT_SUB_CRITERIA]: res.data.data?.[KEY_NAME.PROJECT_SUB_CRITERIA] || '-',
          [KEY_NAME.THRESHOLD]: res.data.data?.[KEY_NAME.THRESHOLD],
          [KEY_NAME.PROJECT_WORKFLOW_TYPE]: res.data.data?.templateName || 'Project Workflow Type not available yet',
        };

        setForm((prev) => ({
          ...prev,
          projectInformationForm: tempForm.projectInformationForm,
        }));
      } catch (e) {
        console.log(e);
      }
    } else if (idx === 1) {
      try {
        const res = await getScopeOfWork(projectId, projectVersion);

        if (res?.code !== 200) {
          window.alert('Something went wrong.');
          console.log(res);
          return;
        }

        tempForm.scopeOfWorkForm = {
          [KEY_NAME.WELL_DRILL_PRODUCER_COUNT]: res.data?.[KEY_NAME.WELL_DRILL_PRODUCER_COUNT],
          [KEY_NAME.WELL_DRILL_INJECTOR_COUNT]: res.data?.[KEY_NAME.WELL_DRILL_INJECTOR_COUNT],
          [KEY_NAME.WELL_WORK_OVER_PRODUCER_COUNT]: res.data?.[KEY_NAME.WELL_WORK_OVER_PRODUCER_COUNT],
          [KEY_NAME.WELL_WORK_OVER_INJECTOR_COUNT]: res.data?.[KEY_NAME.WELL_WORK_OVER_INJECTOR_COUNT],
          [KEY_NAME.PLATFORM]: res.data?.[KEY_NAME.PLATFORM],
          [KEY_NAME.PIPELINE]: res.data?.[KEY_NAME.PIPELINE],
          [KEY_NAME.COMPRESSOR]: res.data?.[KEY_NAME.COMPRESSOR],
          [KEY_NAME.EQUIPMENT]: res.data?.[KEY_NAME.EQUIPMENT],
        };

        setForm((prev) => ({
          ...prev,
          scopeOfWorkForm: tempForm.scopeOfWorkForm,
        }));
      } catch (e) {
        console.log(e);
      }
    } else if (idx === 2) {
      tempForm.resourcesForm = {
        [KEY_NAME.OIL]: data?.oil && String(data?.oil)?.indexOf('.') === -1 ? `${data?.oil}.00` : data?.oil,
        [KEY_NAME.GAS]: data?.gas && String(data?.gas)?.indexOf('.') === -1 ? `${data?.gas}.00` : data?.gas,
        [KEY_NAME.OIL_EQUIVALENT]: data?.oilEquivalent,
      };

      setForm((prev) => ({
        ...prev,
        resourcesForm: tempForm.resourcesForm,
      }));
    } else if (idx === 3) {
      const leadingZero = (value) => {
        let result = null;

        if (value) {
          result = String(value).includes('.') ? String(value) : `${String(value)}.00`;
        }

        return result;
      };

      tempForm.economicIndicatorForm = {
        [KEY_NAME.NET_PRESENT_VALUE]: leadingZero(data?.netPresentValue ? String(Number(data?.netPresentValue) / MM_DOLLAR) : null),
        [KEY_NAME.PROFITABILITY_INDEX]: data?.profitabilityIndex,
        [KEY_NAME.INTERNAL_RATE_OF_RETURN]: data?.internalRateOfReturn,
        [KEY_NAME.DISCOUNTED_PAY_OUT_TIME]: data?.discountedPayOutTime,
        [KEY_NAME.PV_IN]: leadingZero(data?.pvin ? String(Number(data?.pvin) / MM_DOLLAR) : null),
        [KEY_NAME.PV_OUT]: leadingZero(data?.pvout ? String(Number(data?.pvout) / MM_DOLLAR) : null),
        [KEY_NAME.BENEFIT_COST_RATIO]: data?.benefitCostRatio,
        [KEY_NAME.PROJECT_CATEGORY]: data?.projectCategory,
      };

      setForm((prev) => ({
        ...prev,
        economicIndicatorForm: tempForm.economicIndicatorForm,
      }));
    }
  };

  const getDropdownListData = async () => {
    try {
      const res = await getDropdownList();
      setProjectCriteria(res.data?.projectCriteria.map((item) => ({
        label: item.value,
        value: item.key,
      })));
    } catch (error) {
      console.log(error);
    }
  };

  const onStepperChange = (idx) => {
    setCurrentStep(idx);
    remapForm(idx);
  };

  const pageHandler = (idx) => {
    onStepperChange(idx);
  };

  useEffect(() => {
    remapForm(currentStep);
    getDropdownListData();
  }, []);

  return (
    <div className="project-information-page">
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
          <RenderIf isTrue={currentStep === 0}>
            <ProjectInformationForm
              form={form?.projectInformationForm}
              projectCriteria={projectCriteria}
              projectData={{ projectId, projectVersion }}
              isTemplateLocked
              isCapexErr={false}
              isViewOnly={isViewOnly}
            />
          </RenderIf>
          <RenderIf isTrue={currentStep === 1}>
            <ScopeOfWorkForm
              form={form?.scopeOfWorkForm}
              isViewOnly={isViewOnly}
            />
          </RenderIf>
          <RenderIf isTrue={currentStep === 2}>
            <ResourcesForm
              form={form?.resourcesForm}
              isViewOnly={isViewOnly}
            />
          </RenderIf>
          <RenderIf isTrue={currentStep === 3}>
            <EconomicIndicatorForm
              economicIndicatorForm={form?.economicIndicatorForm}
              isViewOnly={isViewOnly}
              projectCategory={form?.economicIndicatorForm?.projectCategory}
            />
          </RenderIf>
          <RenderIf isTrue={currentStep === 4}>
            <UploadDocument
              projectId={projectId}
              projectVersion={projectVersion}
              isViewOnly={isViewOnly}
            />
          </RenderIf>
          <RenderIf isTrue={currentStep === 5}>
            <SetMilestones
              projectId={projectId}
              projectVersion={projectVersion}
              isViewOnly={isViewOnly}
            />
          </RenderIf>
          <ButtonFooter
            index={currentStep}
            onClick={pageHandler}
            disableNext={false}
            item={STEP_ITEM}
            isViewOnly={isViewOnly}
          />
        </div>
      </div>
    </div>
  );
};

ProjectInformation.propTypes = {
  data: PropTypes.object,
};

ProjectInformation.defaultProps = {
  data: {},
};

export default ProjectInformation;
