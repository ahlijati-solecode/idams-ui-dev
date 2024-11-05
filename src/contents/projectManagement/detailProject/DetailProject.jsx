/* eslint-disable no-alert */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@solecode/sole-ui';
import moment from 'moment';

import HeaderBanner from '../../../components/HeaderBanner';
import { MeetingCard } from '../../common';
import Alert from '../../../components/Alert';
import Tabs from '../../../components/Tabs';
import SummaryCard from '../../../components/SummaryCard';
import { TABS_ITEM } from './constants/enums';
import RenderIf from '../../RenderIf';

import ProjectInformation from './components/ProjectInformation';
import ProjectWorkflow from './components/ProjectWorkflow';
import ProjectDocument from './components/ProjectDocument';
import LogHistory from './components/LogHistory';

import './DetailProject.scss';
import useProjectManagementApi from '../../../hooks/api/projectManagement';

const DetailProject = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const projectVersion = searchParams.get('projectVersion');
  const selectedTab = searchParams.get('tab');
  const [currentTab, setCurrentTab] = useState(selectedTab || TABS_ITEM[1].key);
  const [projectData, setProjectData] = useState({});

  const {
    getProjectDetail,
  } = useProjectManagementApi();

  const onTabChange = (key) => {
    searchParams.set('tab', key);
    setSearchParams(searchParams);
    setCurrentTab(key);
  };

  const setProjectVersionHandler = (response) => {
    // console.log(response);
    if (!response && !Object.keys(response).length) return;
    // add query url without reload
    const url = new URL(window.location);
    url.searchParams.set('projectId', response?.projectId);
    url.searchParams.set('projectVersion', response?.projectVersion);
    window.history.pushState(null, '', url.toString());
  };

  const getProject = async (id, version) => {
    try {
      const res = await getProjectDetail(id, version);

      if (res.data?.code !== 200) {
        window.alert('Something went wrong.');
        console.log(res.response);
        return;
      }

      setProjectData(res.data?.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getProject(projectId, projectVersion);
  }, []);

  useEffect(() => {
    if (projectData?.status === 'Rejected') {
      // comment for debugging purposes
      navigate('/project-management/all-projects');
    }
  }, [projectData]);

  return (
    <div className="detail-project-management-page">
      <div className="custom-row">
        <div className="custom-col-12 full">
          <HeaderBanner
            title="Project Detail"
            breadcrumb={(
              <div
                className="header-navigation"
                onClick={() => navigate('/project-management/all-projects')}
                aria-hidden="true"
              >
                <Icon name="arrow-left" />
                <div className="breadcrumb">All Projects</div>
              </div>
            )}
            type="primary"
          />
        </div>
      </div>
      <div className="custom-row">
        <div className="custom-col-12 full">
          <RenderIf isTrue={state?.showAlertSuccess}>
            <Alert
              showIcon
              message="Your project has been successfully initiated"
              closeable
            />
          </RenderIf>
        </div>
      </div>
      <div className="custom-row" style={{ height: 314 }}>
        <div className="custom-col-6 batik-white-bg">
          <SummaryCard
            data={{
              title: projectData?.projectName || '-',
              threshold: projectData?.threshold || '-',
              zona: projectData?.hierLvl2?.value,
              regional: projectData?.hierLvl3?.value,
              rkap: projectData?.rkap,
              revision: projectData?.revision,
              estFidDate: projectData?.endDate ? moment(projectData?.endDate).format('DD MMM YYYY') : '-',
              outstandingTask: projectData?.outstandingTask || '-',
              viewMilestoneBtn: {
                type: 'primary',
                primaryIcon: {
                  name: 'flag-swallowtail',
                  size: 16,
                },
              },
              viewCommentsBtn: {
                type: 'secondary',
                primaryIcon: {
                  name: 'comment-lines',
                  size: 20,
                },
              },
            }}
          />
        </div>
        <div className="custom-col-6">
          <MeetingCard
            projectId={projectId}
            showViewCalendar
          />
        </div>
      </div>
      <div className="custom-row">
        <div className="custom-col-12 full">
          <Tabs
            defaultActiveKey={String(currentTab)}
            data={TABS_ITEM}
            onChange={onTabChange}
          />
        </div>
      </div>
      <RenderIf isTrue={currentTab === 'projectInformation'}>
        <ProjectInformation data={projectData} />
      </RenderIf>
      <RenderIf isTrue={currentTab === 'projectWorkflow'}>
        <ProjectWorkflow
          projectParams={{
            projectId,
            projectVersion,
            currentStep: projectData?.currentWorkflowSequence,
          }}
          getProjectDetail={getProject}
          projectData={projectData}
          setProjectVersionHandler={setProjectVersionHandler}
        />
      </RenderIf>
      <RenderIf isTrue={currentTab === 'projectDocument'}>
        <ProjectDocument
          data={{
            projectData,
          }}
        />
      </RenderIf>
      <RenderIf isTrue={currentTab === 'logHistory'}>
        <LogHistory />
      </RenderIf>
    </div>
  );
};

export default DetailProject;
