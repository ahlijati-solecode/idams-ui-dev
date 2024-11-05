import React from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@solecode/sole-ui';

const useRoleHelper = () => {
  const { userData } = useSelector((state) => state.appReducer);

  const getMainRole = () => {
    const { roles } = userData;

    return roles?.[0]?.value;
  };

  const getRoleHier = () => {
    const hier1 = userData?.hierLvl2?.value;
    const hier2 = userData?.hierLvl3?.value;

    const hiers = [];

    if (hier1) {
      hiers.push(hier1);
    }

    if (hier2) {
      hiers.push(hier2);
    }

    if (!hiers.length) {
      const { roles } = userData;

      if (!roles) {
        return '-';
      }

      const roleKey = roles?.[0]?.key;

      return roleKey === 'ADMIN_SHU' ? 'SHU' : '-';
    }

    return hiers.join(' - ');
  };

  const getRoleList = () => {
    const { roles } = userData;

    if (!roles?.length) {
      return <></>;
    }

    return roles.map((e) => (
      <div
        key={`role-item-${e.value}`}
        className="role-item"
      >
        <Icon
          name="user"
          size={10}
        />
        {e.value}
      </div>
    ));
  };

  const getUserRoles = () => {
    const { roles } = userData;

    if (!roles?.length) {
      return [];
    }

    return roles;
  };

  const isSuperAdmin = () => getMainRole() === 'Super Admin';

  return {
    mainRole: getMainRole(),
    roleHier: getRoleHier(),
    roleList: getRoleList(),
    userRoles: getUserRoles(),
    isSuperAdmin: isSuperAdmin(),
  };
};

export default useRoleHelper;
