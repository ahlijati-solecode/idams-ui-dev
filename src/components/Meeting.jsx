import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@solecode/sole-ui';
import './Meeting.scss';

const Meeting = ({
  title,
  items,
  isUpcomingMeeting,
  showViewCalendar,
  onViewCalendar,
  size,
}) => (
  <div
    className={[
      'solecode-ui-meeting',
      isUpcomingMeeting ? 'upcoming' : '',
    ].join(' ').trim()}
  >
    <div className="title">
      {title}
      {
        showViewCalendar && (
          <div
            className="view-calendar"
            role="button"
            tabIndex={-1}
            onClick={onViewCalendar}
            onKeyDown={() => {}}
          >
            <span>View Calendar</span>
            <Icon name="arrow-right" />
          </div>
        )
      }
    </div>
    <div className="meeting-list">
      {
        items?.length ? (
          <>
            {
              items.map((e, index) => (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={`meeting-item-${index}`}
                  className="meeting-item"
                >
                  <div>
                    <div>{e.date}</div>
                    <div>{e.time}</div>
                  </div>
                  <div>
                    <div>{e.title}</div>
                    <div>{e.description}</div>
                  </div>
                </div>
              ))
            }
          </>
        ) : (
          <div
            className={[
              'empty',
              size,
            ].join(' ').trim()}
          >
            <div className="calendar-icon">
              <Icon
                name="calendar-circle-minus"
                size={24}
              />
            </div>
            {
              isUpcomingMeeting ?
                'No upcoming meetings.' :
                'You haven\'t been invited to any meetings yet.'
            }
          </div>
        )
      }
    </div>
  </div>
);

Meeting.propTypes = {
  title: PropTypes.string,
  items: PropTypes.array,
  isUpcomingMeeting: PropTypes.bool,
  showViewCalendar: PropTypes.bool,
  onViewCalendar: PropTypes.func,
  size: PropTypes.string,
};

Meeting.defaultProps = {
  title: '',
  items: [],
  isUpcomingMeeting: false,
  showViewCalendar: false,
  onViewCalendar: () => {},
  size: 'sm',
};

export default Meeting;
