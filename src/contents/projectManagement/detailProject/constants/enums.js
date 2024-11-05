export const TABS_ITEM = [
  {
    key: 'projectInformation',
    title: 'Project Information',
  },
  {
    key: 'projectWorkflow',
    title: 'Project Workflow',
  },
  {
    key: 'projectDocument',
    title: 'Project Document',
  },
  {
    key: 'logHistory',
    title: 'Log History',
  },
];

export const DEFAULT_LOG_HISTORY_FILTER_OPTIONS = [
  { label: 'User', value: 'empName' },
  { label: 'Workflow', value: 'workflowName' },
  { label: 'Action', value: 'action' },
  { label: 'Activity Description', value: 'activityDescription' },
  { label: 'Last Status', value: 'lastStatus' },
];

export const DEFAULT_PROJECT_MILESTONE_FILTER_LIST = [
  { label: 'All Stage', value: 'All Stage' },
  { label: 'Inisiasi', value: 'Inisiasi' },
  { label: 'Seleksi', value: 'Seleksi' },
  { label: 'Kajian Lanjut', value: 'Kajian Lanjut' },
];

export const DEFAULT_MODAL_MILESTONE_VIEW_MODE_OPTIONS = [
  { label: 'Day', value: 'Day' },
  { label: 'Week', value: 'Week' },
  { label: 'Month', value: 'Month' },
];
