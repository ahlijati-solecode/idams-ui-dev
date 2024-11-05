import React, { useState } from 'react';
import { Card, Button, Icon } from '@solecode/sole-ui';
import PropTypes from 'prop-types';
import { Badge } from 'antd';
import Alert from './Alert';
import './SummaryCard.scss';
import DetailGroup from '../contents/documentManagement/components/DetailGroup';
import RenderIf from '../contents/RenderIf';
import ModalComments from '../contents/projectManagement/detailProject/components/ModalComments';
import ModalMilestone from '../contents/projectManagement/detailProject/components/ModalMilestone';

const SummaryCard = ({ data }) => {
  const [isOpenModalComments, setIsOpenModalComments] = useState(false);
  const [isOpenModalMilestone, setIsOpenModalMilestone] = useState(false);

  return (
    <div className="summary-card-component">
      <ModalMilestone
        visible={isOpenModalMilestone}
        setVisible={() => setIsOpenModalMilestone(false)}
        projectData={data}
      />

      <ModalComments
        visible={isOpenModalComments}
        setVisible={() => setIsOpenModalComments(false)}
      />

      <div className="header">
        <div className="wrapper-title">
          <h3>{data?.title}</h3>
        </div>
        <div className="wrapper-subtitle">
          <DetailGroup
            threshold={data?.threshold}
            hierLvl2Desc={data?.zona}
            hierLvl3Desc={data?.regional}
            rkap={data?.rkap}
            revision={data?.revision}
          />
        </div>
      </div>
      <div className="body">
        <Card body={(
          <div className="wrapper-content">
            <div className="details">
              <Icon name="memo" size={20} />
              <div className="detail-text-wrapper">
                <span>Outstanding Task</span>
                <span className="text-bold">{data?.outstandingTask}</span>
              </div>
            </div>
            <Alert
              type="info"
              showIcon
              icon={{ name: 'calendar-clock', type: 'regular' }}
              message={data?.estFidDate}
              closeable={false}
            />
          </div>
      )}
        />

        <div className="wrapper-btn-action">
          <Button
            label="View Milestone"
            type={data?.viewMilestoneBtn?.type || 'primary'}
            disabled={Boolean(data?.viewMilestoneBtn?.disabled) || false}
            onClick={() => setIsOpenModalMilestone(true)}
            size={data?.viewMilestoneBtn?.size || 'large'}
            primaryIcon={(
              <Icon
                name={data?.viewMilestoneBtn?.primaryIcon?.name}
                size={data?.viewMilestoneBtn?.primaryIcon?.size}
              />
          )}
          />
          <Button
          // label="View Comments"
            label={(
              <div className="view-comments-btn-wrapper">
                <span>View Comments</span>
                <RenderIf isTrue={data?.viewCommentsBtn?.showCounter && data?.viewCommentsBtn?.counterValue !== 0}>
                  <Badge count={data?.viewCommentsBtn?.counterValue} />
                </RenderIf>
              </div>
          )}
            type={data?.viewCommentsBtn?.type || 'secondary'}
            disabled={Boolean(data?.viewCommentsBtn?.disabled) || false}
            primaryIcon={(
              <Icon
                name={data?.viewCommentsBtn?.primaryIcon?.name}
                size={data?.viewCommentsBtn?.primaryIcon?.size}
              />
          )}
            onClick={() => setIsOpenModalComments(true)}
            size={data?.viewCommentsBtn?.size || 'large'}
          />
        </div>
      </div>
    </div>
  );
};

SummaryCard.propTypes = {
  data: PropTypes.object,
};

SummaryCard.defaultProps = {
  data: {},
};

export default SummaryCard;
