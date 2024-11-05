import axiosPrivate from '../../../libs/axiosPrivate';

const useAccountApi = () => {
  const getCurrentUser = async () => axiosPrivate.get('/Account/CurrentUser');

  const getUserData = async () => axiosPrivate.get('/Account/UserData');

  const getUserMenu = async () => axiosPrivate.get('/Account/UserMenu');

  return {
    getCurrentUser,
    getUserData,
    getUserMenu,
  };
};

export default useAccountApi;
