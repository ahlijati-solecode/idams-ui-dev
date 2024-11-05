import React, { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Icon } from '@solecode/sole-ui';
import { UserInfoPopoverContent, useRoleHelper } from './common';
import AdmininstrationWorkflowSettings from './AdmininstrationWorkflowSettings';
import AdministrationWorkflowSettingsDetails from './administrationWorkflowSettingsDetails/WorkflowSettingsDetails';
import AdmininstrationWorkflowTemplate from './administration-workflow-settings-template/AdministrationWorkflowTemplate';
import DashboardReport from './DashboardReport';
import DocumentManagement from './documentManagement/DocumentManagement';
import DocumentManagementPreview from './documentManagement/DocumentManagementPreview';
import Home from './home/Home';
import NotFound from './NotFound';
import DetailProject from './projectManagement/detailProject/DetailProject';
import CreateProject from './projectManagement/createProject/CreateProject';
import CalendarEvent from './projectManagement/CalendarEvent';
import AllProjects from './projectManagement/AllProjects';
import useMenuHelper from './useMenuHelper';
import { Menu, Popover } from '../components';
import { useAuth, useLoadData } from '../hooks';
import useAccountApi from '../hooks/api/account';
import useHomeApi from '../hooks/api/home';
import * as appAction from '../stores/actions/appAction';
import './MasterPage.scss';
import NoRolesPage from './NoRolesPage';

const MasterPage = () => {
  const navigate = useNavigate();

  const { user, signOut } = useAuth();

  const { getUserData } = useAccountApi();

  const { getAboutUrls } = useHomeApi();

  const [userData, userDataIsLoading] = useLoadData({
    getDataFunc: getUserData,
    dataKey: 'data',
    reduxAction: appAction.setUserData,
  });

  const [aboutUrlsData] = useLoadData({
    getDataFunc: getAboutUrls,
    dataKey: 'data',
  });

  const { mainRole } = useRoleHelper();

  const { menu, isPageAllowed, selectedMenuKeys, setSelectedMenuKeys } = useMenuHelper();

  useEffect(() => {
    if (!user) {
      return;
    }

    const pathName = window.location.pathname;
    const pathNames = pathName.split('/');

    const route = pathNames[pathNames.length - 1];

    setSelectedMenuKeys([route || 'home']);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const pathName = window.location.pathname;

    if (
      !userData ||
      isPageAllowed(pathName, userData?.menu) ||
      pathName === `${process.env.PUBLIC_URL}/not-found`
    ) {
      return;
    }

    if (pathName === `${process.env.PUBLIC_URL}/no-access`) {
      return;
    }

    navigate('not-found');
  }, [isPageAllowed, navigate, selectedMenuKeys, userData]);

  useEffect(() => {
    if (!userData) return;
    const { roles } = userData;
    if (!roles.length) {
      navigate('/no-access');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  const getInitial = () => {
    if (!userData?.name) {
      return '';
    }

    const names = userData.name.split(' ');
    const name1 = names[0] ? names[0][0] : '';
    const name2 = names[1] ? names[1][0] : '';

    return `${name1}${name2}`;
  };

  const onMenuSelect = (e) => {
    if (e.key === 'technical-document-standards') {
      const documentUrl = aboutUrlsData?.TechnicalStandard;

      if (!documentUrl) {
        return;
      }

      window.open(documentUrl);

      return;
    }

    const { keyPath } = e;
    const newSelectedKeys = [keyPath[0]];

    setSelectedMenuKeys(newSelectedKeys);

    if (!newSelectedKeys.length) {
      navigate('/home');

      return;
    }

    const newRoute = `/${keyPath.reverse().join('/')}`;

    if (e.key === 'home' && e.key === selectedMenuKeys[0]) {
      window.location.reload();

      return;
    }

    navigate(newRoute);
  };

  if (!user || userDataIsLoading || !userData) {
    return (
      <div className="master-page">
        <div className="loading">
          <Icon name="loader" type={Icon.Type.SOLID} size={100} spin />
        </div>
      </div>
    );
  }

  return (
    <div className="master-page">
      <div className="header">
        <div className="logo">&nbsp;</div>
        <div className="title">
          <b>IDAMS</b>
          <span>&nbsp;- Integrated Development Assurance and Monitoring System</span>
        </div>
        <div className="title-curl-container">
          <div className="title-curl">&nbsp;</div>
        </div>
        <div className="user-info-container">
          <div className="user-info">
            <div className="user-info-name">{userData.name}</div>
            <Popover content={<UserInfoPopoverContent />}>
              <div className="user-info-role">{`${userData.empId} - ${mainRole}`}</div>
            </Popover>
          </div>
          <div className="avatar">{getInitial()}</div>
          <Popover
            content={(
              <div
                style={{ whiteSpace: 'nowrap', cursor: 'pointer' }}
                role="button"
                tabIndex={-1}
                onClick={() => {
                  signOut();
                }}
                onKeyDown={() => {}}
              >
                Sign Out
              </div>
            )}
          >
            <div className="signout">
              <Icon name="angle-down" />
            </div>
          </Popover>
        </div>
        <div className="menu">
          <Menu
            items={menu}
            selectedKeys={selectedMenuKeys}
            onSelect={onMenuSelect}
          />
        </div>
        <div className="menu-curl-container">
          <div className="menu-curl-green">&nbsp;</div>
          <div className="menu-curl-red">&nbsp;</div>
        </div>
      </div>
      <div className="content" id="master-page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="project-management/detail-project" element={<DetailProject />} />
          <Route path="project-management/create-project" element={<CreateProject />} />
          <Route path="project-management/all-projects" element={<AllProjects />} />
          <Route path="project-management/calendar-event" element={<CalendarEvent />} />
          <Route path="document-management/project-document" element={<DocumentManagement />} />
          <Route path="document-management/preview" element={<DocumentManagementPreview />} />
          <Route path="dashboard-report" element={<DashboardReport />} />
          <Route
            path="administration/workflow-settings"
            element={<AdmininstrationWorkflowSettings />}
          />
          <Route
            path="administration/workflow-settings/details"
            element={<AdministrationWorkflowSettingsDetails />}
          />
          <Route path="administration/workflow-settings/details/template" element={<AdmininstrationWorkflowTemplate />} />
          <Route path="no-access" element={<NoRolesPage signOut={signOut} />} />
          <Route path="not-found" element={<NotFound />} />
        </Routes>
      </div>
      <div className="footer">
        <div className="footer-curl-container">
          <div className="footer-curl">
            &nbsp;
          </div>
        </div>
        <div className="footer-content">
          Copyright © 2022&nbsp;
          <b>PT. Pertamina Hulu Energi</b>
          &nbsp;All Rights Reserved.
        </div>
      </div>
    </div>
  );
};

export default MasterPage;
