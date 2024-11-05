/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button, InputText, SelectSearch } from '@solecode/sole-ui';
import './WorkflowSettingsDetailsForm.scss';
import currencyFormatter from '../../libs/currencyFormatter';

export const DEFAULT_FORM = {
  templateName: '',
  projectCategory: null,
  projectCriteria: null,
  projectSubCriteria: null,
  threshold: null,
};
function WorkflowSettingsDetailsForm({
  dropdownList,
  isCreate,
  workflowDetail,
  updateForm,
  onSave,
}) {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.appReducer);
  const { roles } = userData;
  const [projectCategoryOptions, setProjectCategoryOptions] = useState([]);
  const [projectCriteriaOptions, setProjectCriteriaOptions] = useState([]);
  const [projectCriteriaOpt, setProjectCriteriaOpt] = useState([]);
  const [projectSubCriteriaOptions, setProjectSubCriteriaOptions] = useState([]);
  const [thresholdOptions, setThresholdOptions] = useState([]);
  const [thresholdValue, setThresholdValue] = useState({});

  const [form, setForm] = useState(DEFAULT_FORM);
  const [isValid, setIsValid] = useState(false);
  const [categoryChange, setCategoryChange] = useState(0);

  const constructDropdown = (list) => list?.map((i) => ({ label: i.value, value: i.key }));

  const constructForm = (key, value) => {
    setForm((prev) => {
      const data = {
        ...prev,
        [key]: value,
      };

      updateForm(data);
      return data;
    });
  };

  const validateForm = () => Object.keys(form).every((key) => key === 'projectSubCriteria' && form.projectCriteria === 'KebUmum' ? true : form[key] !== null && form[key] !== '' && form[key] !== undefined);

  const goToWorkflowSettingTemplate = (res) => {
    navigate(`/administration/workflow-settings/details?templateId=${res.templateId}&templateVersion=${res.templateVersion}`);
  };

  useEffect(() => {
    if (!Object.keys(dropdownList)?.length) return;
    const roleList = roles.map((i) => i.key);
    setProjectCategoryOptions(constructDropdown(dropdownList.projectCategory));
    setProjectCriteriaOptions(constructDropdown(dropdownList.projectCriteria));
    setProjectSubCriteriaOptions(constructDropdown(dropdownList.projectSubCriteria));
    let options = dropdownList.threshold;
    if (roleList.includes('ADMIN_REGIONAL')) {
      options = dropdownList.threshold.filter((i) => i.key === 'Reg');
    } else if (roleList.includes('ADMIN_SHU')) {
      options = dropdownList.threshold.filter((i) => i.key !== 'Reg');
    }
    setThresholdOptions(constructDropdown(options));
  }, [dropdownList, roles]);

  useEffect(() => {
    const { threshold } = form;
    if (!threshold || !dropdownList?.threshold) return;
    const data = dropdownList.threshold.filter((i) => i.key.toLowerCase() === threshold.toLowerCase());

    setThresholdValue({
      key: data[0].key,
      value: data[0].value,
      capex1: data[0].capex1 ? currencyFormatter.format(data[0].capex1, 0) : form.threshold ? '-' : null,
      mathOps: data[0].mathOps ? data[0].mathOps : form.threshold ? '-' : null,
      capex2: data[0].capex2 ? currencyFormatter.format(data[0].capex2, 0) : form.threshold ? '-' : null,
    });
  }, [dropdownList.threshold, form, isCreate]);

  useEffect(() => {
    if (!form.projectCriteria) return;

    const options = constructDropdown(dropdownList.projectSubCriteria);
    let filterDropdown = options;

    if (form.projectCriteria === 'KebUmum') {
      filterDropdown = [{ label: '-', value: null }];
    }
    setProjectSubCriteriaOptions(filterDropdown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropdownList.projectSubCriteria, form.projectCriteria]);

  useEffect(() => {
    if (!workflowDetail) return;
    setForm({
      templateName: workflowDetail.templateName,
      projectCategory: workflowDetail.projectCategory,
      projectCriteria: workflowDetail.projectCriteria,
      projectSubCriteria: workflowDetail.projectSubCriteria,
      threshold: workflowDetail.threshold,
    });
  }, [workflowDetail]);

  useEffect(() => {
    setIsValid(validateForm());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  useEffect(() => {
    if (categoryChange === 0) return;
    setForm((prev) => ({ ...prev, projectCriteria: null }));
    setForm((prev) => ({ ...prev, projectSubCriteria: null }));
  }, [categoryChange]);

  useEffect(() => {
    const tempProjectCriteria = [...projectCriteriaOptions];

    if (!form.projectCategory) return;
    if (form.projectCategory === 'NonBusDev') {
      setProjectCriteriaOpt(tempProjectCriteria.filter((el) => el.value !== 'KebUmum'));
    } else {
      setProjectCriteriaOpt(tempProjectCriteria);
    }
  }, [form.projectCategory]);

  return (
    <div className="workflow-setting-form">
      <h2 className="form-title">Project Criteria & Threshold</h2>
      <div className="form">
        <div className="form-field">
          <div className="form-label">Project Template Name</div>
          <InputText
            type="text"
            placeholder="Input Project Template Name"
            size="large"
            value={form.templateName}
            onChange={(e) => constructForm('templateName', e.target.value)}
            max={200}
          />
        </div>

        <div className="form-field">
          <div className="form-label">Threshold</div>
          <SelectSearch
            options={thresholdOptions}
            placeholder="Select Threshold"
            size="large"
            value={form.threshold}
            onChange={(e) => constructForm('threshold', e)}
          />
        </div>

        <div className="form-field">
          <div className="form-label">Project Category</div>
          <SelectSearch
            options={projectCategoryOptions}
            placeholder="Select Project Category"
            size="large"
            value={form.projectCategory}
            onChange={(e) => {
              setCategoryChange((prev) => prev + 1);
              constructForm('projectCategory', e);
            }}
          />
        </div>

        <div className="form-field">
          <div className="form-label">CAPEX (Capital Expenditure) 1</div>
          <InputText
            type="text"
            placeholder="Input CAPEX (Capital Expenditure) 1"
            size="large"
            prefix={{ name: 'dollar-sign', type: 'regular' }}
            value={thresholdValue.capex1}
            disabled
          />
        </div>

        <div className="form-field">
          <div className="form-label">Project Criteria</div>
          <SelectSearch
            // options={projectCriteriaOptions}
            options={projectCriteriaOpt}
            placeholder="Select Project Criteria"
            size="large"
            value={form.projectCriteria}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, projectSubCriteria: null }));
              constructForm('projectCriteria', e);
            }}
          />
        </div>

        <div className="form-field">
          <div className="form-label">Math Operator</div>
          <InputText
            type="text"
            placeholder="Input Math Operator"
            size="large"
            value={thresholdValue.mathOps}
            disabled
          />
        </div>

        <div className="form-field">
          <div className="form-label">Project Sub-Criteria</div>
          <SelectSearch
            options={form.projectCategory === 'BusDev' ? projectSubCriteriaOptions.filter((el) => el.value !== 'SPCrit2') : projectSubCriteriaOptions}
            placeholder="Select Project Sub-Criteria"
            size="large"
            value={form.projectSubCriteria}
            onChange={(e) => constructForm('projectSubCriteria', e)}
            disabled={!form.projectCriteria}
          />
        </div>

        <div className="form-field">
          <div className="form-label">CAPEX (Capital Expenditure) 2</div>
          <InputText
            type="text"
            placeholder="Input CAPEX (Capital Expenditure) 2"
            size="large"
            prefix={{ name: 'dollar-sign', type: 'regular' }}
            value={thresholdValue.capex2}
            disabled
          />
        </div>
      </div>

      { isCreate && (
      <div className="form-footer">
        <Button
          label="Add Workflow"
          type="primary"
          size="large"
          onClick={() => onSave(goToWorkflowSettingTemplate, form)}
          disabled={!isValid}
        />
      </div>
      )}
    </div>
  );
}

WorkflowSettingsDetailsForm.propTypes = {
  dropdownList: PropTypes.object,
  isCreate: PropTypes.bool,
  workflowDetail: PropTypes.object,
  updateForm: PropTypes.func,
  onSave: PropTypes.func,
};

WorkflowSettingsDetailsForm.defaultProps = {
  dropdownList: {},
  isCreate: true,
  workflowDetail: {},
  updateForm: () => {},
  onSave: () => {},
};

export default WorkflowSettingsDetailsForm;
