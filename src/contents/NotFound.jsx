import React from 'react';
import { Button } from '@solecode/sole-ui';
import Error404 from '../assets/error404.png';
import './NotFound.scss';

const NotFound = () => (
  <div className="not-found">
    <div>
      <img src={Error404} alt="error 404" />
    </div>
    <div>
      Oops, we couldn’t find the page!
    </div>
    <div>
      Please click the button below to return back to home.
    </div>
    <Button
      label="Back to Home"
      size={Button.Size.LARGE}
      onClick={() => {
        window.location = '/';
      }}
    />
  </div>
);

export default NotFound;
