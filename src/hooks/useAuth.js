import React, { useState, useContext, createContext } from 'react';
import useAccountApi from './api/account';
import { SIGN_OUT_URL } from '../constants/serviceUrl';
import { getAccessTokenKey, removeAccessTokenKey } from '../libs/apiTokenHelper';

const AuthContext = createContext();

const useProvideAuth = () => {
  const { getCurrentUser } = useAccountApi();

  const [user, setUser] = useState(false);

  const fetchUser = async () => {
    const isAuthenticated = !!getAccessTokenKey();

    if (!isAuthenticated) {
      return;
    }

    const response = await getCurrentUser();

    setUser(response.data.data);
  };

  const signOut = async () => {
    removeAccessTokenKey();

    window.location = `${SIGN_OUT_URL}?returnUrl=${encodeURIComponent(window.location.href)}`;
  };

  return {
    user,
    fetchUser,
    signOut,
  };
};

// eslint-disable-next-line react/prop-types
export const ProvideAuth = ({ children }) => {
  const auth = useProvideAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
