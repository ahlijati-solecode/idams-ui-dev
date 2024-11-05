import { SET_USER_DATA, SET_SELECTED_MENU_KEYS } from '../actionType';

const initialState = {
  userData: {},
  selectedMenuKeys: ['home'],
};

const appStore = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_DATA:
      return {
        ...state,
        userData: action.data,
      };
    case SET_SELECTED_MENU_KEYS:
      return {
        ...state,
        selectedMenuKeys: action.data,
      };
    default:
      return state;
  }
};

export default appStore;
