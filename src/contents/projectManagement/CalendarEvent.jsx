import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar, momentLocalizer, Navigate as navigateCalendar } from 'react-big-calendar';
import clsx from 'clsx';
import moment from 'moment';
import PropTypes from 'prop-types';
import './CalendarEvent/styles.scss';
import { useNavigate } from 'react-router-dom';
import { Icon, Button } from '@solecode/sole-ui';
import {
  Dropdown, HeaderBanner, Paper,
} from '../../components';
import './CalendarEvent.scss';
import MeetingCard from '../common/MeetingCard';
import useMenuHelper from '../useMenuHelper';
import useProjectManagementApi from '../../hooks/api/projectManagement';
import ModalCalendarDetail from './ModalCalendarDetail';

const localizer = momentLocalizer(moment);

const stageToClass = {
  Inisiasi: 'inisiasi',
  Seleksi: 'seleksi',
  'Kajian Lanjut': 'kajian-lanjut',
};

const statusObj = {
  Completed: 'completed',
  Overdue: 'overdue',
  Canceled: 'canceled',
};

const EventCard = ({ event }) => (
  <div className={`event-card event-card-${stageToClass[event?.stage]}`}>
    <div className="text-container">
      <div>{moment(event?.start).format('HH:mm')}</div>
      <span className="event-card-header">{event?.title}</span>
      <span className="event-card-title">
        {event?.projectName}
      </span>
    </div>
    <FlagIcon type={statusObj[event?.status]} />
  </div>
);

const EventCardDay = ({ event }) => (
  <div className={`event-card event-card-${stageToClass[event?.stage]}`}>
    <div className="date-container">
      <div>{moment(event?.start).format('HH:mm')}</div>
      <div>-</div>
      <div>{moment(event?.end).format('HH:mm')}</div>
    </div>
    <div className="daily-text-container">
      <div className="event-card-header">{event?.title}</div>
      <div className="event-card-title">
        {event?.projectName}
      </div>
    </div>
    <FlagIcon type={statusObj[event?.status]} />
  </div>
);

const EventCard2 = ({ event }) => (
  <div className={`event-card2 event-card-${stageToClass[event?.stage]}`}>
    <div className="text-container">
      <span className="event-card-header">{event?.title}</span>
      <span>{event?.projectName}</span>
    </div>
    <FlagIcon type={statusObj[event?.status]} />
  </div>
);

const EventAgenda = ({ event }) => (
  <div className={`event-agenda event-agenda-${stageToClass[event?.stage]}`}>
    <div className="event-agenda-header">{event?.title}</div>
    <div>{event?.projectName}</div>
    <FlagIcon type={statusObj[event?.status]} />
  </div>
);

const FlagIcon = ({ type }) => (
  <div className={`flag-logo ${type}`}>
    <Icon
      name="flag"
      size="8"
      type="solid"
    />
  </div>
);

FlagIcon.propTypes = {
  type: PropTypes.string.isRequired,
};

EventCard.propTypes = {
  event: PropTypes.object.isRequired,
};

EventCardDay.propTypes = {
  event: PropTypes.object.isRequired,
};

EventCard2.propTypes = {
  event: PropTypes.object.isRequired,
};

EventAgenda.propTypes = {
  event: PropTypes.object.isRequired,
};

function ViewNamesGroup({ views: viewNames, view, messages, onView }) {
  return viewNames.map((name) => (
    <button
      type="button"
      key={name}
      className={clsx({ 'rbc-active': view === name })}
      onClick={() => onView(name)}
    >
      {messages[name]}
    </button>
  ));
}
ViewNamesGroup.propTypes = {
  messages: PropTypes.object,
  onView: PropTypes.func,
  view: PropTypes.string,
  views: PropTypes.array,
};

function CustomToolbar({
  // date, // available, but not used here
  label,
  localizer: { messages },
  onNavigate,
  onView,
  view,
  views,
}) {
  return (
    <div className="rbc-toolbar">
      <span className={clsx('rbc-btn-group', 'examples--custom-toolbar')}>
        <button
          type="button"
          onClick={() => onNavigate(navigateCalendar.TODAY)}
          aria-label={messages.today}
        >
          Today
        </button>
        <Button
          onClick={() => onNavigate(navigateCalendar.PREVIOUS)}
          shape="circle"
          size="small"
          type="primary"
          primaryIcon={(
            <Icon name="arrow-left" />
          )}
        />
        <Button
          onClick={() => onNavigate(navigateCalendar.NEXT)}
          shape="circle"
          size="small"
          type="primary"
          primaryIcon={(
            <Icon name="arrow-right" />
          )}
        />
      </span>
      <span className="rbc-toolbar-label">{label}</span>
      <span className="rbc-btn-group">
        <ViewNamesGroup
          view={view}
          views={views}
          messages={messages}
          onView={onView}
        />
      </span>
    </div>
  );
}
CustomToolbar.propTypes = {
  label: PropTypes.string.isRequired,
  localizer: PropTypes.object.isRequired,
  messages: PropTypes.object.isRequired,
  onNavigate: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  view: PropTypes.string.isRequired,
  views: PropTypes.array.isRequired,
};

const CalendarEvent = () => {
  const [start, setStart] = useState(moment(new Date()).subtract(1, 'month').format('YYYY-MM-DD'));
  const [end, setEnd] = useState(moment(new Date()).add(1, 'M').format('YYYY-MM-DD'));
  const [events, setEvents] = useState([
  ]);

  const navigate = useNavigate();
  const { setSelectedMenuKeys } = useMenuHelper();

  const { components } = useMemo(
    () => ({
      components: {
        month: { event: EventCard },
        week: { event: EventCard2 },
        day: { event: EventCardDay },
        agenda: { event: EventAgenda },
        toolbar: CustomToolbar,
      },
    }),
    []
  );
  const [filterProjects, setFilterProjects] = useState([]);
  const [dropdownProjectOpen, setDropdownProjectOpen] = useState(false);
  const [selectedFilterProject, setSelectedFilterProject] = useState({ key: '', children: 'All Project' });

  const [filterThresholds, setFilterThresholds] = useState([]);
  const [dropdownThresholdOpen, setDropdownThresholdOpen] = useState(false);
  const [selectedFilterThreshold, setSelectedFilterThreshold] = useState({ key: '', children: 'All Threshold' });
  const [isVisible, setIsVisible] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState({
    title: '',
    date: '',
    start: '',
    end: '',
    location: '',
    notes: '',
    threshold: '',
    regional: '',
    zona: '',
    participants: [],
    createdBy: '',
  });

  const onRangeChange = useCallback((range) => {
    if (range.start) setStart(range.start);
    if (range.end) setEnd(range.end);
    if (range.length > 0) {
      setStart(range[0]);
      setEnd(range.length - 1 > 0 ? range[range.length - 1] : '');
    }
  }, []);

  const {
    getCalendarEvents,
    getCalendarFilter,
    getMeetingDetail,
  } = useProjectManagementApi();

  function getDetail(event) {
    try {
      getMeetingDetail(event.projectActionId, event.meetingId).then((res) => {
        const obj = res.data.data;
        obj.projectTitle = event.projectName;
        obj.status = event.status;
        if (res) {
          setSelectedMeeting(obj);
          setIsVisible(true);
        }
      });
    } catch (e) {
      console.error(e);
      // eslint-disable-next-line no-alert
      window.alert('Something went wrong.');
    }
  }
  const handleSelectEvent = useCallback(
    // eslint-disable-next-line no-alert
    (event) => {
      const res = getDetail(event);
      setSelectedMeeting(res);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const getFilter = async () => {
    try {
      const res = await getCalendarFilter();
      if (res?.data.status === 'Success') {
        const arrProjects = [{ key: '', children: 'All Project' }];
        const objProjects = res.data.data.project;

        // eslint-disable-next-line no-restricted-syntax
        for (const key in objProjects) {
          // eslint-disable-next-line no-prototype-builtins
          if (objProjects.hasOwnProperty(key)) {
            arrProjects.push({
              key,
              children: objProjects[key],
            });
          }
        }
        setFilterProjects(arrProjects);

        const arrThresholds = [{ key: '', children: 'All Threshold' }];
        const objThresholds = res.data.data.threshold;

        // eslint-disable-next-line no-restricted-syntax
        for (const key in objThresholds) {
          // eslint-disable-next-line no-prototype-builtins
          if (objThresholds.hasOwnProperty(key)) {
            arrThresholds.push({
              key,
              children: objThresholds[key],
            });
          }
        }

        setFilterThresholds(arrThresholds);
      }
    } catch (e) {
      console.error(e);
      // eslint-disable-next-line no-alert
      window.alert('Something went wrong.');
    }
  };

  const getCalendarItems = async () => {
    try {
      const startDate = moment(start).format('YYYY-MM-DD');
      const endDate = moment(end || moment(new Date()).add(1, 'M')).format('YYYY-MM-DD');
      const res = await getCalendarEvents(
        startDate, endDate, selectedFilterThreshold.key, selectedFilterProject.key
      );
      const arr = res.data.data;

      for (let i = 0; i < arr.length; i += 1) {
        const date = moment(arr[i].date).format('DD/MM/YYYY');
        const [day, month, year] = date.split('/');
        const [startHours, startMinutes, startSeconds] = arr[i].start.split(':');
        const [endHours, endMinutes, endSeconds] = arr[i].end.split(':');

        const startTime = new Date(+year, +month - 1, +day, +startHours, +startMinutes, +startSeconds);
        const endTime = new Date(+year, +month - 1, +day, +endHours, +endMinutes, +endSeconds);
        const nowDate = new Date().getTime();
        if (arr[i].status !== 'Completed' && nowDate > startTime.getTime()) {
          arr[i].status = 'Overdue';
        }
        arr[i].start = startTime;
        arr[i].end = endTime;
      }

      setEvents(arr);
    } catch (e) {
      console.error(e);
      // eslint-disable-next-line no-alert
      window.alert('Something went wrong.');
    }
  };

  const handleCancel = () => {
    setIsVisible(false);
    setSelectedMeeting({});
  };

  useEffect(() => {
    getFilter();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getCalendarItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end, selectedFilterProject, selectedFilterThreshold]);

  const formats = {
    timeGutterFormat: (range) => `${localizer.format(range, 'HH:mm')}`,
    agendaTimeRangeFormat: (range) => `${localizer.format(range.start, 'HH:mm')} – ${localizer.format(range.end, 'HH:mm')}`,
    dayRangeHeaderFormat: (range) => `${localizer.format(range.start, 'MMMM YYYY')} – ${localizer.format(range.end, 'MMMM YYYY')}`,
    agendaHeaderFormat: (range) => `${localizer.format(range.start, 'DD MMM YYYY')} – ${localizer.format(range.end, 'DD MMM YYYY')}`,
    dayHeaderFormat: (range) => `${localizer.format(range, 'dddd, DD MMMM YYYY')}`,
  };

  return (
    <div className="calendar-event">
      <ModalCalendarDetail
        modalTitle="Meeting Details"
        isVisible={isVisible}
        handleCancel={handleCancel}
        meetingTitle={selectedMeeting?.title}
        isFormDisabled={1}
        date={moment(selectedMeeting?.date)}
        time={[moment(selectedMeeting?.start, 'HH:mm'), moment(selectedMeeting?.end, 'HH:mm')]}
        location={selectedMeeting?.location}
        participants={selectedMeeting?.participants}
        notes={selectedMeeting?.notes}
        threshold={selectedMeeting?.threshold}
        regional={selectedMeeting?.regional}
        zona={selectedMeeting?.zona}
        projectTitle={selectedMeeting?.projectTitle}
        status={selectedMeeting?.status}
        createdBy={selectedMeeting?.createdBy}
      />
      <HeaderBanner
        title="Calendar Event"
        breadcrumb={(
          <div
            className="header-navigation"
            onClick={() => {
              setSelectedMenuKeys(['all-projects']);
              navigate('/project-management/all-projects');
            }}
            aria-hidden="true"
          >
            <Icon name="arrow-left" />
            <div className="breadcrumb">Project Management</div>
          </div>
        )}
        type="primary"
      />
      <div className="paper-container">
        <Paper>
          <MeetingCard />
        </Paper>
        <Paper>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Dropdown
              label={selectedFilterProject.children}
              menuItem={filterProjects}
              visible={dropdownProjectOpen}
              onVisibleChange={(e) => { setDropdownProjectOpen(e); }}
              onClick={(e) => {
                const indexes = e.key.split('-');
                const index = indexes[indexes.length - 1];
                setDropdownProjectOpen(false);
                setSelectedFilterProject(filterProjects[index]);
              }}
            />
            <Dropdown
              label={selectedFilterThreshold.children}
              menuItem={filterThresholds}
              visible={dropdownThresholdOpen}
              onVisibleChange={(e) => { setDropdownThresholdOpen(e); }}
              onClick={(e) => {
                const indexes = e.key.split('-');
                const index = indexes[indexes.length - 1];
                setDropdownThresholdOpen(false);
                setSelectedFilterThreshold(filterThresholds[index]);
              }}
            />
          </div>
        </Paper>
        <Paper>
          <div className={`calendar-container ${end.toString() === '' && 'daily-calendar'}`}>
            <Calendar
              components={components}
              events={events}
              localizer={localizer}
              onSelectEvent={handleSelectEvent}
              startAccessor="start"
              endAccessor="end"
              onRangeChange={onRangeChange}
              formats={formats}
              messages={{ event: 'Agenda' }}
              popup
            />
          </div>
          <div className="calendar-footer">
            <div className="stage">
              <Icon
                name="circle-info"
                size={20}
              />
              <span>Stage:</span>
            </div>
            <div className="stage-list">
              <div className="inisiasi">
                Inisiasi
              </div>
              <div className="seleksi">
                Seleksi
              </div>
              <div className="kajian-lanjut">
                Kajian Lanjut
              </div>
            </div>
            <div
              className="divider"
            />
            <div className="status">
              Status:
            </div>
            <div className="status-list">
              <div className="status-icon">
                <FlagIcon type="completed" />
                <span>Meeting Completed</span>
              </div>
              <div className="status-icon">
                <FlagIcon type="overdue" />
                <span>Meeting Overdue</span>
              </div>
              <div className="status-icon">
                <FlagIcon type="canceled" />
                <span>Canceled</span>
              </div>
            </div>
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default CalendarEvent;
