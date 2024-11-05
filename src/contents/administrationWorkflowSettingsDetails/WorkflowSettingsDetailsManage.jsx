import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import SortableWorkflow from '../../components/workflow/SortableWorkflow';
import './WorkflowSettingsDetailsManage.scss';

const DEFAULT_GROUP_WORKFLOW = {
  Inisiasi: [],
  Seleksi: [],
  KLanjut: [],
};

function WorkflowSettingsDetailsManage({
  workflowDetail,
  setUpdatedWorkflow,
  deleteWorkflow,
}) {
  const [totalWorkflow, setTotalWorkflow] = useState(0);
  const [totalWorkflowSLA, setTotalWorkflowSLA] = useState(0);
  const [groupWorkflow, setGroupWorkflow] = useState(DEFAULT_GROUP_WORKFLOW);
  const [workflowSequence, setWorkflowSequence] = useState(null);

  const constructGroupWorkflow = () => {
    let totalSLA = 0;
    setGroupWorkflow({
      Inisiasi: workflowSequence.filter((i) => i.workflowCategory === 'Inisiasi'),
      Seleksi: workflowSequence.filter((i) => i.workflowCategory === 'Seleksi'),
      KLanjut: workflowSequence.filter((i) => i.workflowCategory === 'KLanjut'),
    });
    workflowSequence.forEach((i) => { totalSLA += i.sla; });
    setTotalWorkflowSLA(totalSLA);
  };

  const constructWorkflow = (type, value) => {
    let result = [];
    const workflows = { ...groupWorkflow };
    workflows[type] = value;
    result = [
      ...workflows.Inisiasi,
      ...workflows.Seleksi,
      ...workflows.KLanjut,
    ].map((i, index) => ({ ...i, order: index + 1 }));

    setUpdatedWorkflow(result);
  };

  const getTotalSLAByStage = (stage) => groupWorkflow[stage]?.reduce((a, b) => a + b.sla, 0) || 0;

  useEffect(() => {
    if (!workflowDetail) return;
    setTotalWorkflow(workflowDetail.totalWorkflow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setWorkflowSequence(workflowDetail.workflowSequence || []);
    setUpdatedWorkflow(workflowDetail.workflowSequence || []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowDetail]);

  useEffect(() => {
    if (!workflowSequence?.length) return;

    constructGroupWorkflow();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowSequence]);

  if (!workflowDetail) return null;

  return (
    <div className="workflow-settings-detail-manage">
      <div className="header-manage">
        <h2 className="title">Project Workflow</h2>
        <div className="info">
          <div>
            Total SLA:&nbsp;
            <strong>
              {totalWorkflowSLA}
              {' '}
              Days
            </strong>
          </div>

          <div>
            Total Workflow:&nbsp;
            <strong>
              {totalWorkflow}
              {' '}
              Workflows
            </strong>
          </div>
        </div>
      </div>
      <div className="divider" />
      <div className="container">
        <SortableWorkflow
          type="Inisiasi"
          isSortable
          headerAction={() => (
            <div className="header-action">
              Total SLA:&nbsp;
              <strong>
                {getTotalSLAByStage('Inisiasi')}
                {' '}
                Days
              </strong>
            </div>
          )}
          items={groupWorkflow.Inisiasi}
          updateWorkflowData={(value) => constructWorkflow('Inisiasi', value)}
          workflowDetail={workflowDetail}
          deleteWorkflow={deleteWorkflow}
        />
        <SortableWorkflow
          type="Seleksi"
          isSortable
          headerAction={() => (
            <div className="header-action">
              Total SLA:&nbsp;
              <strong>
                {getTotalSLAByStage('Seleksi')}
                {' '}
                Days

              </strong>
            </div>
          )}
          items={groupWorkflow.Seleksi}
          updateWorkflowData={(value) => constructWorkflow('Seleksi', value)}
          workflowDetail={workflowDetail}
          deleteWorkflow={deleteWorkflow}
        />
        <SortableWorkflow
          type="KLanjut"
          isSortable
          headerAction={() => (
            <div className="header-action">
              Total SLA:&nbsp;
              <strong>
                {getTotalSLAByStage('KLanjut')}
                {' '}
                Days

              </strong>
            </div>
          )}
          items={groupWorkflow.KLanjut}
          updateWorkflowData={(value) => constructWorkflow('KLanjut', value)}
          workflowDetail={workflowDetail}
          deleteWorkflow={deleteWorkflow}
        />
      </div>
    </div>
  );
}

WorkflowSettingsDetailsManage.propTypes = {
  workflowDetail: PropTypes.object,
  setUpdatedWorkflow: PropTypes.func,
  deleteWorkflow: PropTypes.func,
};

WorkflowSettingsDetailsManage.defaultProps = {
  workflowDetail: null,
  setUpdatedWorkflow: () => {},
  deleteWorkflow: () => {},
};

export default WorkflowSettingsDetailsManage;
