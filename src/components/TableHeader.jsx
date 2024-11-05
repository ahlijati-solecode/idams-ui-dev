import PropTypes from 'prop-types';
import './TableHeader.scss';

const TableHeader = ({ children }) => (
  <div className="solecode-ui-table-header">
    {children}
  </div>
);

TableHeader.propTypes = {
  children: PropTypes.any,
};

TableHeader.defaultProps = {
  children: <></>,
};

export default TableHeader;
