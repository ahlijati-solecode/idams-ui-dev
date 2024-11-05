/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable max-len */
import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import moment from 'moment';

import {
  InputText,
  Datepicker,
  Tooltip,
  Icon,
  SelectSearch,
  Checkbox,
  Card,
} from '@solecode/sole-ui';
import _debounce from 'lodash/debounce';

import './ProjectInformationForm.scss';
import KEY_NAME from '../constants/keyName';
import RenderIf from '../../../RenderIf';
import useHomeApi from '../../../../hooks/api/home';
import useProjectManagementApi from '../../../../hooks/api/projectManagement';
import useWorkflowSettingsDetailApi from '../../../../hooks/api/workflow/setting-detail';
import ComboBox from '../../../../components/ComboBox';
import CurrencyInputNumber from '../../../../components/CurrencyInputNumber';
import currencyFormatter from '../../../../libs/currencyFormatter';

const ProjectInformationContent = ({
  onChangeForm,
  form,
  calculateCapex,
  handleForm,
  projectData,
  projectCriteria,
  thresholdRule,
  getProjectWorkflowType,
  isTemplateLocked,
  isCapexErr,
  isViewOnly,
  disabledFields,
}) => {
  const { userData } = useSelector((x) => x.appReducer);
  const [projectCriteriaOpt, setProjectCriteriaOpt] = useState([...projectCriteria]);
  const {
    getHierLvl2,
    getHierLvl3,
    getHierLvl4,
  } = useProjectManagementApi();
  const { getDropdownList } = useWorkflowSettingsDetailApi();
  const { getHierName } = useHomeApi();
  const [hierName, setHierName] = useState([]);
  const [hierLvl2, setHierLvl2] = useState([]);
  const [hierLvl3, setHierLvl3] = useState([]);
  const [hierLvl4, setHierLvl4] = useState([]);
  const [projectCategory, setProjectCategory] = useState([]);
  const [rawProjectSubCriteria, setRawProjectSubCriteria] = useState([]);
  const [projectSubCriteria, setProjectSubCriteria] = useState([]);
  const [firstRender, setFirstRender] = useState(true);
  const [tryCount, setTryCount] = useState(0);
  const [categoryChange, setCategoryChange] = useState(0);

  const ProjectWorkflowTypeBody = (
    <div className="form-field">
      <div className="form-label">Project Workflow Type</div>
      <InputText
        type="text"
        placeholder=""
        size="large"
        value={form[KEY_NAME.PROJECT_WORKFLOW_TYPE]}
        max={200}
        disabled
      />
    </div>
  );

  const dbGetProjectWorkflowType = useCallback(_debounce(getProjectWorkflowType, 300), []);

  const dbCalculateCapex = useCallback(_debounce(calculateCapex, 300), []);

  const getHierNameData = async () => {
    try {
      const res = await getHierName();
      setHierName(res.data.data);
    } catch (e) {
      console.log(e);
    }
  };

  const gethierLvl2Data = async () => {
    try {
      const res = await getHierLvl2();
      const data = [];

      Object.keys(res.data.data).forEach((key) => {
        data.push({
          label: res.data.data[key],
          value: key,
        });
      });

      setHierLvl2(data);
    } catch (e) {
      console.error(e);
    } finally {
      setFirstRender(false);
      if (!projectData?.projectId && userData[KEY_NAME.HIER_LVL_2].value) {
        handleForm([KEY_NAME.HIER_LVL_2], userData[KEY_NAME.HIER_LVL_2]?.key);
      }
    }
  };

  const subCriteriaOption = (val, data) => {
    if (val === 'KebUmum') {
      handleForm([KEY_NAME.PROJECT_SUB_CRITERIA], '-');
      setProjectSubCriteria([{ label: '-', value: '-' }]);
    } else {
      setProjectSubCriteria(form[KEY_NAME.PROJECT_CATEGORY] === 'BusDev' ? data.filter((el) => el.value !== 'SPCrit2') : data);
    }
  };

  const getDropdownData = async () => {
    try {
      const res = await getDropdownList();

      const resultOfProjectCategory = res.data?.projectCategory.map((item) => ({
        label: item.value,
        value: item.key,
      }));
      setProjectCategory(resultOfProjectCategory);

      const resultOfProjectSubCriteria = res.data?.projectSubCriteria.map((item) => ({
        label: item.value,
        value: item.key,
      }));

      subCriteriaOption(form[KEY_NAME.PROJECT_CRITERIA], resultOfProjectSubCriteria);
      setRawProjectSubCriteria(resultOfProjectSubCriteria);
    } catch (e) {
      console.log(e);
    }
  };

  const gethierLvl3Data = async () => {
    try {
      const res = await getHierLvl3(form[KEY_NAME.HIER_LVL_2]);
      const data = [];

      Object.keys(res.data.data).forEach((key) => {
        data.push({
          label: res.data.data[key],
          value: key,
        });
      });

      setHierLvl3(data);
    } catch (e) {
      console.error(e);
    } finally {
      if (firstRender && !projectData?.projectId) {
        handleForm([KEY_NAME.HIER_LVL_3], userData[KEY_NAME.HIER_LVL_3]?.key);
      }
    }
  };

  const gethierLvl4Data = async () => {
    try {
      const res = await getHierLvl4(form[KEY_NAME.HIER_LVL_3]);
      const data = [];

      Object.keys(res.data.data).forEach((key) => {
        data.push({
          label: res.data.data[key],
          value: key,
        });
      });

      setHierLvl4(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!projectData.projectId) handleForm(KEY_NAME.PROJECT_SUB_CRITERIA, null);
    subCriteriaOption(form[KEY_NAME.PROJECT_CRITERIA], rawProjectSubCriteria);
  }, [form[KEY_NAME.PROJECT_CRITERIA]]);

  useEffect(() => {
    if (!projectData.projectId) handleForm(KEY_NAME.EST_FIDAPPROVED, null);
  }, [form[KEY_NAME.PROPOSAL_DATE]]);

  useEffect(() => {
    if (!firstRender) {
      handleForm(KEY_NAME.HIER_LVL_3, null);
      handleForm(KEY_NAME.ENTITY_IDS, []);
    }
    gethierLvl3Data(!projectData?.projectId);
  }, [form[KEY_NAME.HIER_LVL_2]]);

  useEffect(() => {
    if (!firstRender) {
      handleForm(KEY_NAME.ENTITY_IDS, []);
    }
    gethierLvl4Data();
  }, [form[KEY_NAME.HIER_LVL_3]]);

  useEffect(() => {
    if (!form[KEY_NAME.DRILLING_COST] || !form[KEY_NAME.FACILITIES_COST]) {
      handleForm(KEY_NAME.CAPEX, null);
      handleForm(KEY_NAME.THRESHOLD, projectData?.projectId && isTemplateLocked ? form[KEY_NAME.THRESHOLD] : null);
      return;
    }

    dbCalculateCapex(form[KEY_NAME.DRILLING_COST], form[KEY_NAME.FACILITIES_COST], { thresholdRule });
  }, [form[KEY_NAME.FACILITIES_COST], form[KEY_NAME.DRILLING_COST]]);

  useEffect(() => {
    // generate capex & threshold
    handleForm([KEY_NAME.PROJECT_WORKFLOW_TYPE], null);

    if (
      [
        form[KEY_NAME.CAPEX],
        form[KEY_NAME.PROJECT_CRITERIA],
        form[KEY_NAME.PROJECT_CATEGORY],
        form[KEY_NAME.PROJECT_SUB_CRITERIA],
        form[KEY_NAME.THRESHOLD],
      ].includes(null)) return;

    dbGetProjectWorkflowType(
      form[KEY_NAME.PROJECT_CATEGORY],
      form[KEY_NAME.PROJECT_CRITERIA],
      form[KEY_NAME.PROJECT_SUB_CRITERIA],
      thresholdRule.filter((el) => el.value === form[KEY_NAME.THRESHOLD])[0]?.key,
    );
  }, [
    form[KEY_NAME.PROJECT_CATEGORY],
    form[KEY_NAME.PROJECT_CRITERIA],
    form[KEY_NAME.PROJECT_SUB_CRITERIA],
    form[KEY_NAME.CAPEX],
    form[KEY_NAME.THRESHOLD],
  ]);

  useEffect(() => {
    if (
      (thresholdRule.filter((el) => el.value === form[KEY_NAME.THRESHOLD])[0]?.key !== undefined)
      && tryCount > 4
    ) return;

    setTryCount((prev) => prev + 1);
    dbGetProjectWorkflowType(
      form[KEY_NAME.PROJECT_CATEGORY],
      form[KEY_NAME.PROJECT_CRITERIA],
      form[KEY_NAME.PROJECT_SUB_CRITERIA],
      thresholdRule.filter((el) => el.value === form[KEY_NAME.THRESHOLD])[0]?.key,
    );
  }, [thresholdRule, form[KEY_NAME.THRESHOLD]]);

  useEffect(() => {
    if (!form[KEY_NAME.PROJECT_CATEGORY]) return;
    if (form[KEY_NAME.PROJECT_CATEGORY] === 'NonBusDev') {
      const temp = [...projectCriteria];
      setProjectCriteriaOpt(temp.filter((el) => el.value !== 'KebUmum'));
    } else {
      setProjectCriteriaOpt(projectCriteria);
    }
  }, [form[KEY_NAME.PROJECT_CATEGORY]]);

  useEffect(() => {
    if (categoryChange === 0) return;
    handleForm(KEY_NAME.PROJECT_CRITERIA, null);
    handleForm(KEY_NAME.PROJECT_SUB_CRITERIA, null);
  }, [categoryChange]);

  useEffect(() => {
    getDropdownData();
    getHierNameData();
    gethierLvl2Data();

    if (projectData?.projectId) {
      dbCalculateCapex(form[KEY_NAME.DRILLING_COST], form[KEY_NAME.FACILITIES_COST], { thresholdRule });
    }
  }, []);

  return (
    <div className="form">
      <div className="form-field">
        <div className="form-label">Project Title</div>
        <InputText
          type="text"
          placeholder="Input Project Title"
          size="large"
          value={form[KEY_NAME.PROJECT_NAME]}
          max={200}
          onChange={(e) => onChangeForm(e.target.value, KEY_NAME.PROJECT_NAME)}
          disabled={isViewOnly || disabledFields.includes(KEY_NAME.PROJECT_NAME)}
        />
      </div>

      <div className="form-field">
        <div className="form-label">Project On Stream</div>
        <Datepicker
          placeholder="Select Date"
          size="large"
          format="DD MMM YYYY"
          value={form[KEY_NAME.PROJECT_ON_STREAM]}
          onChange={(e, dateStr) => onChangeForm(dateStr, KEY_NAME.PROJECT_ON_STREAM)}
          disabled={isViewOnly || disabledFields.includes(KEY_NAME.PROJECT_ON_STREAM)}
        />
      </div>

      <div className="form-field inline">
        <div>
          <div className="form-label">{hierName?.hierLvl2 || 'Loading...'}</div>
          <SelectSearch
            placeholder={`Select ${hierName?.hierLvl2 || 'Loading...'}`}
            size="large"
            value={form[KEY_NAME.HIER_LVL_2]}
            options={hierLvl2}
            onChange={(e) => onChangeForm(e, KEY_NAME.HIER_LVL_2)}
            disabled={isViewOnly || disabledFields.includes(KEY_NAME.HIER_LVL_2)}
          />
        </div>
        <div>
          <div className="form-label">{hierName?.hierLvl3 || 'Loading...'}</div>
          <SelectSearch
            placeholder={`Select ${hierName?.hierLvl3 || 'Loading...'}`}
            size="large"
            value={form[KEY_NAME.HIER_LVL_3]}
            options={hierLvl3}
            onChange={(e) => onChangeForm(e, KEY_NAME.HIER_LVL_3)}
            disabled={isViewOnly || disabledFields.includes(KEY_NAME.HIER_LVL_3)}
          />
        </div>
      </div>

      <div className="form-field">
        <div className="form-label">Participating Interest</div>
        <CurrencyInputNumber
          prefixicon={{ name: 'percentage', size: 14 }}
          placeholder="Input Participating Interest"
          value={String(form[KEY_NAME.PARTICIPATING_INTEREST])}
          onChange={(e) => onChangeForm(e.target.value && e.target.value.indexOf('.') === -1 ? `${e.target.value}.00` : e.target.value, KEY_NAME.PARTICIPATING_INTEREST)}
          maskOptions={{ integerLimit: 3 }}
          disabled={isViewOnly || disabledFields.includes(KEY_NAME.PARTICIPATING_INTEREST)}
        />
      </div>

      <div className="form-field">
        <div className="form-label">{hierName?.hierLvl4 || 'Loading...'}</div>
        <ComboBox
          options={hierLvl4}
          showSearch={false}
          placeholder={`Select ${hierName?.hierLvl4 || 'Loading...'}`}
          onChange={(e) => onChangeForm(e, KEY_NAME.ENTITY_IDS)}
          value={form[KEY_NAME.ENTITY_IDS]}
          disabled={isViewOnly || disabledFields.includes(KEY_NAME.ENTITY_IDS)}
        />
      </div>

      <div className="form-field">
        <div className="form-label">
          Drilling Cost
          <Tooltip title="Include VAT" placement="right">
            <div className="cursor-pointer">
              <Icon name="info-circle" type="solid" size="14" />
            </div>
          </Tooltip>
        </div>
        <CurrencyInputNumber
          prefixicon={{ name: 'dollar-sign', size: 14 }}
          placeholder="Input Drilling Cost"
          value={String(form[KEY_NAME.DRILLING_COST])}
          onChange={(e) => onChangeForm(e.target.value.indexOf('.') === -1 && e.target.value ? `${e.target.value}.00` : e.target.value, KEY_NAME.DRILLING_COST)}
          disabled={isViewOnly || disabledFields.includes(KEY_NAME.DRILLING_COST)}
        />
      </div>

      <div className="form-field">
        <div className="form-label">Project Category</div>
        <SelectSearch
          placeholder="Select Project Category"
          size="large"
          options={projectCategory}
          onChange={(e) => {
            setCategoryChange((prev) => prev + 1);
            onChangeForm(e, KEY_NAME.PROJECT_CATEGORY);
          }}
          disabled={(projectData?.projectId && isTemplateLocked) || disabledFields.includes(KEY_NAME.PROJECT_CATEGORY)}
          value={form[KEY_NAME.PROJECT_CATEGORY]}
        />
      </div>

      <div className="form-field">
        <div className="form-label">
          Facilities Cost
          <Tooltip title="Include VAT" placement="right">
            <div className="cursor-pointer">
              <Icon name="info-circle" type="solid" size="14" />
            </div>
          </Tooltip>
        </div>
        <CurrencyInputNumber
          prefixicon={{ name: 'dollar-sign', size: 14 }}
          placeholder="Input Facilities Cost"
          value={String(form[KEY_NAME.FACILITIES_COST])}
          onChange={(e) => onChangeForm(e.target.value.indexOf('.') === -1 && e.target.value ? `${e.target.value}.00` : e.target.value, KEY_NAME.FACILITIES_COST)}
          disabled={isViewOnly}
        />
      </div>

      <div className="form-field">
        <div className="form-label">Project Criteria</div>
        <SelectSearch
          placeholder="Select Project Criteria"
          size="large"
          options={isTemplateLocked ? projectCriteria : projectCriteriaOpt}
          onChange={(e) => onChangeForm(e, KEY_NAME.PROJECT_CRITERIA)}
          disabled={(projectData?.projectId && isTemplateLocked) || disabledFields.includes(KEY_NAME.PROJECT_CRITERIA)}
          value={form[KEY_NAME.PROJECT_CRITERIA]}
        />
      </div>

      <div className="form-field capex">
        <div className="form-label">
          CAPEX (Capital Expenditure)
          <Tooltip title="Pertamina Portion" placement="right">
            <div className="cursor-pointer">
              <Icon name="info-circle" type="solid" size="14" />
            </div>
          </Tooltip>
        </div>

        <InputText
          prefix={{ name: 'dollar-sign', size: 14 }}
          type="text"
          placeholder=""
          size="large"
          value={form[KEY_NAME.CAPEX] ? currencyFormatter.format(form[KEY_NAME.CAPEX]) : null}
          disabled
        />
        <RenderIf isTrue={isTemplateLocked && isCapexErr}>
          <div className="form-error-message">
            <span className="text">Total CAPEX value must be within the threshold&apos;s CAPEX range.</span>
          </div>
        </RenderIf>
      </div>

      <div className="form-field">
        <div className="form-label">Project Sub-criteria</div>
        <SelectSearch
          placeholder="Select Project Sub Criteria"
          size="large"
          options={projectSubCriteria}
          onChange={(e) => onChangeForm(e, KEY_NAME.PROJECT_SUB_CRITERIA)}
          disabled={
            (projectData?.projectId && isTemplateLocked) ||
            disabledFields.includes(KEY_NAME.PROJECT_SUB_CRITERIA)
          }
          value={form[KEY_NAME.PROJECT_SUB_CRITERIA]}
        />
      </div>

      <div className="form-field">
        <div className="form-label">Threshold</div>
        <InputText
          type="text"
          placeholder=""
          size="large"
          max={200}
          disabled
          value={form[KEY_NAME.THRESHOLD]}
        />
      </div>

      <div className="form-field">
        <div className="form-label">Tanggal Pengusulan Project</div>
        <Datepicker
          placeholder="Select Date"
          size="large"
          format="DD MMM YYYY"
          value={form[KEY_NAME.PROPOSAL_DATE]}
          onChange={(e, dateStr) => onChangeForm(dateStr, KEY_NAME.PROPOSAL_DATE)}
          disabled={isViewOnly || disabledFields.includes(KEY_NAME.PROPOSAL_DATE)}
        />
      </div>

      <div className="form-field">
        <div className="form-label">Est FID Approved</div>
        <Datepicker
          placeholder="Select Date"
          size="large"
          format="DD MMM YYYY"
          value={form[KEY_NAME.EST_FIDAPPROVED]}
          disabledDate={(current) => current && current < moment(form[KEY_NAME.PROPOSAL_DATE])}
          onChange={(e, dateStr) => onChangeForm(dateStr, KEY_NAME.EST_FIDAPPROVED)}
          disabled={isViewOnly || disabledFields.includes(KEY_NAME.EST_FIDAPPROVED)}
        />
      </div>

      <div className="form-field inline full custom-rkap">
        <div>
          <div className="form-label">RKAP</div>
          <Datepicker
            placeholder="Select Date"
            size="large"
            picker="year"
            format="YYYY"
            value={form[KEY_NAME.RKAP]}
            onChange={(e, dateStr) => onChangeForm(dateStr, KEY_NAME.RKAP)}
            disabled={isViewOnly || disabledFields.includes(KEY_NAME.RKAP)}
          />
        </div>
        <div className="custom-position">
          <Checkbox
            label="Revisi"
            checked={form[KEY_NAME.REVISION]}
            onChange={(e) => onChangeForm(e.target.checked, KEY_NAME.REVISION)}
            disabled={isViewOnly || disabledFields.includes(KEY_NAME.REVISION)}
          />
        </div>
      </div>
      <div className="form-field inline full">
        <Card body={ProjectWorkflowTypeBody} />
      </div>
    </div>
  );
};

ProjectInformationContent.propTypes = {
  form: PropTypes.object,
  projectData: PropTypes.object,
  handleForm: PropTypes.func,
  onChangeForm: PropTypes.func,
  calculateCapex: PropTypes.func,
  projectCriteria: PropTypes.array,
  thresholdRule: PropTypes.array,
  getProjectWorkflowType: PropTypes.func,
  isTemplateLocked: PropTypes.bool,
  isCapexErr: PropTypes.bool,
  isViewOnly: PropTypes.bool,
  disabledFields: PropTypes.array,
};

ProjectInformationContent.defaultProps = {
  form: {},
  projectCriteria: [],
  handleForm: () => {},
  onChangeForm: () => {},
  calculateCapex: () => {},
  getProjectWorkflowType: () => {},
  projectData: {},
  thresholdRule: [],
  isTemplateLocked: false,
  isCapexErr: false,
  isViewOnly: false,
  disabledFields: [],
};

export default ProjectInformationContent;
