import React from 'react';
import PropTypes from 'prop-types';
import { Card, Icon, Tooltip } from '@solecode/sole-ui';
import RenderIf from '../../RenderIf';
import StatusPill from './StatusPill';
import convertToLocalTime from '../../../libs/convertToLocalTime';
import './ProjectFileCard.scss';

const ProjectFileCard = ({ data }) => {
  const body = (
    <>
      <div className="custom-card-header">
        <div className="project-title">
          <RenderIf isTrue={data?.projectName?.length > 40}>
            <Tooltip title={data?.projectName}>
              <span className="text-ellipsis">
                {data?.projectName}
              </span>
            </Tooltip>
          </RenderIf>
          <RenderIf isTrue={data?.projectName?.length <= 40}>
            {data?.projectName || '-'}
          </RenderIf>
        </div>
        <StatusPill
          status={data?.status}
          workflowType={data?.workflowType}
        />
      </div>
      <div className="custom-card-body">
        <div className="detail-group">
          <div className="threshold">
            <div className={['dot', data?.threshold ? `dot-${data?.threshold?.toLowerCase()}` : ''].join(' ')} />
            <span>{data?.threshold || '-'}</span>
          </div>
          <div className="divider" />
          <div className="zona-regional">
            {`${data?.hierLvl3Desc || '-'} · ${data?.hierLvl2Desc || '-'}`}
          </div>
          <div className="divider" />
          <div className="rkap">
            {data?.rkap ? `RKAP ${data?.rkap}` : ''}
            {data?.revision ? ' Revisi' : ''}
          </div>
        </div>
        <div className="project-sub-criteria">
          {data?.subCriteria || '-'}
        </div>
      </div>
      <div className="custom-card-footer">
        <Icon name="clock" size={14} />
        <span>{data?.updatedDate ? `Last updated ${convertToLocalTime(data?.updatedDate, 'DD MMM YYYY, HH:mm')}` : '-'}</span>
      </div>
    </>
  );

  return (
    <div className="project-file-card-component">
      <Card
        body={body}
      />
    </div>
  );
};

ProjectFileCard.propTypes = {
  data: PropTypes.object,
};

ProjectFileCard.defaultProps = {
  data: {},
};

export default ProjectFileCard;
