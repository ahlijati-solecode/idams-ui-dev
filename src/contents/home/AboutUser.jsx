import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Modal } from 'antd';
import PropTypes from 'prop-types';
import { Button, Icon } from '@solecode/sole-ui';
import { UserInfoPopoverContent, useRoleHelper } from '../common';
import { Popover } from '../../components';
import { useLoadData } from '../../hooks';
import useHomeApi from '../../hooks/api/home';
import useOutstandingTaskList from '../../hooks/api/outstandingTaskList';
import './AboutUser.scss';

const DownloadCard = ({
  line1,
  line2,
  imageSrc,
  fileSrc,
}) => (
  <div
    style={{
      backgroundImage: `url(${imageSrc})`,
    }}
    role="button"
    tabIndex={-1}
    onClick={() => {
      if (!fileSrc) {
        return;
      }

      window.open(fileSrc);
    }}
    onKeyDown={() => {}}
  >
    <div>{line1}</div>
    <div>{line2}</div>
    <div>
      <Icon name="up-right-from-square" />
    </div>
  </div>
);

DownloadCard.propTypes = {
  line1: PropTypes.string.isRequired,
  line2: PropTypes.string.isRequired,
  imageSrc: PropTypes.string.isRequired,
  fileSrc: PropTypes.string.isRequired,
};

const AboutUser = () => {
  const { userData } = useSelector((state) => state.appReducer);

  const { mainRole, roleHier } = useRoleHelper();

  const { getAboutUrls } = useHomeApi();
  const { getList } = useOutstandingTaskList();

  const getDataParams = {
    page: 1,
    size: 1,
    sort: 'updatedDate desc',
  };

  const [listData] = useLoadData({
    getDataFunc: getList,
    getDataParams,
    dataKey: 'data',
  });

  const [aboutUrlsData] = useLoadData({
    getDataFunc: getAboutUrls,
    dataKey: 'data',
  });

  const [openAboutIdamsModal, setOpenAboutIdamsModal] = useState(false);

  const getOutstandingTaskListCountColor = () => {
    const n = listData?.totalItems ?? 0;

    if (n <= 4) {
      return '#1a79cb';
    }

    if (n > 4 && n <= 9) {
      return '#CCAA31';
    }

    return '#ff4d4f';
  };

  return (
    <div className="about-user">
      <div className="green-accent">&nbsp;</div>
      <div className="batik">&nbsp;</div>
      <div className="about-button">
        <Button
          label="About IDAMS"
          size={Button.Size.SMALL}
          primaryIcon={<Icon name="lightbulb-exclamation" />}
          onClick={() => { setOpenAboutIdamsModal(true); }}
        />
      </div>
      <div className="welcome-back">
        <div>Welcome Back,</div>
        <div>{userData.name}</div>
      </div>
      <div className="cards">
        <div className="card">
          <div className="card-icon blue">
            <Icon name="user-group" size={32} />
          </div>
          <div className="card-1-1">
            {roleHier}
          </div>
          <Popover content={<UserInfoPopoverContent />}>
            <div className="card-1-2">
              {`${userData.empId} - ${mainRole}`}
            </div>
          </Popover>
        </div>
        <div className="card">
          <div className="card-icon red">
            <Icon name="bell" size={32} />
          </div>
          <div className="card-2-1">You have,</div>
          <div className="card-2-2">
            <div
              className="card-2-2-1 large"
              style={{
                color: getOutstandingTaskListCountColor(),
              }}
            >
              {listData?.totalItems ?? 0}
            </div>
            <div className="card-2-2-2">Outstanding Task</div>
          </div>
        </div>
      </div>
      <Modal
        visible={openAboutIdamsModal}
        title="All About IDAMS"
        footer={null}
        width={726}
        onCancel={() => { setOpenAboutIdamsModal(false); }}
      >
        <div className="about-idams">
          <div className="row">
            <DownloadCard
              line1="Introduction"
              line2="IDAMS"
              imageSrc="./images/idams/introduction.png"
              fileSrc={aboutUrlsData?.Introduction}
            />
            <DownloadCard
              line1="User Manual"
              line2="IDAMS"
              imageSrc="./images/idams/user-manual.png"
              fileSrc={aboutUrlsData?.UserManual}
            />
          </div>
          <div className="row">
            <DownloadCard
              line1="Guideline PUDW Pertamina"
              line2="2022"
              imageSrc="./images/idams/guideline.png"
              fileSrc={aboutUrlsData?.GuidelinePUDW}
            />
            <DownloadCard
              line1="Technical Specification Subholding Upstream"
              imageSrc="./images/idams/user-manual-2.png"
              fileSrc={aboutUrlsData?.TechnicalStandard}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AboutUser;
