/* eslint react/prop-types: 0 */
import KEY_NAME from './keyName';
import KEY_NAME_PROJECT from '../../projectManagement/createProject/constants/keyName';

export const TabItem = {
  PROJECTS: 'projects',
  FILES: 'files',
};

export const cascadeFilterKey = {
  Zona: 'Regional',
  Regional: 'Zona',
  'Workflow Type': 'Stage',
  Stage: 'Workflow Type',
};

export const IconSet = {
  XLS: 'file-excel',
  WORD: 'file-word',
  PDF: 'file-pdf',
  PPT: 'file-powerpoint',
  JPG: 'file-image',
};

export const filterColByProject = [
  {
    key: KEY_NAME.FILE_NAME,
    value: 'File Name',
  },
  {
    key: KEY_NAME.DOC_CATEGORY,
    value: 'Doc. Category',
  },
  {
    key: KEY_NAME.FILE_SIZE,
    value: 'File Size',
  },
  {
    key: KEY_NAME.UPLOAD_BY,
    value: 'Uploaded By',
  },
];

export const sourceParent = {
  FILES: 'document-management-files',
  PROJECTS: 'document-management-projects',
  DETAILS: 'project-details',
};

export const filterColProject = [
  {
    key: KEY_NAME_PROJECT.PROJECT_NAME,
    value: 'Project Name',
  },
  {
    key: KEY_NAME_PROJECT.STATUS,
    value: 'Status',
  },
  {
    key: KEY_NAME_PROJECT.ZONA,
    value: 'Zona',
  },
  {
    key: KEY_NAME_PROJECT.RKAP,
    value: 'RKAP',
  },
  {
    key: 'subCriteria',
    value: 'Project Sub-criteria',
  },
  {
    key: 'workflowType',
    value: 'Workflow Type',
  },
];

export const filterCol = [
  {
    key: KEY_NAME.FILE_NAME,
    value: 'File Name',
  },
  {
    key: KEY_NAME.DOC_CATEGORY,
    value: 'Doc. Category',
  },
  {
    key: KEY_NAME.PROJECT_NAME,
    value: 'Project',
  },
  {
    key: KEY_NAME.RKAP,
    value: 'RKAP',
  },
  {
    key: KEY_NAME.FILE_SIZE,
    value: 'File Size',
  },
  {
    key: KEY_NAME.UPLOAD_BY,
    value: 'Uploaded By',
  },
];

export const Header = [
  {
    Header: 'File Name',
    accessor: KEY_NAME.FILE_NAME,
    editable: false,
    headerStyle: {
      maxWidth: '13%',
      minWidth: '13%',
      width: '13%',
    },
  },
  {
    Header: 'Doc. Type',
    accessor: KEY_NAME.DOC_TYPE,
    editable: false,
    headerStyle: {
      maxWidth: '13%',
      minWidth: '13%',
      width: '13%',
    },
  },
  {
    Header: 'Doc. Category',
    accessor: KEY_NAME.DOC_CATEGORY,
    editable: false,
    headerStyle: {
      maxWidth: '13%',
      minWidth: '13%',
      width: '13%',
    },
  },
  {
    Header: 'Project',
    accessor: KEY_NAME.PROJECT_NAME,
    editable: false,
    headerStyle: {
      maxWidth: '13%',
      minWidth: '13%',
      width: '13%',
    },
  },
  {
    Header: 'Regional',
    accessor: KEY_NAME.REGIONAL,
    editable: false,
    headerStyle: {
      maxWidth: '13%',
      minWidth: '13%',
      width: '13%',
    },
  },
  {
    Header: 'Zona',
    accessor: KEY_NAME.ZONA,
    editable: false,
    headerStyle: {
      maxWidth: '13%',
      minWidth: '13%',
      width: '13%',
    },
  },
  {
    Header: 'Threshold',
    accessor: KEY_NAME.THRESHOLD,
    editable: false,
    headerStyle: {
      maxWidth: '13%',
      minWidth: '13%',
      width: '13%',
    },
  },
  {
    Header: 'RKAP',
    accessor: KEY_NAME.RKAP,
    editable: false,
    headerStyle: {
      maxWidth: '13%',
      minWidth: '13%',
      width: '13%',
    },
  },
  {
    Header: 'Stage',
    accessor: KEY_NAME.STAGE,
    editable: false,
    headerStyle: {
      maxWidth: '13%',
      minWidth: '13%',
      width: '13%',
    },
  },
  {
    Header: 'Workflow Type',
    accessor: KEY_NAME.WORKFLOW_TYPE,
    editable: false,
    headerStyle: {
      maxWidth: '13%',
      minWidth: '13%',
      width: '13%',
    },
  },
  {
    Header: 'Size',
    accessor: KEY_NAME.FILE_SIZE,
    editable: false,
    headerStyle: {
      maxWidth: '13%',
      minWidth: '13%',
      width: '13%',
    },
  },
  {
    Header: 'Uploaded By',
    accessor: KEY_NAME.UPLOAD_BY,
    editable: false,
    headerStyle: {
      maxWidth: '13%',
      minWidth: '13%',
      width: '13%',
    },
  },
  {
    Header: 'Date Modified',
    accessor: KEY_NAME.DATE_MODIFIED,
    editable: false,
    headerStyle: {
      maxWidth: '13%',
      minWidth: '13%',
      width: '13%',
    },
  },
];

const tempHeaderProject = [...Header];
tempHeaderProject.splice(3, 5);
export const HeaderProject = tempHeaderProject;
