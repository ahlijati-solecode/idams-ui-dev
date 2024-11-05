import axiosPrivate from '../../../libs/axiosPrivate';

const useHomeApi = () => {
  const getHierName = async () => axiosPrivate.get('/Home/HierName');
  const getAboutUrls = async () => axiosPrivate.get('/Home/AboutUrls');

  return {
    getHierName,
    getAboutUrls,
  };
};

export default useHomeApi;
