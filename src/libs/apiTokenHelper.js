import { ACCESS_TOKEN_KEY } from '../constants/auth';

export const getAccessTokenKey = () => window.localStorage.getItem(ACCESS_TOKEN_KEY);

export const setAccessTokenKey = (data) => {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, data);
};

export const removeAccessTokenKey = () => {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
};
