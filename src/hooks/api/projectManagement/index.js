import axiosPrivate from '../../../libs/axiosPrivate';

const useProjectManagementApi = () => {
  const generateGetListQuery = (params) => {
    const queries =
      Object.keys(params)
        .filter((e) => params[e] !== null)
        .map((e) => ({ key: e, value: params[e] }));

    return queries.length === 0 ? '' : `?${queries.map((e) => `${e.key}=${e.value}`).join('&')}`;
  };

  const getBanner = async () => axiosPrivate.get('/Project/Banner');
  const getDropdown = async () => axiosPrivate.get('/Project/Dropdown');
  const getList = async (params) => axiosPrivate.get(`/Project/List${generateGetListQuery(params)}`);
  const getTableSetting = async () => axiosPrivate.get('/Project/TableSetting');
  const saveTableSetting = async (setting) => axiosPrivate.post('/Project/TableSetting', { setting });
  const deleteProject = async (id, version) => axiosPrivate.delete(`/Project/Delete?projectId=${id}&projectVersion=${version}`);
  const deleteMultipleProject = async (projects) => axiosPrivate.post('/Project/Delete', projects);

  const getProjectDetail = (id, version) => axiosPrivate.get(`/project/detail?projectId=${id}&projectVersion=${version}`);
  const getLatestVersion = (id) => axiosPrivate.get(`/project/latestVersion?projectId=${id}`);
  const getLatestApproval = (id) => axiosPrivate.get(`/project/lastapproval?projectId=${id}`);

  const getHierLvl2 = () => axiosPrivate.get('/project/availableHierlvl2');
  const getHierLvl2s = (payload) => axiosPrivate.post('/project/availableHierlvl2', payload);
  const getHierLvl3 = (q) => axiosPrivate.get(`/project/availableHierlvl3?hierlvl2=${q}`);
  const getHierLvl3s = (payload) => axiosPrivate.post('/project/availableHierlvl3', payload);
  const getHierLvl4 = (q) => axiosPrivate.get(`/project/availableHierlvl4?hierlvl3=${q}`);
  const getAvailableStage = (payload) => axiosPrivate.post('/project/availableStage', payload);
  const getAvailableWorkflowType = (payload) => axiosPrivate.post('/project/availableWorkflowType', payload);
  const getDetermineTemplate = (category, criteria, subCriteria, threshold) => {
    if (['', '-', null, undefined].includes(subCriteria)) {
      return axiosPrivate.get(`/project/determineTemplate?projectCategory=${category}&projectCriteria=${criteria}&threshold=${threshold}`);
    }

    return axiosPrivate.get(`/project/determineTemplate?projectCategory=${category}&projectCriteria=${criteria}&projectSubCriteria=${subCriteria}&threshold=${threshold}`);
  };
  const addNewProject = (payload) => axiosPrivate.post('/project/add', payload);
  const updateProjectInformation = (payload) => axiosPrivate.post('/project/updateProjectInformation', payload);

  // lock template
  const lockTemplate = (id, ver) => axiosPrivate.post(`/project/lockTemplate?projectId=${id}&projectVersion=${ver}`);

  // scope of work
  const getScopeOfWorkDropdownList = async () => axiosPrivate.get('/project/dropdownScopeOfWork').then((res) => res.data);
  // const updateScopeOfWork = async (data) => axiosPrivate.post('/project/updateScopeOfWork', data).then((res) => res.data);
  const updateScopeOfWork = async (data) => axiosPrivate.post('/project/updateScopeOfWork', data);
  const getScopeOfWork = async (id, version) => axiosPrivate.get(`/project/scopeOfWork?projectId=${id}&projectVersion=${version}`).then((res) => res.data);

  // resources
  // const updateResources = async (data) => axiosPrivate.post('/project/updateResources', data).then((res) => res.data);
  const updateResources = async (data) => axiosPrivate.post('/project/updateResources', data);

  // economic indicator form
  // const updateEconomicIndicator = async (data) => axiosPrivate.post('/project/updateEconomicIndicator', data).then((res) => res.data);
  const updateEconomicIndicator = async (data) => axiosPrivate.post('/project/updateEconomicIndicator', data);

  // document
  const updateInitiationDocs = async (data) => axiosPrivate.post('/project/updateInitiationDocs', data).then((res) => res.data);

  // milestones
  const getMilestone = async ({ projectId, projectVersion }) => axiosPrivate.get(`/project/milestone?projectId=${projectId}&projectVersion=${projectVersion}`);
  const updateMilestone = async (data) => axiosPrivate.post('/project/updateMilestone', data);

  // detailProject
  const getProjectSequenceList = (id, version) => axiosPrivate.get(`/project/sequences?projectId=${id}&projectVersion=${version}`);
  const getProjectSequenceDetail = (id, seqId) => axiosPrivate.get(`/project/sequenceAction?projectId=${id}&workflowSequenceId=${seqId}`);
  const getApprovalDetail = (id) => axiosPrivate.get(`/project/approval?projectActionId=${id}`);
  const postApproval = (payload) => axiosPrivate.post('/project/approval', payload);
  const getLogHistory = async (params) => axiosPrivate.get(`/project/history${generateGetListQuery(params)}`).then((res) => res.data);

  // detailProject - confirmation
  const getProjectConfirmation = async (params) => axiosPrivate.get(`/project/confirmation${generateGetListQuery(params)}`).then((res) => res.data);
  const updateProjectConfirmation = async (data) => axiosPrivate.post('/project/confirmation', data).then((res) => res.data);

  // detailProject - comments
  const getProjectComments = async (projectId) => axiosPrivate.get(`/project/getCommentList?projectId=${projectId}`).then((res) => res.data);
  const postProjectComment = async (projectId, data) => axiosPrivate.post(`/project/addComment?projectId=${projectId}`, data).then((res) => res.data);
  const deleteProjectComment = async (params) => axiosPrivate.delete(`/project/deleteComment${generateGetListQuery(params)}`).then((res) => res.data);

  // initiate
  const initiateProject = async ({ projectId, projectVersion }) => axiosPrivate.post(`/project/initiate?projectId=${projectId}&projectVersion=${projectVersion}`);

  // meeting
  const getMeetingList = async (projectActionId) => axiosPrivate.get(`/project/meeting?projectActionId=${projectActionId}`);
  const getMeetingDetail = async (projectActionId, meetingId) => axiosPrivate.get(`/project/meetingDetail?projectActionId=${projectActionId}&meetingId=${meetingId}`);
  const getParticipantDetail = async (email) => axiosPrivate.get(`/project/participant?email=${email}`);
  const addNewMeeting = async (data) => axiosPrivate.post('/project/addMeeting', data).then((res) => res.data);
  const updateMeeting = async (data) => axiosPrivate.put('/project/updateMeeting', data).then((res) => res.data);
  const deleteMeeting = async (projectActionId, meetingId) => axiosPrivate.delete(`/project/deleteMeeting?projectActionId=${projectActionId}&meetingId=${meetingId}`);
  const completeAllMeeting = async (projectActionId) => axiosPrivate.post(`/project/completeAllMeeting?projectActionId=${projectActionId}`).then((res) => res.data);

  const completeUpload = async ({ projectActionId }) => axiosPrivate.post(`/project/completeUpload?projectActionId=${projectActionId}`);

  const getUpcomingMeetings = async ({ projectId }) => axiosPrivate.get(`/project/upcomingMeetings?projectId=${projectId}`);

  // calendar event
  const getCalendarFilter = async () => axiosPrivate.get('/calendar/dropdown');

  const getCalendarEvents = async (startDate, endDate, threshold, projectId) => axiosPrivate.get(`/calendar/meeting?startDate=${startDate}&endDate=${endDate}&threshold=${threshold}&projectId=${projectId}
  `);

  // dashboard report
  const getDashboardReport = async (regionalFilter, rkapFilter, thresholdFilter) => axiosPrivate.get(`/dashboard/data?regionalFilter=${regionalFilter}&rkapFilter=${rkapFilter}&thresholdFilter=${thresholdFilter}`);

  // generate FID
  const generateFid = async (payload) => axiosPrivate.post('/project/generateFid', payload);
  const inputFid = async (payload) => axiosPrivate.post('/project/inputFid', payload);

  return {
    getBanner,
    getDropdown,
    getList,
    getTableSetting,
    saveTableSetting,
    deleteProject,
    deleteMultipleProject,
    getProjectDetail,
    getLatestVersion,
    getHierLvl2,
    getHierLvl2s,
    getHierLvl3,
    getHierLvl3s,
    getHierLvl4,
    getAvailableWorkflowType,
    getAvailableStage,
    getDetermineTemplate,
    addNewProject,
    updateProjectInformation,
    lockTemplate,
    getScopeOfWorkDropdownList,
    updateScopeOfWork,
    getScopeOfWork,
    updateResources,
    updateEconomicIndicator,
    updateInitiationDocs,
    getMilestone,
    updateMilestone,
    getProjectSequenceList,
    getProjectSequenceDetail,
    getLatestApproval,
    getApprovalDetail,
    postApproval,
    getLogHistory,
    getProjectConfirmation,
    updateProjectConfirmation,
    getProjectComments,
    postProjectComment,
    deleteProjectComment,
    initiateProject,
    getMeetingList,
    getMeetingDetail,
    getParticipantDetail,
    addNewMeeting,
    updateMeeting,
    deleteMeeting,
    completeAllMeeting,
    completeUpload,
    getUpcomingMeetings,
    getCalendarEvents,
    getCalendarFilter,
    getDashboardReport,
    generateFid,
    inputFid,
  };
};

export default useProjectManagementApi;
