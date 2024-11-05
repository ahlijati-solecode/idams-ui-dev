import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { Meeting } from '../../components';
import { useLoadData } from '../../hooks';
import useProjectManagementApi from '../../hooks/api/projectManagement';

import './MeetingCard.scss';

const MeetingCard = ({ projectId, showViewCalendar }) => {
  const navigate = useNavigate();

  const {
    getUpcomingMeetings,
  } = useProjectManagementApi();

  const [upcomingMeetings] = useLoadData({
    getDataFunc: getUpcomingMeetings,
    getDataParams: {
      projectId,
    },
    dataKey: 'data',
  });

  const parseUpcomingMeeting = (e) => {
    const date = moment(e.date).format('DD MMM');
    const starts = e.start.split(':');
    const ends = e.end.split(':');
    const time = `${starts[0]}:${starts[1]} - ${ends[0]}:${ends[1]}`;

    return {
      title: e.meetingName,
      description: e.projectName,
      date,
      time,
    };
  };

  const getUpcomingMeetingsData = () => {
    if (!upcomingMeetings?.length) {
      return [];
    }

    return [parseUpcomingMeeting(upcomingMeetings[0])];
  };

  const getOtherMeetingsData = () => {
    const otherMeetings = [];

    if (!upcomingMeetings?.length) {
      return [];
    }

    if (upcomingMeetings[1]) {
      otherMeetings.push(parseUpcomingMeeting(upcomingMeetings[1]));
    }

    if (upcomingMeetings[2]) {
      otherMeetings.push(parseUpcomingMeeting(upcomingMeetings[2]));
    }

    return otherMeetings;
  };

  const onViewCalendar = () => {
    navigate('/project-management/calendar-event');
  };

  let upcomingMeetingsSize = 'sm';
  const otherMeetingsSize = 'md';

  if (!getUpcomingMeetingsData().length && !getOtherMeetingsData().length) {
    upcomingMeetingsSize = 'md';
  }

  return (
    <div className="meeting-card">
      <Meeting
        title="UPCOMING MEETING"
        items={getUpcomingMeetingsData()}
        isUpcomingMeeting
        size={upcomingMeetingsSize}
      />
      <Meeting
        title="OTHER INVITED MEETING"
        items={getOtherMeetingsData()}
        showViewCalendar={showViewCalendar}
        onViewCalendar={onViewCalendar}
        size={otherMeetingsSize}
      />
    </div>
  );
};

MeetingCard.propTypes = {
  projectId: PropTypes.string,
  showViewCalendar: PropTypes.bool,
};

MeetingCard.defaultProps = {
  projectId: '',
  showViewCalendar: false,
};

export default MeetingCard;
