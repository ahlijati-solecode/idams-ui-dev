import './EconomicIndicatorForm.scss';
import {
  Tooltip,
  Icon,
} from '@solecode/sole-ui';
import PropTypes from 'prop-types';
import EconomicIndicatorContent from './EconomicIndicatorContent';

const EconomicIndicatorForm = ({
  projectCategory,
  economicIndicatorForm,
  onChangeFormData,
  onChangeFloatData,
  isProhibitedToSubmit,
  isViewOnly,
}) => (
  <div className="economic-indicator-form form">
    <h2 className="form-title">
      <div>Economic Indicator</div>
      <Tooltip title="Pertamina Portion" placement="right">
        <div className="cursor-pointer">
          <Icon name="info-circle" type="solid" size="16" />
        </div>
      </Tooltip>
      <div className="project-category">{projectCategory === 'BusDev' ? 'Business Development' : 'Non Business Development'}</div>
    </h2>

    <EconomicIndicatorContent
      projectCategory={projectCategory}
      economicIndicatorForm={economicIndicatorForm}
      onChangeFormData={onChangeFormData}
      onChangeFloatData={onChangeFloatData}
      isProhibitedToSubmit={isProhibitedToSubmit}
      isViewOnly={isViewOnly}
    />
  </div>
);

EconomicIndicatorForm.propTypes = {
  projectCategory: PropTypes.string,
  economicIndicatorForm: PropTypes.object,
  onChangeFormData: PropTypes.func,
  onChangeFloatData: PropTypes.func,
  isProhibitedToSubmit: PropTypes.func,
  isViewOnly: PropTypes.bool,
};

EconomicIndicatorForm.defaultProps = {
  onChangeFloatData: () => {},
  onChangeFormData: () => {},
  projectCategory: null,
  isViewOnly: false,
  economicIndicatorForm: {},
  isProhibitedToSubmit: () => {},
};

export default EconomicIndicatorForm;
