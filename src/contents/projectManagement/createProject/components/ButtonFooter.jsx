import PropTypes from 'prop-types';
import {
  Button,
  Icon,
} from '@solecode/sole-ui';

import RenderIf from '../../../RenderIf';

import './ButtonFoter.scss';

const ButtonFooter = ({
  item,
  index,
  onClick,
  disableNext,
  isViewOnly,
  isLoading,
  isTemplateLocked,
}) => {
  const primaryIconCondition = () => {
    let res = <Icon name="spinner-third" spin size={24} />;

    if (!isLoading || item.length === index + 1) res = null;
    if (index === 2 && !isTemplateLocked) res = null;

    return res;
  };

  const disabledCondition = () => {
    let res = false;

    if (item.length !== index + 1) res = isLoading;
    if (index === 2 && isTemplateLocked) res = isLoading;

    return res;
  };

  return (
    <div className={index !== 0 ? 'button-footer-component' : 'button-footer-component flex-reverse'}>
      <RenderIf isTrue={index !== 0}>
        <Button
          type="secondary"
          size="large"
          label={`Previous | ${item[index - 1]?.label}`}
          primaryIcon={<Icon name="angle-left" type="solid" />}
          onClick={() => onClick(index - 1)}
        />
      </RenderIf>
      <RenderIf isTrue={item.length !== index + 1 || !isViewOnly}>
        <div className="btn-next-wrapper">
          <RenderIf isTrue={item.length === index + 1 && !isViewOnly}>
            <div className="notes">
              <Icon name="circle-info" type="solid" />
              Project can be initiated after all milestones have been set
            </div>
          </RenderIf>
          <Button
            type="primary"
            size="large"
            label={item.length === index + 1 ? 'Initiate Project' : `Next | ${item[index + 1]?.label}`}
            primaryIcon={primaryIconCondition()}
            secondaryIcon={<Icon name={item.length === index + 1 ? 'check' : 'angle-right'} type="solid" />}
            // disabled={(item.length !== index + 1 ? isLoading : false) || disableNext}
            disabled={disabledCondition() || disableNext}
            onClick={() => onClick(index + 1)}
          />
        </div>
      </RenderIf>
    </div>
  );
};

ButtonFooter.propTypes = {
  item: PropTypes.array,
  index: PropTypes.number,
  onClick: PropTypes.func,
  disableNext: PropTypes.bool,
  isViewOnly: PropTypes.bool,
  isLoading: PropTypes.bool,
  isTemplateLocked: PropTypes.bool,
};

ButtonFooter.defaultProps = {
  item: [],
  index: 0,
  onClick: () => {},
  disableNext: false,
  isViewOnly: false,
  isLoading: false,
  isTemplateLocked: false,
};

export default ButtonFooter;
