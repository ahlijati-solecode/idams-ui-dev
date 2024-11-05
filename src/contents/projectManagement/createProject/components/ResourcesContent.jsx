import './ResourcesForm.scss';
import { useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Card,
} from '@solecode/sole-ui';
import { Input } from 'antd';
import KEY_NAME from '../constants/keyName';
import CurrencyInputNumber from '../../../../components/CurrencyInputNumber';

const ResourcesContent = ({
  form,
  onChangeForm,
  isViewOnly,
}) => {
  // const formatedInput = (text) => text
  //   .replace(/[^0-9.]/g, '')
  //   .replace(/\.{2,}/g, '.')
  //   .replace(/^0*([^0]\d*\.\d{1,2}).*/g, '$1')
  //   .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  useEffect(() => {
    if (!form[KEY_NAME.OIL] || !form[KEY_NAME.GAS]) return;
    const calculateOilEquivalent = Number(String(form[KEY_NAME.OIL])?.replace(/[^.0-9.]/g, '')) + (Number(String(form[KEY_NAME.GAS])?.replace(/[^.0-9.]/g, '')) * 0.17);
    const result = Math.round(calculateOilEquivalent * 100) / 100;

    onChangeForm(String(result)?.indexOf('.') === -1 ? `${result}.00` : result, KEY_NAME.OIL_EQUIVALENT);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form[KEY_NAME.OIL], form[KEY_NAME.GAS]]);

  return (
    <Card body={(
      <div className="form form-resources">
        <div className="row">
          <div className="form-field">
            <div className="form-label">Oil</div>
            <CurrencyInputNumber
              placeholder="Input Oil"
              size="large"
              min={0}
              suffix={<div className="suffix-custom">MMBO</div>}
              value={String(form[KEY_NAME.OIL])}
              onChange={(e) => onChangeForm(e.target.value, KEY_NAME.OIL)}
              maskOptions={{ integerLimit: 7 }}
              disabled={isViewOnly}
            />
          </div>

          <div className="form-field">
            <div className="form-label">Gas</div>
            <CurrencyInputNumber
              placeholder="Input Gas"
              size="large"
              min={0}
              suffix={<div className="suffix-custom">BSCF</div>}
              value={String(form[KEY_NAME.GAS])}
              onChange={(e) => onChangeForm(e.target.value, KEY_NAME.GAS)}
              maskOptions={{ integerLimit: 7 }}
              disabled={isViewOnly}
            />
          </div>

          <div className="form-field">
            <div className="form-label">Oil Equivalent</div>
            <Input
              placeholder="Input Oil Equivalent"
              size="large"
              type="text"
              min={0}
              suffix={<div>MMBOE</div>}
              value={form[KEY_NAME.OIL_EQUIVALENT] ? form[KEY_NAME.OIL_EQUIVALENT].toLocaleString('en-US') : null}
              disabled
            />
          </div>
        </div>
      </div>
    )}
    />
  );
};

ResourcesContent.propTypes = {
  form: PropTypes.object,
  onChangeForm: PropTypes.func,
  isViewOnly: PropTypes.bool,
};

ResourcesContent.defaultProps = {
  form: {},
  onChangeForm: () => {},
  isViewOnly: false,
};

export default ResourcesContent;
