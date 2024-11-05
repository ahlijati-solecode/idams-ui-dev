import './EconomicIndicatorForm.scss';
import {
  Card,
  Tooltip,
  Icon,
} from '@solecode/sole-ui';
import { InputNumber } from 'antd';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import CurrencyInputNumber from '../../../../components/CurrencyInputNumber';
import KEY_NAME from '../constants/keyName';

const EconomicIndicatorContent = ({
  projectCategory,
  economicIndicatorForm,
  onChangeFormData,
  onChangeFloatData,
  isProhibitedToSubmit,
  isViewOnly,
}) => {
  useEffect(() => {
    isProhibitedToSubmit();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card body={
      projectCategory === 'BusDev' ?
        (
          <div className="form form-bus-dev">
            <div className="form-field">
              <div className="form-label">Net Present Value (dalam juta dollar)</div>
              <CurrencyInputNumber
                // prefixicon={{ name: 'dollar-sign', size: 14 }}
                prefix={<div className="prefix-custom">MM$</div>}
                placeholder="Input Net Present Value"
                value={String(economicIndicatorForm[KEY_NAME.NET_PRESENT_VALUE])}
                onChange={(e) => onChangeFormData(e.target.value && e.target.value.indexOf('.') === -1 ? `${e.target.value}.00` : e.target.value, KEY_NAME.NET_PRESENT_VALUE)}
                maskOptions={{ integerLimit: 10 }}
                disabled={isViewOnly}
                style={{ paddingLeft: '48px' }}
              />
            </div>
            <div className="form-field">
              <div className="form-label">Profitability Index</div>
              <InputNumber
                placeholder="Input Profitability Index"
                size="large"
                value={economicIndicatorForm[KEY_NAME.PROFITABILITY_INDEX]}
                min="0"
                max="999.99"
                step="0.01"
                disabled={isViewOnly}
                onChange={(e) => {
                  onChangeFloatData(e, KEY_NAME.PROFITABILITY_INDEX);
                }}
              />
            </div>
            <div className="form-field">
              <div className="form-label">
                Internal Rate of Return
                <Tooltip title="Value higher than 999.99 will be set to 999.99" placement="right">
                  <div className="cursor-pointer">
                    <Icon name="info-circle" type="solid" size="14" />
                  </div>
                </Tooltip>
              </div>
              <InputNumber
                placeholder="Input Internal Rate of Return"
                size="large"
                prefix={(
                  <Icon
                    name="percent"
                  />
                )}
                value={economicIndicatorForm[KEY_NAME.INTERNAL_RATE_OF_RETURN]}
                min="0"
                max="999.99"
                step="0.01"
                disabled={isViewOnly}
                onChange={(e) => {
                  let number = e;
                  if (number > 1000.00) number = 999.99;
                  onChangeFloatData(number, KEY_NAME.INTERNAL_RATE_OF_RETURN);
                }}
              />
            </div>
            <div className="form-field">
              <div className="form-label">
                Discounted Pay Out Time
              </div>
              <InputNumber
                placeholder="Input Discounted Pay Out Time"
                size="large"
                addonAfter={(
                  <div>Years</div>
                )}
                value={economicIndicatorForm[KEY_NAME.DISCOUNTED_PAY_OUT_TIME]}
                min="0"
                max="999.99"
                step="0.01"
                disabled={isViewOnly}
                onChange={(e) => {
                  onChangeFloatData(e, KEY_NAME.DISCOUNTED_PAY_OUT_TIME);
                }}
              />
            </div>
          </div>
        )
        :
        (
          <div className="form form-non-bus-dev">
            <div className="form-field">
              <div className="form-label">PV In (dalam juta dollar)</div>
              <CurrencyInputNumber
                prefix={<div className="prefix-custom">MM$</div>}
                placeholder="Input PV In"
                value={String(economicIndicatorForm[KEY_NAME.PV_IN])}
                onChange={(e) => onChangeFormData(e.target.value && e.target.value.indexOf('.') === -1 ? `${e.target.value}.00` : e.target.value, KEY_NAME.PV_IN)}
                maskOptions={{ integerLimit: 10 }}
                disabled={isViewOnly}
                style={{ paddingLeft: '48px' }}
              />
            </div>
            <div className="form-field">
              <div className="form-label">PV Out (dalam juta dollar)</div>
              <CurrencyInputNumber
                prefix={<div className="prefix-custom">MM$</div>}
                placeholder="Input PV Out"
                value={String(economicIndicatorForm[KEY_NAME.PV_OUT])}
                onChange={(e) => onChangeFormData(e.target.value && e.target.value.indexOf('.') === -1 ? `${e.target.value}.00` : e.target.value, KEY_NAME.PV_OUT)}
                maskOptions={{ integerLimit: 10 }}
                disabled={isViewOnly}
                style={{ paddingLeft: '48px' }}
              />
            </div>
            <div className="form-field">
              <div className="form-label">Benefit Cost Ratio</div>
              <InputNumber
                placeholder="Input Benefit Cost Ratio"
                size="large"
                value={economicIndicatorForm[KEY_NAME.BENEFIT_COST_RATIO]}
                min="0"
                max="999.99"
                step="0.01"
                disabled={isViewOnly}
                onChange={(e) => {
                  onChangeFloatData(e, KEY_NAME.BENEFIT_COST_RATIO);
                }}
              />
            </div>
          </div>
        )
    }
    />
  );
};

EconomicIndicatorContent.propTypes = {
  projectCategory: PropTypes.string.isRequired,
  economicIndicatorForm: PropTypes.object.isRequired,
  onChangeFormData: PropTypes.func,
  onChangeFloatData: PropTypes.func,
  isProhibitedToSubmit: PropTypes.func,
  isViewOnly: PropTypes.bool,
};

EconomicIndicatorContent.defaultProps = {
  isViewOnly: false,
  onChangeFormData: () => {},
  onChangeFloatData: () => {},
  isProhibitedToSubmit: () => {},
};

export default EconomicIndicatorContent;
