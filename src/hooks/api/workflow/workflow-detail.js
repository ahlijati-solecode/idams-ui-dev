import axiosPrivate from '../../../libs/axiosPrivate';

const useWorkflowDetailApi = () => {
  const generateGetListQuery = (params) => {
    const queries =
      Object.keys(params)
        .filter((e) => params[e])
        .map((e) => ({ key: e, value: params[e] }));

    return queries.length === 0 ? '' : `?${queries.map((e) => `${e.key}=${e.value}`).join('&')}`;
  };

  const getWorkflowTypes = async (params) => axiosPrivate.get(`/WorkflowSetting/workflowtype?stage=${params}`).then((res) => res.data);

  const getWorkflowSequence = async (params) => axiosPrivate.get(`/WorkflowSetting/workflowSequence?workflowSequenceId=${params}`).then((res) => res.data);

  const getSequenceDocumentList = async (params) => axiosPrivate.get(`/WorkflowSetting/sequenceDocumentChecklist${generateGetListQuery(params)}`).then((res) => res.data);

  const getMasterDocuments = async (params) => axiosPrivate.get(`/DocumentSetting/documents${generateGetListQuery(params)}`).then((res) => res.data);

  const postWorkflowSequence = async (data) => axiosPrivate.post('/WorkflowSetting/saveWorkflowSequence', data);

  const postSequenceDocumentlist = async (data) => axiosPrivate.post('/WorkflowSetting/saveDocumentChecklist', data);

  const deleteDocumentChecklist = async (data) => axiosPrivate.post('/WorkflowSetting/deleteDocumentChecklist', data);

  const getGenerateWorkflowTemplate = async (params) => axiosPrivate.get(`/WorkflowSetting/generateShadowTemplate${generateGetListQuery(params)}`).then((res) => res.data);

  return {
    getWorkflowTypes,
    getWorkflowSequence,
    getSequenceDocumentList,
    postWorkflowSequence,
    getMasterDocuments,
    postSequenceDocumentlist,
    deleteDocumentChecklist,
    getGenerateWorkflowTemplate,
  };
};

export default useWorkflowDetailApi;
