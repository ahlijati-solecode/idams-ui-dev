import React from 'react';
import { Dropdown as SoleDropdown } from '@solecode/sole-ui';

const Dropdown = (props) => (
  <SoleDropdown
    props={{
      getPopupContainer: () => document.getElementById('master-page-content'),
    }}
    {...props}
  />
);

export default Dropdown;
