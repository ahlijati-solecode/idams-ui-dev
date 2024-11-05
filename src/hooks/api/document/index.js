import axiosPrivate from '../../../libs/axiosPrivate';

const useDocumentApi = () => {
  const getProjectDetails = async ({ projectId, projectVersion }) => axiosPrivate.get(`/project/detail?projectId=${projectId}&projectVersion=${projectVersion}`);
  const getDocumentDetails = async ({ projectActionId }) => axiosPrivate.get(`/Document/ProjectAction?projectActionId=${projectActionId}`);
  const deleteDocument = async ({ transactionDocId }) => axiosPrivate.delete(`/Document/Delete?transactionDocId=${transactionDocId}`);
  const downloadDocument = async ({ transactionDocId }) => axiosPrivate.get(`/Document/Download?transactionDocId=${transactionDocId}`, { responseType: 'blob' });
  const renameDocument = async ({ transactionDocId, newName }) => axiosPrivate.put(`/Document/Rename?transactionDocId=${transactionDocId}&newName=${newName}`);
  const uploadRequiredDocument = async ({ projectActionId, docDescriptionId, file }) => {
    const formData = new FormData();

    formData.append('projectActionId', projectActionId);
    formData.append('docDescriptionId', docDescriptionId);
    formData.append('file', file);

    const response = await axiosPrivate.post('/Document/UploadRequiredDoc', formData);

    return response;
  };
  const uploadSupportingDocument = async ({ projectActionId, file }) => {
    const formData = new FormData();

    formData.append('projectActionId', projectActionId);
    formData.append('file', file);

    const response = await axiosPrivate.post('/Document/UploadSupportingDoc', formData);

    return response;
  };

  const getDocumentTypeList = async () => axiosPrivate.get('/document/dropdown');
  const getDocumentList = async (payload) => axiosPrivate.post('/document/list', payload);
  const getDocumentListByProject = async (id, payload) => axiosPrivate.post(`/document/listbyproject?projectId=${id}`, payload);
  const dlDocument = async (payload) => axiosPrivate.post('/document/download', payload, { responseType: 'blob' });
  const getHistoryDocument = async (id) => axiosPrivate.get(`/document/history?transactionDocId=${id}`);

  return {
    getProjectDetails,
    getDocumentDetails,
    deleteDocument,
    downloadDocument,
    renameDocument,
    uploadRequiredDocument,
    uploadSupportingDocument,
    getDocumentTypeList,
    getDocumentList,
    getDocumentListByProject,
    dlDocument,
    getHistoryDocument,
  };
};

export default useDocumentApi;
