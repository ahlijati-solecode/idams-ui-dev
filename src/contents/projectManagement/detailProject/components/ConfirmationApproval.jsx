/* eslint-disable no-alert */
import './ConfirmationApproval.scss';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Icon, Button } from '@solecode/sole-ui';
import moment from 'moment';
import ConfirmationModal from '../../../../components/ConfirmationModal';
import useProjectManagementApi from '../../../../hooks/api/projectManagement';
import RenderIf from '../../../RenderIf';
import Alert from '../../../../components/Alert';

const ConfirmationApproval = ({ projectActionDetail, setRefetch, isValidActor }) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isModalDanger, setIsModalDanger] = useState(false);
  const [projectConfirmation, setProjectConfirmation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    getProjectConfirmation,
    updateProjectConfirmation,
  } = useProjectManagementApi();

  const getProjectConfirmationAction = async () => {
    if (!projectActionDetail) return;
    try {
      const res = await getProjectConfirmation({ projectActionId: projectActionDetail.projectActionId });

      if (res.code !== 200) {
        window.alert('Something went wrong.');
        return;
      }

      setProjectConfirmation(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const updateProjectConfirmationAction = async () => {
    if (!projectActionDetail) return;
    try {
      setIsLoading(true);
      const res = await updateProjectConfirmation({
        projectActionId: projectActionDetail?.projectActionId,
        approval: !isModalDanger,
      });

      if (res?.code !== 200) {
        window.alert('Something went wrong.');
        return;
      }
      setIsOpenModal(false);
      getProjectConfirmationAction();
      setRefetch((n) => n + 1);
      if (res?.data?.status === 'Skipped') {
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (type) => {
    setIsOpenModal(true);
    setIsModalDanger(type);
  };

  const constructModalProps = () => isModalDanger ? {
    icon: {
      name: 'chevrons-right',
      size: 48,
      type: 'solid',
    },
    open: isOpenModal,
    setOpen: setIsOpenModal,
    onOk: updateProjectConfirmationAction,
    title: 'Skip Confirmation',
    message1: 'Are you sure to skip this process?',
    message2: 'This action can\'t be undone',
    buttonOkLabel: 'Yes, I\'m sure',
    buttonCancelLabel: 'Cancel',
    isDanger: isModalDanger,
    isLoading,
    // primaryIcon: isLoading ? <Icon name="spinner-third" spin size={24} /> : buttonOkPrimaryIcon,
  } : {
    icon: {
      name: 'square-check',
      size: 48,
      type: 'regular',
    },
    open: isOpenModal,
    setOpen: setIsOpenModal,
    onOk: updateProjectConfirmationAction,
    title: 'Requirement Confirmation',
    message1: 'Are you sure you want to set this workflow as required?',
    message2: 'This action can\'t be undone',
    buttonOkLabel: 'Yes, I\'m sure',
    buttonCancelLabel: 'Cancel',
    isDanger: isModalDanger,
    isLoading,
    // primaryIcon: isLoading ? <Icon name="spinner-third" spin size={24} /> : buttonOkPrimaryIcon,
  };

  useEffect(() => {
    if (!Object.keys(projectActionDetail)) return;

    getProjectConfirmationAction();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectActionDetail]);

  return (
    <div className="confirmation-approval">
      <RenderIf isTrue={projectConfirmation?.status === 'In-Progress' && isValidActor}>
        <ConfirmationModal className="confirmation-modal" {...constructModalProps()} />

        <Button
          label="Yes, Required"
          type={Button.Type.PRIMARY}
          primaryIcon={(
            <Icon
              name="check"
              size={18}
              type="regular"
            />
  )}
          onClick={() => handleOpenModal(false)}
        />
        <Button
          label="No, Skip it"
          type={Button.Type.PRIMARY}
          danger
          primaryIcon={(
            <Icon
              name="x"
              size={16}
              type="regular"
            />
  )}
          onClick={() => handleOpenModal(true)}
        />
      </RenderIf>

      <RenderIf isTrue={projectConfirmation?.status === 'Completed'}>
        <Alert
          showIcon
          icon={{ name: 'octagon-check', size: 40, type: 'regular' }}
          message="This workflow has been selected as 'Required'"
          descriptionRight={(
            <div className="details-wrapper">
              <div className="user">
                <Icon name="user" size={16} type="regular" />
                <span>
                  {projectConfirmation?.empName || '-'}
                </span>
              </div>
              <div className="date">
                <Icon name="calendar" size={16} type="regular" />
                <span>
                  { projectConfirmation?.date ? moment.utc(projectConfirmation?.date).clone().local().format('DD MMM YYYY HH:mm') : '-' }
                </span>
              </div>
            </div>
        )}
          type="success"
          closeable={false}
        />
      </RenderIf>

      <RenderIf isTrue={projectConfirmation?.status === 'Skipped'}>
        <Alert
          showIcon
          icon={{ name: 'chevrons-right', size: 40, type: 'regular' }}
          message="This workflow has been skipped"
          descriptionRight={(
            <div className="details-wrapper">
              <div className="user">
                <Icon name="user" size={16} type="regular" />
                <span>
                  {projectConfirmation?.empName || '-'}
                </span>
              </div>
              <div className="date">
                <Icon name="calendar" size={16} type="regular" />
                <span>
                  { projectConfirmation?.date ? moment.utc(projectConfirmation?.date).clone().local().format('DD MMM YYYY HH:mm') : '-' }
                </span>
              </div>
            </div>
        )}
          type="error"
          closeable={false}
        />
      </RenderIf>

    </div>
  );
};

ConfirmationApproval.propTypes = {
  projectActionDetail: PropTypes.object,
  setRefetch: PropTypes.func,
  isValidActor: PropTypes.bool,
};

ConfirmationApproval.defaultProps = {
  projectActionDetail: null,
  setRefetch: () => {},
  isValidActor: false,
};

export default ConfirmationApproval;
