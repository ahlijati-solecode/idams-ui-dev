import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { InputText, SelectSearch } from '@solecode/sole-ui';
import './SearchFilter.scss';

const SearchFilter = ({
  searchBy,
  setSearchBy,
  options,
  filterPlaceholder,
  searchValue,
  setSearchValue,
  inputPlaceholder,
}) => {
  const [searchByState, setSearchByState] = useState(searchBy);
  const [searchValueState, setSearchValueState] = useState(searchValue);

  useEffect(() => {
    setSearchByState(searchBy);
  }, [searchBy]);

  useEffect(() => {
    setSearchValueState(searchValue);
  }, [searchValue]);

  const onSearchValueChange = (e) => {
    setSearchValueState(e);

    if (!e) {
      setSearchValue('');
    }
  };

  return (
    <div className="solecode-ui-search-filter">
      <SelectSearch
        value={searchByState}
        onChange={setSearchBy}
        onSearch={setSearchBy}
        options={options}
        placeholder={filterPlaceholder}
        props={{
          getPopupContainer: () => document.getElementById('master-page-content'),
        }}
      />
      <div className="divider" />
      <InputText
        value={searchValueState}
        placeholder={inputPlaceholder}
        onPressEnter={(e) => { setSearchValue(e.target.value); }}
        onChange={(e) => { onSearchValueChange(e.target.value); }}
        suffix={{
          name: 'magnifying-glass',
          type: 'regular',
        }}
      />
    </div>
  );
};

SearchFilter.propTypes = {
  searchBy: PropTypes.string,
  setSearchBy: PropTypes.func,
  options: PropTypes.array,
  filterPlaceholder: PropTypes.string,
  searchValue: PropTypes.string,
  setSearchValue: PropTypes.func,
  inputPlaceholder: PropTypes.string,
};

SearchFilter.defaultProps = {
  searchBy: null,
  setSearchBy: () => {},
  options: [],
  filterPlaceholder: '',
  searchValue: '',
  setSearchValue: () => {},
  inputPlaceholder: '',
};

export default SearchFilter;
