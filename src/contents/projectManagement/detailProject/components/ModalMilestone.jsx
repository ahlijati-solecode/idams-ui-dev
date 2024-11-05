import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import moment from 'moment';
import { ViewMode, Gantt } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';

import { Modal } from 'antd';
import { Tag, Button, Icon, SelectSearch } from '@solecode/sole-ui';
import RenderIf from '../../../RenderIf';
import './ModalMilestone.scss';

import { DEFAULT_MODAL_MILESTONE_VIEW_MODE_OPTIONS, DEFAULT_PROJECT_MILESTONE_FILTER_LIST } from '../constants/enums';
import useProjectManagementApi from '../../../../hooks/api/projectManagement';

const getDateDiff = (start, end) => moment(end).businessDiff(moment(start), 'day') + 1;

export const TaskListHeaderDefault = () => (
  <div className="row">
    <div className="column-head">
      {' '}
      Workflow
    </div>
    <div className="column-head">
      Start
    </div>
    <div className="column-head">
      End
    </div>
    <div className="column-head">
      SLA (Working Days)
    </div>
  </div>
);

export const TaskListTableDefault = ({ rowHeight, tasks }) => tasks && tasks?.map((t, index) => (
  <div
    className="row"
    style={{ height: rowHeight, display: 'flex' }}
      // eslint-disable-next-line react/no-array-index-key
    key={`${t.workflowSequenceId}-row-task-${index}`}
  >
    <div
      className="column-body"
      title={t.name}
    >
      {t.name}
    </div>
    <div className="column-body">
      {t.start ? moment.utc(t.start, 'YYYY-MM-DD').clone().local().format('DD MMM YYYY') : '-'}
    </div>
    <div className="column-body">
      {t.end ? moment.utc(t.end, 'YYYY-MM-DD').clone().local().format('DD MMM YYYY') : '-'}
    </div>
    <div className="column-body">
      <Icon name="calendar-clock" />
      {' '}
      {getDateDiff(t.start, t.end) || '-'}
      {' '}
      {Number(getDateDiff(t.start, t.end)) > 1 ? 'Days' : 'Day'}
    </div>
  </div>
));

TaskListTableDefault.propTypes = {
  rowHeight: PropTypes.number,
  task: PropTypes.array,
};

TaskListTableDefault.defaultProps = {
  rowHeight: 0,
  task: [],
};

const TooltipContent = ({ task }) => (
  <div className="milestone-tooltip">
    <div className="title">
      {task?.name}
    </div>

    <div className="date">
      {task.start ? moment.utc(task.start, 'YYYY-MM-DD').clone().local().format('DD MMM YYYY') : '-'}
      {' - '}
      {task.end ? moment.utc(task.end, 'YYYY-MM-DD').clone().local().format('DD MMM YYYY') : '-'}
    </div>
    <div className="sla">
      <Icon name="calendar-clock" />
      {' '}
      {getDateDiff(task.start, task.end) || '-'}
      {' '}
      {Number(getDateDiff(task.start, task.end)) > 1 ? 'Days' : 'Day'}
    </div>
  </div>
);

TooltipContent.propTypes = {
  task: PropTypes.object,
};

TooltipContent.defaultProps = {
  task: {},
};

const RenderGantt = ({ tasks, getBarColor, view }) => {
  const [showMonth, setShowMonth] = useState(true);
  let columnWidth = 60;
  const columnHeight = 87;
  if (view === ViewMode.Month) {
    columnWidth = 200;
  } else if (view === ViewMode.Week) {
    columnWidth = 75;
  }

  const constructTasks = () => tasks?.map((t) => ({
    start: new Date(t.startDate),
    end: new Date(moment(t.endDate).add(23, 'h')),
    name: t.workflowName,
    id: t.workflowSequenceId,
    styles: {
      backgroundColor: getBarColor(t.workflowCategory, t.done === 'true'),
      backgroundSelectedColor: getBarColor(t.workflowCategory, t.done === 'true'),
    },
    isDisabled: true,
  }));

  const getFirstMonth = () => {
    setShowMonth(true);
    if (view !== ViewMode.Week) return;
    const el = document.getElementsByClassName('calendarTop');
    const lastEl = el[el?.length - 1].getBoundingClientRect();
    const getDistanceFromLeft = Math.ceil(lastEl.left);
    if (getDistanceFromLeft > 912) return;
    setShowMonth(false);
  };

  useEffect(() => {
    if (!tasks?.length) return;
    constructTasks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  useEffect(() => {
    getFirstMonth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  return (
    <div className="milestone-gantt">
      <RenderIf isTrue={view === ViewMode.Week && !showMonth}>
        <div className="hidden-month" />
      </RenderIf>
      <RenderIf isTrue={view === ViewMode.Week}>
        <div className="hidden-week" />
      </RenderIf>
      <Gantt
        tasks={constructTasks()}
        viewMode={view}
        columnWidth={columnWidth}
        TaskListTable={TaskListTableDefault}
        TaskListHeader={TaskListHeaderDefault}
        headerHeight={columnHeight}
        barCornerRadius={8}
        todayColor="#e5f0fe"
        fontSize={14}
        TooltipContent={TooltipContent}
        listCellWidth={1055}
      />
      <div className="modal-milestone-footer">
        <div className="stage">
          <Icon
            name="circle-info"
            size={20}
          />
          <span>Stage:</span>
        </div>
        <div className="stage-list">
          <div className="inisiasi">
            Inisiasi
          </div>
          <div className="seleksi">
            Seleksi
          </div>
          <div className="kajian-lanjut">
            Kajian Lanjut
          </div>
          <div className="completed">
            Completed
          </div>
        </div>
      </div>
    </div>

  );
};

RenderGantt.propTypes = {
  tasks: PropTypes.array,
  getBarColor: PropTypes.func,
  view: PropTypes.string,
};

RenderGantt.defaultProps = {
  tasks: [],
  getBarColor: () => null,
  view: ViewMode.Week,
};

const ModalMilestone = ({ visible, setVisible, projectData }) => {
  const htmlData = document.getElementById('product-detail-milestone');
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const projectVersion = searchParams.get('projectVersion');

  const [filter, setFilter] = useState('All Stage');
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [milestones, setMilestones] = useState([]);
  const [viewMode, setViewMode] = useState('Week');

  const { getMilestone } = useProjectManagementApi();

  const getMilestoneAction = async () => {
    try {
      const res = await getMilestone({ projectId, projectVersion });
      if (res?.data?.code !== 200) {
        // eslint-disable-next-line no-alert
        window.alert('Something went wrong.');
        return;
      }
      setMilestones(res.data.data.milestone);
      // constructDefaultGantt(res.data.data.milestone);
    } catch (e) {
      console.error(e);
    }
  };

  const getMilestones = () => filter === DEFAULT_PROJECT_MILESTONE_FILTER_LIST[0].value
    ? [...milestones] : [...milestones?.filter((m) => m.workflowCategory === filter)];

  const handleChangeFilter = (filerType) => {
    setFilter(filerType);
  };

  const handleSaveAsImage = () => {
    setIsLoadingSave(true);

    const elementId = 'product-detail-milestone-table-gantt';
    const element = document.getElementById(elementId);
    element.style.overflow = 'unset';
    const tableWidth = element.offsetWidth;

    const modalElementId = 'product-detail-milestone';
    const modalElement = document.getElementById(modalElementId);
    modalElement.style.overflow = 'auto';

    toPng(modalElement, { width: tableWidth })
      .then((dataUrl) => {
        setIsLoadingSave(false);
        download(dataUrl, `Milestone ${projectData?.title} - ${projectData?.zona} - ${projectData?.regional} - RKAP ${projectData?.rkap} - ${filter}.png`);
        element.style.overflow = 'auto';
        modalElement.style.overflow = 'unset';
      });
  };

  const getBarColor = (workflowCategory, isDone) => {
    if (isDone) {
      return '#d9d9d9';
    }
    switch (workflowCategory) {
      case 'Inisiasi':
        return '#3c6db2';
      case 'Seleksi':
        return '#accd08';
      case 'Kajian Lanjut':
        return '#ba313b';
      default:
        return '#d9d9d9';
    }
  };

  const handleScroll = (left) => {
    const el = document.getElementById('product-detail-milestone-table-gantt');
    const scrollPosition = el.scrollLeft;
    const offset = 200;

    let newScrollPosition = scrollPosition - offset < 0 ? 0 : scrollPosition - offset;

    if (!left) {
      newScrollPosition = scrollPosition + offset;
    }

    el.scroll(newScrollPosition, 0);
  };

  const handleKeyDown = (e) => {
    if (e.keyCode !== 37 && e.keyCode !== 39) {
      return;
    }

    handleScroll(e.keyCode === 37);
  };

  const resetScroll = () => {
    setTimeout(() => {
      const el = document.getElementById('product-detail-milestone-table-gantt');

      el.scroll(0, 0);
    }, 1);
  };

  useEffect(() => {
    if (!visible) return;

    resetScroll();
    getMilestoneAction();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal
      title={(
        <div className="modal-milestone-title">
          View Milestone
        </div>
      )}
      centered
      visible={visible}
      onCancel={() => setVisible()}
      type="default"
      width="90%"
      footer={<></>}
    >
      <div
        className="modal-milestone"
        id="product-detail-milestone"
      >
        <div
          className="header"
          style={{
            width: htmlData?.offsetWidth || '100%',
            backgroundColor: isLoadingSave ? '#fff' : '#fafafa',
            border: isLoadingSave ? 'none' : 'solid 1px rgba(38, 38, 38, 0.1)',
          }}
        >
          <div className="summary">
            <div className="summary-title">
              <h3>{projectData?.title}</h3>
            </div>
            <div className="summary-subtitle">
              <div className="summary-threshold">
                <span className={`dot dot-color-${projectData?.threshold.toLowerCase()}`} />
                <span>{projectData?.threshold}</span>
              </div>
              <span className="text-bold text-color-tomato">{`${projectData?.zona} - ${projectData?.regional}`}</span>
              <span className="text-bold">{`RKAP ${projectData?.rkap}`}</span>
              <RenderIf isTrue={isLoadingSave}>
                <Tag
                  text={`${filter} ✔ `}
                />
              </RenderIf>
            </div>
          </div>

          <div className="filter-list">
            <RenderIf isTrue={!isLoadingSave}>
              {DEFAULT_PROJECT_MILESTONE_FILTER_LIST.map((f) => (
                <div
                  className={`filter-item ${f.value === filter ? 'active' : ''}`}
                  key={`filter-item ${f.value}`}
                  onClick={() => handleChangeFilter(f.value)}
                  aria-hidden
                >
                  <Tag
                    text={`${f.label}${f.value === filter ? ' ✔' : ''}`}
                  />
                </div>
              ))}

              <SelectSearch
                options={DEFAULT_MODAL_MILESTONE_VIEW_MODE_OPTIONS}
                placeholder="Select Threshold"
                size="small"
                value={viewMode}
                onChange={(e) => setViewMode(e)}
              />

              <Button
                label="Save as Image"
                type="primary"
                size="large"
                primaryIcon={(
                  <Icon
                    name="image"
                    size={20}
                  />
            )}
                onClick={() => handleSaveAsImage()}
              />
            </RenderIf>

          </div>
        </div>

        <div
          className="table-milestone"
          id="product-detail-milestone-table-gantt"
          style={{
            padding: isLoadingSave ? '24px' : 0,
            marginTop: isLoadingSave ? 0 : '24px',
          }}
        >
          <RenderIf isTrue={getMilestones()?.length > 0}>
            <RenderGantt tasks={getMilestones()} getBarColor={getBarColor} view={viewMode} />
          </RenderIf>
        </div>
      </div>

    </Modal>
  );
};

ModalMilestone.propTypes = {
  visible: PropTypes.bool,
  setVisible: PropTypes.func,
  projectData: PropTypes.object,
};

ModalMilestone.defaultProps = {
  visible: false,
  setVisible: () => {},
  projectData: {},
};

export default ModalMilestone;
