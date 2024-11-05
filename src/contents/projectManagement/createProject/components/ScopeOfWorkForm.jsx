import './ScopeOfWorkForm.scss';
import PropTypes from 'prop-types';
import ScopeOfWorkContent from './ScopeOfWorkContent';

const ScopeOfWorkForm = ({
  form,
  onChangeForm,
  isViewOnly,
}) => (
  <div className="project-sow-form form">
    <h2 className="form-title">Scope Of Work</h2>

    <ScopeOfWorkContent
      form={form}
      onChangeForm={onChangeForm}
      isViewOnly={isViewOnly}
    />
  </div>
);

ScopeOfWorkForm.propTypes = {
  form: PropTypes.object,
  onChangeForm: PropTypes.func,
  isViewOnly: PropTypes.bool,
};

ScopeOfWorkForm.defaultProps = {
  form: {},
  onChangeForm: () => {},
  isViewOnly: false,
};

export default ScopeOfWorkForm;
