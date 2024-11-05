import axiosPrivate from '../../../libs/axiosPrivate';

const useUpdateProjectDataApi = () => {
  const getFollowUpDropdown = async () => axiosPrivate.get('/Project/FollowUpDropdown');
  const getUpdateProjectDataDetails = async ({ projectActionId }) => axiosPrivate.get(`/Project/UpdateData?projectActionId=${projectActionId}`);
  const getFollowUpList = async ({ projectActionId }) => axiosPrivate.get(`/Project/followup?projectActionId=${projectActionId}`);
  const updateFollowUp = async (data) => axiosPrivate.post('/Project/UpdateFollowUp', data);
  const deleteFollowUp = async ({ followUpId, projectActionId }) => axiosPrivate.delete(`/Project/followup?followupid=${followUpId}&projectActionId=${projectActionId}`);
  const completeUpdateProjectData = async ({ projectActionId, complete }) => axiosPrivate.post(`/Project/UpdateData?projectActionId=${projectActionId}&complete=${complete}`);
  const downloadFollowUpTemplate = () => axiosPrivate.get('/project/templateFollowUp', { responseType: 'blob' });
  const uploadFollowUp = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return axiosPrivate.post('/project/uploadFollowUp', formData);
  };
  const addNewFollowUp = async (payload) => axiosPrivate.post('/project/followup', payload);

  return {
    getFollowUpDropdown,
    getUpdateProjectDataDetails,
    getFollowUpList,
    updateFollowUp,
    deleteFollowUp,
    completeUpdateProjectData,
    downloadFollowUpTemplate,
    uploadFollowUp,
    addNewFollowUp,
  };
};

export default useUpdateProjectDataApi;
