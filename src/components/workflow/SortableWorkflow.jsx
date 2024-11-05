import PropTypes from 'prop-types';
import DragAndDrop from '../DragAndDrop';
import SortableWorkflowContainer from './SortableWorkflowContainer';
import './SortableWorkflow.scss';

const dataType = {
  Inisiasi: {
    title: 'INISIASI',
    headerStyle: 'header__inisiasi',
  },
  Seleksi: {
    title: 'SELEKSI',
    headerStyle: 'header__seleksi',
  },
  KLanjut: {
    title: 'KAJIAN LANJUT',
    headerStyle: 'header__kajian-lanjut',
  },
};

function SortableWorkflow(props) {
  const {
    type,
    isSortable,
    items,
    headerAction,
    updateWorkflowData,
    workflowDetail,
    deleteWorkflow,
  } = props;
  return (
    <div className="sortable-workflow">
      <div className={`sortable-workflow__header ${dataType[type].headerStyle}`}>
        <div className="sortable-workflow__title">{dataType[type].title}</div>
        {headerAction()}
      </div>

      {items?.length > 0 && (
        <DragAndDrop>
          <SortableWorkflowContainer
            type={type}
            headerAction={headerAction}
            items={items}
            isSortable={isSortable}
            updateWorkflowData={updateWorkflowData}
            workflowDetail={workflowDetail}
            deleteWorkflow={deleteWorkflow}
          />
        </DragAndDrop>
      )}

      {items?.length === 0 && (
      <SortableWorkflowContainer
        type={type}
        headerAction={headerAction}
        items={items}
        isSortable={isSortable}
        updateWorkflowData={updateWorkflowData}
        workflowDetail={workflowDetail}
        deleteWorkflow={deleteWorkflow}
      />
      )}
    </div>

  );
}
SortableWorkflow.propTypes = {
  type: PropTypes.string,
  isSortable: PropTypes.bool,
  items: PropTypes.array,
  headerAction: PropTypes.func,
  updateWorkflowData: PropTypes.func,
  workflowDetail: PropTypes.object,
  deleteWorkflow: PropTypes.func,
};

SortableWorkflow.defaultProps = {
  type: 'Inisiasi',
  isSortable: false,
  items: [],
  headerAction: () => [],
  updateWorkflowData: () => {},
  workflowDetail: {},
  deleteWorkflow: () => {},
};

export default SortableWorkflow;
