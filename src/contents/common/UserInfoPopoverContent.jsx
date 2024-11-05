import React from 'react';
import useRoleHelper from './useRoleHelper';
import './UserInfoPopoverContent.scss';

const UserInfoPopoverContent = () => {
  const { roleHier, roleList } = useRoleHelper();

  return (
    <div className="user-info-popover-content">
      <div className="title">Role Information</div>
      <div>{roleHier}</div>
      {roleList}
    </div>
  );
};

export default UserInfoPopoverContent;
