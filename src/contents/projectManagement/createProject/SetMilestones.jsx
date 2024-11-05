import React from 'react';
import PropTypes from 'prop-types';
import SetMilestonesContent from './SetMilestonesContent';
import { PaperHeader, PaperTitle } from '../../../components';
import './SetMilestones.scss';

const SetMilestones = ({
  projectId,
  projectVersion,
  onFormValidChange,
  isViewOnly,
  onNotifyUpdate,
  startDateLimit,
  endDateLimit,
}) => (
  <div className="create-project-set-milestones">
    <PaperHeader>
      <PaperTitle>
        Set Milestones
      </PaperTitle>
    </PaperHeader>
    <SetMilestonesContent
      projectId={projectId}
      projectVersion={projectVersion}
      onFormValidChange={onFormValidChange}
      isViewOnly={isViewOnly}
      onNotifyUpdate={onNotifyUpdate}
      startDateLimit={startDateLimit}
      endDateLimit={endDateLimit}
    />
  </div>
);

SetMilestones.propTypes = {
  projectId: PropTypes.string,
  projectVersion: PropTypes.any,
  onFormValidChange: PropTypes.func,
  isViewOnly: PropTypes.bool,
  onNotifyUpdate: PropTypes.func,
  startDateLimit: PropTypes.any,
  endDateLimit: PropTypes.any,
};

SetMilestones.defaultProps = {
  projectId: '',
  projectVersion: 1,
  onFormValidChange: () => {},
  isViewOnly: false,
  onNotifyUpdate: () => {},
  startDateLimit: null,
  endDateLimit: null,
};

export default SetMilestones;
