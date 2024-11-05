import { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import PropTypes from 'prop-types';
import { Icon, Tag } from '@solecode/sole-ui';
import './CardWorkflow.scss';
import Popover from '../Popover';
import { truncateString } from '../../libs/stringUtils';

function CardWorkflow({ id, data, index, moveCard, type, isSortable, onDelete, onEdit }) {
  const ref = useRef(null);
  const [isOpenPopOver, setIsOpenPopOver] = useState(false);

  const [{ handlerId }, drop] = useDrop({
    accept: 'card',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex);
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    item: { index, id, type: 'card' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: isSortable,
  });

  const opacity = isDragging ? 0 : 1;

  drag(drop(ref));

  const countDocs = (documents) => documents?.reduce((a, b) => a + b.docList.length, 0) || 0;

  const DocsContent = () => (
    <div className="card-docs__popover">
      <div className="card-docs__header">
        <div className="header-title">
          List Documents
        </div>

        <div
          className="icon-close"
          onClick={() => setIsOpenPopOver(false)}
          aria-hidden="true"
        >
          <Icon name="x" />
        </div>
      </div>
      <div className="card-docs__content">
        { !data?.documents && <div>Belum ada Dokumen</div>}
        { data?.documents?.map((document, idx1) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={`${idx1}-${type}-docs`}>
            <div className="card-docs__title">
              {document.groupName}
            </div>
            <div className="card-docs__list">
              <ul>
                {document.docList?.map((item, idx2) => (
                  <li
                // eslint-disable-next-line react/no-array-index-key
                    key={`${idx1}-${type}-docs-item-${idx2}`}
                  >
                    {item}
                  </li>
                ))}
              </ul>

            </div>

          </div>
        ))}
      </div>

    </div>
  );

  const CardContentDefault = () => (
    <div className="card-content">
      <div className="card-header">
        <div className="card-action">
          <div
            className="icon-edit"
            onClick={() => onEdit('edit', data)}
            aria-hidden="true"
          >
            <Icon name="pencil" />
          </div>
        </div>
      </div>
      <div className="card-title" title="Project Initiation">Project Initiation</div>

      <div className="card-footer">
        <div className="card-sla">
          <Icon name="calendar-clock" />
          <div>
            {data.sla}
            {' '}
            Day(s)
          </div>
        </div>
        <div className="card-docs">
          <Popover
            content={<DocsContent />}
            placement="rightTop"
            visible={isOpenPopOver}
            onVisibleChange={setIsOpenPopOver}
          >
            <div>
              <Tag
                iconName="folders"
                text={`${countDocs(data?.documents)} Docs`}
                iconSize="12"
                iconType="solid"
              />
            </div>
          </Popover>
        </div>
      </div>
    </div>
  );

  const CardContent = () => (
    <div className="card-content">
      <div className="card-header">
        <div className="card-title" title={data.workflowName}>{truncateString(data.workflowName, 30)}</div>
        <div className="card-action">
          <div
            className="icon-edit"
            onClick={() => onEdit('edit', data)}
            aria-hidden="true"
          >
            <Icon name="pencil" />
          </div>

          <div
            className="icon-edit"
            onClick={() => onDelete(data)}
            aria-hidden="true"
          >
            <Icon name="trash" />
          </div>
        </div>
      </div>

      <div className="card-description" title={data.workflowType}>{truncateString(data.workflowType, 80)}</div>

      <div className="card-footer">
        <div className="card-sla">
          <Icon name="calendar-clock" />
          <div>
            {data.sla}
            {' '}
            Day(s)
          </div>
        </div>
        <div className="card-docs">
          <Popover
            content={<DocsContent />}
            placement="rightTop"
            visible={isOpenPopOver}
            onVisibleChange={setIsOpenPopOver}
          >
            <div>
              <Tag
                iconName="folders"
                text={`${countDocs(data?.documents)} Docs`}
                iconSize="12"
                iconType="solid"
              />
            </div>
          </Popover>
        </div>
      </div>
    </div>
  );

  return (
    <div
      ref={ref}
      className={`card-workflow ${type}`}
      style={{ opacity, cursor: isSortable ? 'move' : 'pointer' }}
      data-handler-id={handlerId}
    >
      {type === 'default' ? <CardContentDefault /> : <CardContent />}
    </div>
  );
}

CardWorkflow.propTypes = {
  id: PropTypes.any,
  data: PropTypes.object,
  index: PropTypes.number,
  moveCard: PropTypes.func,
  type: PropTypes.string,
  isSortable: PropTypes.bool,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
};

CardWorkflow.defaultProps = {
  id: '',
  data: {},
  index: 0,
  moveCard: () => {},
  type: '',
  isSortable: false,
  onDelete: () => {},
  onEdit: () => {},
};

export default CardWorkflow;
