import PropTypes from 'prop-types';
import './HeaderBanner.scss';

function HeaderBanner({ title, breadcrumb, action, type }) {
  return (
    <div className={`header-banner ${type}`}>
      <div className="menu">
        {breadcrumb}
        <div className="title">{title}</div>
      </div>
      {action}
    </div>
  );
}

HeaderBanner.propTypes = {
  title: PropTypes.string,
  breadcrumb: PropTypes.any,
  action: PropTypes.any,
  type: PropTypes.string,
};

HeaderBanner.defaultProps = {
  title: '',
  breadcrumb: <></>,
  action: <></>,
  type: 'default',
};

export default HeaderBanner;
