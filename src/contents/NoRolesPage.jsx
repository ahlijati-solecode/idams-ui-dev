import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from '@solecode/sole-ui';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './NoRolesPage.scss';

const NoRolesPage = ({ signOut }) => {
  const { userData } = useSelector((x) => x.appReducer);
  const navigate = useNavigate();

  useEffect(() => {
    const { roles } = userData;

    if (roles.length) {
      navigate('/home');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  return (
    <div className="no-roles-page">
      <h2>Anda tidak memiliki akses ke aplikasi ini. Silahkan hubungi Admin untuk menambahkan akun Anda!</h2>
      <Button
        label="Sign Out"
        role="button"
        tabIndex={-1}
        onClick={signOut}
        primaryIcon={<Icon name="power-off" type="solid" />}
      />
    </div>
  );
};

NoRolesPage.propTypes = {
  signOut: PropTypes.func.isRequired,
};

export default NoRolesPage;
