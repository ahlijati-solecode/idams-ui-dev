import { React, useState, useEffect } from 'react';
import { Icon } from '@solecode/sole-ui';
import MaskedInput from '@biproxi/react-text-mask';
import { createNumberMask } from 'text-mask-addons';
import PropTypes from 'prop-types';
import RenderIf from '../contents/RenderIf';
import './CurrencyInputNumber.scss';

const defaultMaskOptions = {
  prefix: '',
  suffix: '',
  includeThousandsSeparator: true,
  thousandsSeparatorSymbol: ',',
  allowDecimal: true,
  decimalSymbol: '.',
  decimalLimit: 2, // how many digits allowed after the decimal
  integerLimit: 10, // limit length of integer numbers
  allowNegative: false,
  allowLeadingZeroes: true,
};

const CurrencyInputNumber = ({
  maskOptions,
  ...inputProps
}) => {
  const [val, setVal] = useState(inputProps.value);
  const currencyMask = createNumberMask({
    ...defaultMaskOptions,
    ...maskOptions,
  });

  useEffect(() => {
    setVal(inputProps.value);
  }, [inputProps.value]);

  return (
    <div className="solecode-ui-input-number">
      <RenderIf isTrue={inputProps?.prefixicon || inputProps?.prefix}>
        <div className={[
          'input-prefix',
          inputProps?.isError ? 'error' : '',
        ].join('')}
        >
          <Icon
            name={inputProps?.prefixicon?.name}
            size={inputProps?.prefixicon?.size}
            type={inputProps?.prefixicon?.type}
          />
          <RenderIf isTrue={inputProps?.prefix}>
            <div className="prefix-element">
              {inputProps?.prefix}
            </div>
          </RenderIf>
          <MaskedInput
            mask={currencyMask}
            {...inputProps}
          />
        </div>
      </RenderIf>
      <RenderIf isTrue={inputProps?.suffix}>
        <div className={[
          'input-suffix',
          inputProps?.isError ? 'error' : '',
        ].join('')}
        >
          <MaskedInput
            mask={currencyMask}
            {...inputProps}
          />
          <div className="suffix-element">
            {inputProps.suffix}
          </div>
        </div>
      </RenderIf>
      <RenderIf isTrue={[inputProps.prefixIcon, inputProps.suffix].includes(null)}>
        <MaskedInput
          mask={currencyMask}
          onChange={(e) => {
            setVal(e.target.value);
            inputProps.onChange(e);
          }}
          value={val}
          disabled={inputProps.disabled}
          step={inputProps.step}
          min={inputProps.min}
          max={inputProps.max}
        />
      </RenderIf>
    </div>
  );
};

CurrencyInputNumber.propTypes = {
  maskOptions: PropTypes.shape({
    prefix: PropTypes.string,
    suffix: PropTypes.string,
    includeThousandsSeparator: PropTypes.bool,
    thousandsSeparatorSymbol: PropTypes.string,
    allowDecimal: PropTypes.bool,
    decimalSymbol: PropTypes.string,
    decimalLimit: PropTypes.string,
    requireDecimal: PropTypes.bool,
    allowNegative: PropTypes.bool,
    allowLeadingZeroes: PropTypes.bool,
    integerLimit: PropTypes.number,
  }),
  inputProps: PropTypes.object,
};

CurrencyInputNumber.defaultProps = {
  maskOptions: {},
  inputProps: {
    suffix: null,
    prefixIcon: null,
  },
};

export default CurrencyInputNumber;
