import axiosPrivate from '../../../libs/axiosPrivate';

const useWorkflowSettingsDetailApi = () => {
  const generateGetListQuery = (params) => {
    const queries =
      Object.keys(params)
        .filter((e) => params[e])
        .map((e) => ({ key: e, value: params[e] }));

    return queries.length === 0 ? '' : `?${queries.map((e) => `${e.key}=${e.value}`).join('&')}`;
  };

  const getDropdownList = async () => axiosPrivate.get('/WorkflowSetting/DropDownList').then((res) => res.data);

  const postWorkflowSettingSave = async (data) => axiosPrivate.post('/WorkflowSetting/save', data);

  const getWorkflowSettingDetail = async (templateId, templateVersion) => axiosPrivate.get(`/WorkflowSetting/workflowSetting?templateId=${templateId}&templateVersion=${templateVersion}`).then((res) => res.data);

  const postWorkflowSettingSequenceDelete = async (workflowSequenceId) => axiosPrivate.delete(`/WorkflowSetting/workflowSequence?workflowSequenceId=${workflowSequenceId}`).then((res) => res.data);

  const postWorkflowSettingSaveAllChanges = async (params) => axiosPrivate.get(`/WorkflowSetting/saveAllChanges${generateGetListQuery(params)}`).then((res) => res.data);

  return {
    getDropdownList,
    postWorkflowSettingSave,
    getWorkflowSettingDetail,
    postWorkflowSettingSequenceDelete,
    postWorkflowSettingSaveAllChanges,
  };
};

export default useWorkflowSettingsDetailApi;
