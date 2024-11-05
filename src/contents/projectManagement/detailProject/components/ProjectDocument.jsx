/* eslint-disable no-alert */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import ProjectsContent from '../../../documentManagement/components/ProjectsContent';
import './ProjectDocument.scss';
import { sourceParent } from '../../../documentManagement/enums/enums';
import useProjectManagementApi from '../../../../hooks/api/projectManagement';
import useWorkflowSettingsDetailApi from '../../../../hooks/api/workflow/setting-detail';

const ProjectDocument = ({ data }) => {
  const { getDetermineTemplate } = useProjectManagementApi();
  const { getDropdownList } = useWorkflowSettingsDetailApi();
  const navigate = useNavigate();
  const { state } = useLocation();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const projectVersion = searchParams.get('projectVersion');
  const selectedTab = searchParams.get('tab');

  const setState = (workflowType = null, subCriteria = null) => {
    const url = `${location.pathname}?projectId=${projectId}&projectVersion=${projectVersion}&tab=${selectedTab}`;
    navigate(url, {
      state: {
        projectName: data?.projectData?.projectName || state?.projectName,
        projectVersion: data?.projectData?.projectVersion || projectVersion || state?.projectVersion,
        workflowType: workflowType || state?.workflowType,
        threshold: data?.projectData?.threshold || state?.threshold,
        regional: data?.projectData?.hierLvl2?.value || state?.regional,
        zona: data?.projectData?.hierLvl3?.value || state?.zona,
        status: data?.projectData?.status || state?.status,
        rkap: data?.projectData?.rkap || state?.rkap,
        revision: data?.projectData?.revision || state?.revision,
        subCriteria: subCriteria || state?.subCriteria,
      },
    });
  };

  const getWorkflowType = async (category, criteria, subCriteria, threshold) => {
    try {
      const res = await getDetermineTemplate(category, criteria, subCriteria, threshold);

      if (res.data?.code !== 200) {
        window.alert('Something went wrong.');
        console.log(res.response);
        return;
      }
      const templateName = res.data.data?.templateName;
      const getDropdown = await getDropdownList();
      const subCriteriaLabel = getDropdown.data.projectSubCriteria.find((item) => item?.key === subCriteria)?.value;
      await setState(templateName, subCriteriaLabel);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (!data) return;
    getWorkflowType(
      data?.projectData?.projectCategory,
      data?.projectData?.projectCriteria,
      data?.projectData?.projectSubCriteria,
      data?.projectData?.threshold
    );
  }, []);

  return (
    <div className="project-document-page">
      <ProjectsContent
        paramsData={{
          projectData: data?.projectData,
          sourceParent: sourceParent.DETAILS,
        }}
      />
    </div>
  );
};

ProjectDocument.propTypes = {
  data: PropTypes.object,
};

ProjectDocument.defaultProps = {
  data: {},
};

export default ProjectDocument;
