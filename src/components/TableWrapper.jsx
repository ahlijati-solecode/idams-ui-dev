import PropTypes from 'prop-types';
import './TableWrapper.scss';

const TableWrapper = ({ children }) => (
  <div className="solecode-ui-table-wrapper">
    {children}
  </div>
);

TableWrapper.propTypes = {
  children: PropTypes.any,
};

TableWrapper.defaultProps = {
  children: <></>,
};

export default TableWrapper;
