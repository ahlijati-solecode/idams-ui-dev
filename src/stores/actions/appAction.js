import { SET_USER_DATA, SET_SELECTED_MENU_KEYS } from '../actionType';

export const setUserData = (data) => ({
  type: SET_USER_DATA,
  data,
});

export const setSelectedMenuKeys = (data) => ({
  type: SET_SELECTED_MENU_KEYS,
  data,
});

export default setUserData;
