import React from 'react';
import AboutUser from './AboutUser';
import OutstandingTask from './OutstandingTask';
import { MeetingCard } from '../common';
import './Home.scss';

const Home = () => (
  <div className="home">
    <div className="first-row">
      <div className="about">
        <AboutUser />
      </div>
      <MeetingCard showViewCalendar />
    </div>
    <div className="second-row">
      <OutstandingTask />
    </div>
  </div>
);

export default Home;
