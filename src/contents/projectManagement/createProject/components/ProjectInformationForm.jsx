import React from 'react';
import PropTypes from 'prop-types';
import ProjectInformationContent from './ProjectInformationContent';

const ProjectInformationForm = ({
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
}) => (
  <div className="create-project-form-page">
    <h2 className="form-title">Project Information</h2>
    <ProjectInformationContent
      onChangeForm={onChangeForm}
      form={form}
      calculateCapex={calculateCapex}
      handleForm={handleForm}
      projectData={projectData}
      projectCriteria={projectCriteria}
      thresholdRule={thresholdRule}
      getProjectWorkflowType={getProjectWorkflowType}
      isTemplateLocked={isTemplateLocked}
      isCapexErr={isCapexErr}
      isViewOnly={isViewOnly}
    />
  </div>
);

ProjectInformationForm.propTypes = {
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
};

ProjectInformationForm.defaultProps = {
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
};

export default ProjectInformationForm;
