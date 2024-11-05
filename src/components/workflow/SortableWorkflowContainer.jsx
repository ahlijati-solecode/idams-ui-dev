import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import update from 'immutability-helper';
import { Icon, Button } from '@solecode/sole-ui';
import { Modal } from 'antd';
import CardWorkflow from './CardWorkflow';
import './SortableWorkflowContainer.scss';

let timer = null;
function SortableWorkflowContainer({
  type,
  isSortable,
  items,
  headerAction,
  updateWorkflowData,
  workflowDetail,
  deleteWorkflow,
}) {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [defaultCard, setDefaultCard] = useState([]);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [selectedData, setSelectedData] = useState();

  const moveCard = useCallback((dragIndex, hoverIndex) => {
    setCards((prevCards) => {
      const tempData = prevCards[dragIndex];
      const data = update(prevCards, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, tempData],
        ],
      });
      if (timer) { clearTimeout(timer); }
      timer = setTimeout(() => updateWorkflowData([...defaultCard, ...data]), 1000);

      return data;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCard]);

  useEffect(() => {
    setCards([]);
    if (items?.length <= 0) return;
    if (type === 'Inisiasi') {
      setDefaultCard([items[0]]);
      setCards(items.slice(1, items.length));
    } else {
      setCards(items);
    }
  }, [items, items?.length, type]);

  const goToWorkflowTemplate = (action, data) => {
    switch (action) {
      case 'edit':
        navigate({
          pathname: '/administration/workflow-settings/details/template',
          search: `?workflowId=${data.workflowId}&workflowSequenceId=${data.workflowSequenceId}&templateId=${workflowDetail.templateId}&templateVersion=${workflowDetail.templateVersion}&stage=${type}`,
        });
        break;
      default:
        navigate({
          pathname: '/administration/workflow-settings/details/template',
          search: `?templateId=${workflowDetail.templateId}&templateVersion=${workflowDetail.templateVersion}&stage=${type}`,
        });
    }
  };

  const toggleDeleteModal = (data) => {
    setIsOpenDeleteModal(true);
    setSelectedData(data);
  };

  const deleteAction = () => {
    deleteWorkflow(selectedData.workflowSequenceId);
    setIsOpenDeleteModal(false);
  };

  const renderCard = useCallback(
    (card, index, isCardSortable, cardType) => (
      <CardWorkflow
        key={`${card.templateId}-${card.workflowSequenceId}-${card.order}`}
        index={index}
        id={card.workflowSequenceId}
        data={card}
        moveCard={moveCard}
        isSortable={isCardSortable}
        headerAction={headerAction}
        type={cardType}
        onEdit={(action, data) => goToWorkflowTemplate(action, data)}
        onDelete={(value) => toggleDeleteModal(value)}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [headerAction],
  );

  const EmptyCard = () => (
    <div className="card-empty">
      <div className="card-empty__content">
        <div className="card-empty__title">
          There aren’t any workflow yet.
        </div>
        <div className="card-empty__desc">
          Start add new workflow.
        </div>
      </div>
    </div>
  );

  const DeleteModal = () => (
    <Modal
      className="rounded-confirm-modal"
      centered
      visible={isOpenDeleteModal}
      footer={null}
    >
      <div className="modal-delete">
        <div className="modal-header">
          <Icon name="trash-can" type="regular" size="48" />
          <div style={{ margin: '16px 0px 8px' }}>
            Delete Confirmation
          </div>
        </div>

        <div className="modal-content">
          <div style={{ marginBottom: '8px' }}>
            Are you sure you want to delete this workflow?
          </div>
          <div className="light-text">
            This action can’t be undone.
          </div>
        </div>

        <div style={{ marginTop: '24px' }} className="modal-footer">
          <Button
            onClick={() => setIsOpenDeleteModal(false)}
            label="Cancel"
            size="large"
            type="secondary"
          />
          <Button
            onClick={() => deleteAction()}
            label="Delete"
            size="large"
            type="danger"
          />
        </div>
      </div>
    </Modal>
  );

  return (
    <div className="sortable-workflow-container">
      <DeleteModal />
      {!!defaultCard?.length && renderCard(defaultCard[0], 0, false, 'default')}

      {!!cards?.length && cards.map((card, i) => renderCard(card, i, isSortable, ''))}
      {!defaultCard?.length && !cards?.length && <EmptyCard />}

      <div
        className="button-add"
        onClick={() => goToWorkflowTemplate('add', {})}
        aria-hidden="true"
      >
        <Icon name="circle-plus" type="solid" />
        Add New Workflow
      </div>
    </div>
  );
}

SortableWorkflowContainer.propTypes = {
  type: PropTypes.string,
  isSortable: PropTypes.bool,
  items: PropTypes.array,
  headerAction: PropTypes.func,
  updateWorkflowData: PropTypes.func,
  workflowDetail: PropTypes.object,
  deleteWorkflow: PropTypes.func,
};

SortableWorkflowContainer.defaultProps = {
  type: 'Inisiasi',
  isSortable: false,
  items: [],
  headerAction: () => [],
  updateWorkflowData: () => {},
  workflowDetail: {},
  deleteWorkflow: () => {},
};

export default SortableWorkflowContainer;
