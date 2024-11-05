import { React, useState, useEffect } from 'react';
import { InputNumber as AntdInputNumber } from 'antd';
import { Icon } from '@solecode/sole-ui';
import PropTypes from 'prop-types';
import './InputNumber.scss';

const Size = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};

const Status = {
  ERROR: 'error',
  WARNING: 'warning',
};

const InputNumber = ({
  defaultValue,
  formatter,
  parser,
  size,
  onChange,
  value,
  prefix,
  suffix,
  min,
  max,
  step,
  status,
  placeholder,
  disabled,
  stringMode,
  showControls,
}) => {
  const [val, setVal] = useState(value);

  useEffect(() => {
    setVal(value);
  }, [value]);

  return (
    <div className="solecode-ui-input-number">
      <AntdInputNumber
        min={min}
        max={max}
        step={step}
        status={status}
        defaultValue={defaultValue}
        value={val}
        disabled={disabled}
        size={size}
        prefix={<Icon name={prefix?.name || null} type={prefix?.type || null} size={prefix?.size || null} />}
        suffix={<Icon name={suffix?.name || null} type={suffix?.type || null} />}
        formatter={formatter}
        parser={parser}
        placeholder={placeholder}
        onChange={(e) => {
          setVal(e);
          onChange(e);
        }}
        stringMode={stringMode}
        controls={showControls}
      />
    </div>
  );
};

InputNumber.propTypes = {
  placeholder: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  defaultValue: PropTypes.number,
  value: PropTypes.any,
  size: PropTypes.oneOf(Object.values(Size)),
  parser: PropTypes.func,
  prefix: PropTypes.any,
  suffix: PropTypes.any,
  formatter: PropTypes.func,
  onChange: PropTypes.func,
  status: PropTypes.oneOf(Object.values(Status)),
  disabled: PropTypes.bool,
  stringMode: PropTypes.bool,
  showControls: PropTypes.bool,
};

InputNumber.defaultProps = {
  showControls: true,
  placeholder: null,
  disabled: false,
  min: 0,
  max: null,
  step: null,
  defaultValue: null,
  value: null,
  size: Size.MEDIUM,
  prefix: null,
  suffix: null,
  status: null,
  stringMode: true,
  parser: () => {},
  formatter: () => {},
  onChange: () => {},
};

export default InputNumber;
