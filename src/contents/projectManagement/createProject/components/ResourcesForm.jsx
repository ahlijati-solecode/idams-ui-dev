import './ResourcesForm.scss';
import PropTypes from 'prop-types';

import {
  Tooltip,
  Icon,
} from '@solecode/sole-ui';
import ResourcesContent from './ResourcesContent';

const ResourcesForm = ({
  form,
  onChangeForm,
  isViewOnly,
}) => (
  <div className="project-resources-form form">
    <h2 className="form-title">
      <div>2C Resources</div>
      <Tooltip title="Pertamina Portion" placement="right">
        <div className="cursor-pointer">
          <Icon name="info-circle" type="solid" size="16" />
        </div>
      </Tooltip>
    </h2>

    <ResourcesContent
      form={form}
      onChangeForm={onChangeForm}
      isViewOnly={isViewOnly}
    />
  </div>
);

ResourcesForm.propTypes = {
  form: PropTypes.object,
  onChangeForm: PropTypes.func,
  isViewOnly: PropTypes.bool,
};

ResourcesForm.defaultProps = {
  form: {},
  onChangeForm: () => {},
  isViewOnly: false,
};

export default ResourcesForm;
