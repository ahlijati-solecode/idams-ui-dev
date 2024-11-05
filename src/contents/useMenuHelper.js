import { useSelector, useDispatch } from 'react-redux';
import * as appAction from '../stores/actions/appAction';

const MENU_MAPPING = {
  WorkflowSettings: 'Project Workflow Setting',
  AllProjects: 'Project List',
  OutstandingTaskList: 'Outstanding Task List',
  CalendarEvent: 'Calender Event',
  DocumentManagement: 'Document Management',
  DashboardReport: 'Dashboard Report',
  DashboardStage: 'Dashboard Stage',
};

const ROUTE_MAPPING = {
  '': '$$$$$',
  '/': '$$$$$',
  '/home': '$$$$$',
  '/project-management/detail-project': '$$$$$',
  '/project-management/create-project': '$$$$$',
  '/project-management/calendar-event': '$$$$$',
  '/project-management/all-projects': 'Project List',
  '/document-management/technical-document-standards': 'Document Management',
  '/document-management/project-document': 'Document Management',
  '/document-management/preview': 'Document Management',
  '/dashboard-report': 'Dashboard Report',
  '/administration/workflow-settings': 'Project Workflow Setting',
  '/administration/workflow-settings/details/template': '$$$$$',
  '/administration/workflow-settings/details': '$$$$$',
};

const useMenuHelper = () => {
  const dispatch = useDispatch();

  const { userData, selectedMenuKeys } = useSelector((state) => state.appReducer);

  const setSelectedMenuKeys = (e) => {
    dispatch(appAction.setSelectedMenuKeys(e));
  };

  const isVisible = (menuName) => userData && userData.menu && !!userData.menu.find((e) => e.name === menuName);

  const getMenuData = (menuName) => isVisible(menuName) ? userData.menu.find((e) => e.name === menuName) : null;

  const isCreateProjectAllowed = () => {
    const allProjectsMenuData = getMenuData(MENU_MAPPING.AllProjects);

    return allProjectsMenuData ? allProjectsMenuData.create : false;
  };

  const isEditProjectAllowed = () => {
    const allProjectsMenuData = getMenuData(MENU_MAPPING.AllProjects);

    return allProjectsMenuData ? allProjectsMenuData.editable : false;
  };

  const isOpenDraftProjectAllowed = () => {
    const allProjectsMenuData = getMenuData(MENU_MAPPING.AllProjects);

    return allProjectsMenuData ? allProjectsMenuData.create || allProjectsMenuData.draft : false;
  };

  const isPageAllowed = (routeParam, userDataMenu) => {
    const reg = new RegExp(process.env.PUBLIC_URL, 'ig');
    const route = routeParam.replace(reg, '');

    if (
      route === '/administration/workflow-settings/details' ||
      route === '/administration/workflow-settings/details/template'
    ) {
      const selectedUserDataMenu =
        userDataMenu
          ? userDataMenu.find((e) => e.name === ROUTE_MAPPING['/administration/workflow-settings'])
          : null;

      if (!selectedUserDataMenu) {
        return false;
      }

      return selectedUserDataMenu.editable;
    }

    if ((
      route === '/project-management/create-project' ||
      route === '/project-management/detail-project'
    )) {
      const allProjectsMenuData =
        userDataMenu
          ? userDataMenu.find((e) => e.name === ROUTE_MAPPING['/project-management/all-projects'])
          : null;

      return allProjectsMenuData;
    }

    if (ROUTE_MAPPING[route] === '$$$$$') {
      return true;
    }

    if (userDataMenu && userDataMenu.find((e) => e.name === ROUTE_MAPPING[route])) {
      return true;
    }

    return false;
  };

  const generateMenu = () => {
    const { menu } = userData;

    if (!menu) {
      return [];
    }

    const allProjectsMenuData = getMenuData(MENU_MAPPING.AllProjects);

    const homeVisible = true;
    const createProjectVisible = allProjectsMenuData ? allProjectsMenuData.create : false;
    const allProjectsVisible = !!allProjectsMenuData;
    const documentManagementVisible = isVisible(MENU_MAPPING.DocumentManagement);
    const dashboardReportVisible = isVisible(MENU_MAPPING.DashboardReport);
    const workflowSettingsVisible = isVisible(MENU_MAPPING.WorkflowSettings);

    const projectManagementVisible = createProjectVisible || allProjectsVisible;
    const administrationVisible = workflowSettingsVisible;

    const mappedMenu = [
      { key: 'home', label: '', icon: 'house-blank', visible: homeVisible },
      {
        key: 'project-management',
        label: 'Project Management',
        visible: projectManagementVisible,
        children: [
          { key: 'create-project', label: 'Create Project', visible: createProjectVisible },
          { key: 'all-projects', label: 'All Projects', visible: allProjectsVisible },
        ],
      },
      {
        key: 'document-management',
        label: 'Document Management',
        visible: documentManagementVisible,
        children: [
          { key: 'technical-document-standards', label: 'Technical Specification Subholding Upstream', visible: documentManagementVisible },
          { key: 'project-document', label: 'Project Document', visible: documentManagementVisible },
        ],
      },
      { key: 'dashboard-report', label: 'Dashboard Report', visible: dashboardReportVisible },
      {
        key: 'administration',
        label: 'Administration',
        visible: administrationVisible,
        children: [
          { key: 'workflow-settings', label: 'Workflow Settings', visible: workflowSettingsVisible },
        ],
      },
    ];

    return mappedMenu;
  };

  return {
    menu: generateMenu(),
    isPageAllowed,
    isCreateProjectAllowed,
    isEditProjectAllowed,
    isOpenDraftProjectAllowed,
    selectedMenuKeys,
    setSelectedMenuKeys,
  };
};

export default useMenuHelper;
