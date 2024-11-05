import axios from 'axios';
import { getAccessTokenKey, removeAccessTokenKey } from './apiTokenHelper';
import { API_KEY_HEADER } from '../constants/auth';
import { SERVICE_URL, CHALLENGE_URL } from '../constants/serviceUrl';

const axiosPrivate = axios.create({
  baseURL: SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosPrivate.interceptors.request.use(
  (config) => {
    config.headers.common[API_KEY_HEADER] = getAccessTokenKey();

    return config;
  },
  (error) => Promise.reject(error),
);

axiosPrivate.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      removeAccessTokenKey();
      window.location = `${CHALLENGE_URL}/?returnUrl=${encodeURIComponent(window.location.href)}`;
    }

    return error;
  },
);

export default axiosPrivate;
