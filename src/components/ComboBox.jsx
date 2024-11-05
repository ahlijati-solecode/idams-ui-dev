import React, { useEffect, useState } from 'react';
// import { Select as AntdSelect } from 'antd';
import { Icon, ComboBox as SoleComboBox } from '@solecode/sole-ui';
import PropTypes from 'prop-types';
import './ComboBox.scss';

const Size = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};

const ComboBox = ({
  placeholder,
  value,
  defaultValue,
  options,
  onSearch,
  size,
  onChange,
  disabled,
  labelInValue,
  showArrow,
  showSearch,
}) => {
  const [val, setVal] = useState(value);

  const filterOption = ((input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0);

  const optionsGenerator = () => {
    if (!val) return options;

    return options?.filter((o) => !val.map((el) => labelInValue ? el?.value : el).includes(o?.value));
  };

  const filteredOptions = optionsGenerator();

  useEffect(() => {
    setVal(value);
  }, [value]);

  return (
    <div className="solecode-ui-combo-box">
      <SoleComboBox
        showArrow={showArrow}
        showSearch={showSearch}
        labelInValue={labelInValue}
        size={size}
        mode="multiple"
        optionFilterProp="children"
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={val}
        onSearch={onSearch}
        onChange={(e) => {
          setVal(e);
          onChange(e);
        }}
        style={{
          width: '100%',
        }}
        disabled={disabled}
        filterOption={filterOption}
        suffixIcon={<Icon name="chevron-down" type="solid" size="14" />}
        options={filteredOptions}
      />
    </div>
  );
};

ComboBox.propTypes = {
  showArrow: PropTypes.bool,
  showSearch: PropTypes.bool,
  labelInValue: PropTypes.bool,
  options: PropTypes.array,
  placeholder: PropTypes.string,
  size: PropTypes.oneOf(Size),
  value: PropTypes.array,
  defaultValue: PropTypes.array,
  onChange: PropTypes.func,
  onSearch: PropTypes.func,
  disabled: PropTypes.bool,
};

ComboBox.defaultProps = {
  showArrow: true,
  showSearch: true,
  labelInValue: true,
  options: [],
  placeholder: '',
  onChange: () => {},
  onSearch: () => {},
  size: Size.MEDIUM,
  value: [],
  defaultValue: [],
  disabled: false,
};

export default ComboBox;
