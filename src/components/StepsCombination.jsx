import { React, useState, useEffect } from 'react';
import { Steps as AntdSteps } from 'antd';
import PropTypes from 'prop-types';
import './Steps.scss';
// import { Direction, Size, Status } from './Enums';

const { Step } = AntdSteps;

const Size = {
  DEFAULT: 'default',
  SMALL: 'small',
};

const Direction = {
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal',
};

const Status = {
  WAIT: 'wait',
  PROCESS: 'process',
  FINISH: 'finish',
  ERROR: 'error',
};

const StepsCombination = ({
  current,
  size,
  status,
  direction,
  data,
  onChange,
}) => {
  const [val, setVal] = useState(current);

  useEffect(() => {
    setVal(current);
  }, [current]);

  return (
    <div className="solecode-ui-steps-combination">
      <AntdSteps
        current={val}
        size={size}
        status={status}
        direction={direction}
        onChange={(e) => {
          setVal(e);
          onChange(e);
        }}
      >
        {
          data.map((item) => (
            <Step
              title={item.title}
              description={item.description}
              key={item.key || item.title}
              disabled={item.disabled}
              status={item.status}
              progressDot={Boolean(item.isChildren) || false}
            />
          ))
        }
      </AntdSteps>
    </div>
  );
};

StepsCombination.propTypes = {
  current: PropTypes.number,
  size: PropTypes.oneOf(Size),
  status: PropTypes.oneOf(Status),
  direction: PropTypes.oneOf(Direction),
  data: PropTypes.array,
  onChange: PropTypes.func,
};

StepsCombination.defaultProps = {
  current: 0,
  size: Size.DEFAULT,
  status: Status.PROCESS,
  direction: Direction.HORIZONTAL,
  data: [],
  onChange: () => {},
};

export default StepsCombination;
