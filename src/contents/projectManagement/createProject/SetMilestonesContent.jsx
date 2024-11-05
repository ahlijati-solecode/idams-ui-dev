import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-business-days';
import { Datepicker, DaterangePicker, Icon, InputText, Tooltip } from '@solecode/sole-ui';
import { PaperTitle } from '../../../components';
import { useLoadData } from '../../../hooks';
import useProjectManagementApi from '../../../hooks/api/projectManagement';
import './SetMilestonesContent.scss';

const MilestoneCard = ({
  projectId,
  projectVersion,
  milestone,
  prevMilestone,
  notifyUpdate,
  isViewOnly,
  surpressUpdate,
  startDateLimit,
  endDateLimit,
}) => {
  const {
    updateMilestone,
  } = useProjectManagementApi();

  const { workflowName, workflowType, workflowCategory, workflowSequenceId } = milestone;
  const isInitiation = workflowCategory === 'Inisiasi' && workflowName === 'Project Initiation';

  const [date, setDate] = useState(null);
  const [rangeDate, setRangeDate] = useState([null, null]);

  useEffect(() => {
    const startD = milestone.startDate ? moment(milestone.startDate).toDate() : null;
    const endD = milestone.endDate ? moment(milestone.endDate).toDate() : null;
    const prevEndD = prevMilestone?.endDate ? moment(prevMilestone.endDate) : null;

    if (isInitiation) {
      setDate(startD);

      return;
    }

    if (!prevEndD || startD) {
      setRangeDate([startD, endD]);

      return;
    }

    setRangeDate([prevEndD, prevEndD]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestone.startDate, milestone.endDate, prevMilestone?.endDate]);

  const getSla = () => {
    const startD = rangeDate[0];
    const endD = rangeDate[1];

    let diff = 0;

    if (startD && endD) {
      diff = moment(endD).businessDiff(moment(startD), 'day') + 1;
    }

    return `${diff} Working ${diff > 1 ? 'Days' : 'Day'}`;
  };

  const onDateChange = async (newDate) => {
    let startD = null;
    let endD = null;

    if (isInitiation) {
      startD = moment(newDate).format('YYYY-MM-DD');
      endD = startD;
    } else {
      startD = moment(newDate[0]).format('YYYY-MM-DD');
      endD = moment(newDate[1]).format('YYYY-MM-DD');
    }

    if (!surpressUpdate) {
      await updateMilestone({
        projectId,
        projectVersion,
        section: 'UpdateMilestone',
        milestone: [{
          workflowSequenceId,
          startDate: startD,
          endDate: endD,
        }],
      });
    }

    notifyUpdate(workflowSequenceId, startD, endD);
  };

  const getStartDateLimit = () => {
    const prevEndD = prevMilestone?.endDate ? prevMilestone.endDate : null;

    if (!prevEndD) {
      return startDateLimit;
    }

    return prevEndD;
  };

  const disabledDate = (current) => current && (
    moment(current).weekday() === 0 ||
    moment(current).weekday() === 6 ||
    (getStartDateLimit() && moment(current).isBefore(moment(getStartDateLimit()), 'day')) ||
    (endDateLimit && moment(current).isAfter(moment(endDateLimit), 'day'))
  );

  return (
    <div
      className={[
        'milestone-card',
        isInitiation ? 'initiation' : '',
      ].join(' ')}
    >
      <div>{workflowName}</div>
      <div>
        <div>{isInitiation ? <>&nbsp;</> : workflowType}</div>
      </div>
      <div>
        <Icon name="calendar-clock" />
        {isInitiation ? '1 Working Day' : getSla()}
      </div>
      <div>
        {
          isInitiation ? (
            <Datepicker
              value={date}
              size="small"
              allowClear={false}
              format="DD MMM YYYY"
              disabledDate={disabledDate}
              placeholder="Set date"
              onChange={(e) => {
                setDate(e);
                onDateChange(e);
              }}
              disabled={isViewOnly}
            />
          ) : (
            <DaterangePicker
              value={rangeDate}
              size="small"
              allowClear={false}
              format="DD MMM YYYY"
              disabledDate={disabledDate}
              onChange={(e) => {
                setRangeDate(e);
                onDateChange(e);
              }}
              disabled={isViewOnly}
            />
          )
        }
      </div>
    </div>
  );
};

MilestoneCard.propTypes = {
  projectId: PropTypes.string.isRequired,
  projectVersion: PropTypes.any.isRequired,
  milestone: PropTypes.object.isRequired,
  prevMilestone: PropTypes.object,
  notifyUpdate: PropTypes.func.isRequired,
  isViewOnly: PropTypes.bool,
  surpressUpdate: PropTypes.bool,
  startDateLimit: PropTypes.any,
  endDateLimit: PropTypes.any,
};

MilestoneCard.defaultProps = {
  prevMilestone: null,
  isViewOnly: false,
  surpressUpdate: false,
  startDateLimit: null,
  endDateLimit: null,
};

const MilestonePerCategory = ({
  projectId,
  projectVersion,
  title,
  milestones,
  prevMilestone,
  notifyUpdate,
  isViewOnly,
  surpressUpdate,
  startDateLimit,
  endDateLimit,
}) => (
  <div>
    <div>
      <div>{title}</div>
      <Tooltip
        title={<SlaGuidelinesTooltip milestones={milestones} />}
        placement={Tooltip.Placement.BOTTOM}
      >
        <div>View SLA Guidelines</div>
      </Tooltip>
    </div>
    <div>
      {
        milestones.map((e, i) => (
          <MilestoneCard
            key={e.workflowSequenceId}
            projectId={projectId}
            projectVersion={projectVersion}
            milestone={e}
            prevMilestone={i === 0 ? prevMilestone : milestones[i - 1]}
            notifyUpdate={notifyUpdate}
            isViewOnly={isViewOnly}
            surpressUpdate={surpressUpdate}
            startDateLimit={startDateLimit}
            endDateLimit={endDateLimit}
          />
        ))
      }
    </div>
  </div>
);

MilestonePerCategory.propTypes = {
  projectId: PropTypes.string.isRequired,
  projectVersion: PropTypes.any.isRequired,
  title: PropTypes.string.isRequired,
  milestones: PropTypes.array.isRequired,
  prevMilestone: PropTypes.object,
  notifyUpdate: PropTypes.func.isRequired,
  isViewOnly: PropTypes.bool,
  surpressUpdate: PropTypes.bool,
  startDateLimit: PropTypes.any,
  endDateLimit: PropTypes.any,
};

MilestonePerCategory.defaultProps = {
  prevMilestone: null,
  isViewOnly: false,
  surpressUpdate: false,
  startDateLimit: null,
  endDateLimit: null,
};

const SlaGuidelinesTooltip = ({ milestones }) => (
  <div>
    {
      milestones.map((e) => (
        <div key={e.workflowName}>
          -
          &nbsp;
          {e.workflowName}
          :
          &nbsp;
          <b>{e.sla}</b>
          &nbsp;
          <b>{`Working ${e.sla > 1 ? 'Days' : 'Day'}`}</b>
        </div>
      ))
    }
  </div>
);

SlaGuidelinesTooltip.propTypes = {
  milestones: PropTypes.array.isRequired,
};

const SetMilestonesContent = ({
  projectId,
  projectVersion,
  onFormValidChange,
  isViewOnly,
  onNotifyUpdate,
  surpressUpdate,
  startDateLimit,
  endDateLimit,
}) => {
  const {
    getMilestone,
  } = useProjectManagementApi();

  const [milestoneData, , , , refreshMilestoneData] = useLoadData({
    getDataFunc: getMilestone,
    getDataParams: { projectId, projectVersion },
    dataKey: 'data',
  });

  const [milestoneFilled, setMilestoneFilled] = useState({});

  useEffect(() => {
    if (!milestoneData?.milestone) {
      return;
    }

    const newMilestoneFilled = {};

    milestoneData.milestone.forEach((e) => {
      if (e.startDate) {
        newMilestoneFilled[e.workflowSequenceId] = {
          workflowSequenceId: e.workflowSequenceId,
          startDate: e.startDate,
          endDate: e.endDate,
        };
      }
    });

    setMilestoneFilled(newMilestoneFilled);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestoneData?.milestone]);

  useEffect(() => {
    if (!milestoneData) {
      onFormValidChange(false);
      onNotifyUpdate(milestoneFilled);

      return;
    }

    if (Object.keys(milestoneFilled).filter((e) => milestoneFilled[e]).length < milestoneData.milestone.length) {
      onFormValidChange(false);
      onNotifyUpdate(milestoneFilled);

      return;
    }

    onFormValidChange(true);
    onNotifyUpdate(milestoneFilled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestoneFilled]);

  const notifyUpdateHandler = (workflowSequenceId, startDate, endDate) => {
    setMilestoneFilled({
      ...milestoneFilled,
      [workflowSequenceId]: {
        workflowSequenceId,
        startDate,
        endDate,
      },
    });
    refreshMilestoneData();
  };

  if (!milestoneData) {
    return <></>;
  }

  return (
    <>
      <div className="create-project-set-milestones-content">
        <div className="create-project-set-milestones-content">
          <PaperTitle>
            Project Workflow Type
          </PaperTitle>
          <div className="create-project-set-milestones-project-template-name-input">
            <InputText
              value={milestoneData.templateName}
              disabled
            />
          </div>
        </div>
        <div className="milestones-container">
          <MilestonePerCategory
            projectId={projectId}
            projectVersion={projectVersion}
            title="INISIASI"
            milestones={milestoneData.milestone.filter((e) => e.workflowCategory === 'Inisiasi')}
            notifyUpdate={notifyUpdateHandler}
            isViewOnly={isViewOnly}
            surpressUpdate={surpressUpdate}
            startDateLimit={startDateLimit}
            endDateLimit={endDateLimit}
          />
          <MilestonePerCategory
            projectId={projectId}
            projectVersion={projectVersion}
            title="SELEKSI"
            milestones={milestoneData.milestone.filter((e) => e.workflowCategory === 'Seleksi')}
            prevMilestone={
              milestoneData.milestone.filter((e) => e.workflowCategory === 'Inisiasi').length
                ? milestoneData.milestone.filter((e) => e.workflowCategory === 'Inisiasi')[milestoneData.milestone.filter((e) => e.workflowCategory === 'Inisiasi').length - 1]
                : null
            }
            notifyUpdate={notifyUpdateHandler}
            isViewOnly={isViewOnly}
            surpressUpdate={surpressUpdate}
            startDateLimit={startDateLimit}
            endDateLimit={endDateLimit}
          />
          <MilestonePerCategory
            projectId={projectId}
            projectVersion={projectVersion}
            title="KAJIAN LANJUT"
            milestones={milestoneData.milestone.filter((e) => e.workflowCategory === 'Kajian Lanjut')}
            prevMilestone={
              // eslint-disable-next-line no-nested-ternary
              milestoneData.milestone.filter((e) => e.workflowCategory === 'Seleksi').length
                ? milestoneData.milestone.filter((e) => e.workflowCategory === 'Seleksi')[milestoneData.milestone.filter((e) => e.workflowCategory === 'Seleksi').length - 1]
                : (
                  milestoneData.milestone.filter((e) => e.workflowCategory === 'Inisiasi').length
                    ? milestoneData.milestone.filter((e) => e.workflowCategory === 'Inisiasi')[milestoneData.milestone.filter((e) => e.workflowCategory === 'Inisiasi').length - 1]
                    : null
                )
            }
            notifyUpdate={notifyUpdateHandler}
            isViewOnly={isViewOnly}
            surpressUpdate={surpressUpdate}
            startDateLimit={startDateLimit}
            endDateLimit={endDateLimit}
          />
        </div>
      </div>
    </>
  );
};

SetMilestonesContent.propTypes = {
  projectId: PropTypes.string,
  projectVersion: PropTypes.any,
  onFormValidChange: PropTypes.func,
  isViewOnly: PropTypes.bool,
  onNotifyUpdate: PropTypes.func,
  surpressUpdate: PropTypes.bool,
  startDateLimit: PropTypes.any,
  endDateLimit: PropTypes.any,
};

SetMilestonesContent.defaultProps = {
  projectId: '',
  projectVersion: 1,
  onFormValidChange: () => {},
  isViewOnly: false,
  onNotifyUpdate: () => {},
  surpressUpdate: false,
  startDateLimit: null,
  endDateLimit: null,
};

export default SetMilestonesContent;
