import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Table, Button, Icon } from '@solecode/sole-ui';
import ModalMeeting from './ModalMeeting';
import ModalDeleteMeeting from './ModalDeleteMeeting';
import { ConfirmationModal } from '../../../../components';
import Alert from '../../../../components/Alert';
import EmptyState from '../../../../assets/empty-state.png';
import useProjectManagementApi from '../../../../hooks/api/projectManagement';
import './Meeting.scss';
import { getActorName } from '../../../../libs/commonUtils';

const Meeting = ({
  projectActionId,
  projectActionStatus,
  index,
  headerBefore,
  beforeStatus,
  getProjectDetail,
  isAllowed,
  refWorkflowActors,
  listOfActorName,
}) => {
  const { userData } = useSelector((x) => x.appReducer);
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteIsVisible, setDeleteIsVisible] = useState(false);
  const [meetingBeDeleted, setMeetingBeDeleted] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');

  const [meetingTitle, setMeetingTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState([null, null]);
  const [location, setLocation] = useState('');
  const [participants, setParticipants] = useState([]);
  const [participant, setParticipant] = useState('');
  const [notes, setNotes] = useState('');
  const [messageSuccess, setMessageSuccess] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [isDraft, setIsDraft] = useState(false);
  const [createdBy, setCreatedBy] = useState('');
  const [showCompleteConfirmation, setShowCompleteConfirmation] = useState(false);

  const {
    getMeetingList,
    getMeetingDetail,
    // getParticipantDetail,
    addNewMeeting,
    updateMeeting,
    deleteMeeting,
    completeAllMeeting,
  } = useProjectManagementApi();

  const getMeetings = async () => {
    setIsLoading(true);
    try {
      const res = await getMeetingList(projectActionId);
      if (res?.data.status === 'Success') {
        setMeetings(res.data.data);
        setSelectedMeetingId(null);
      }
    } catch (e) {
      console.error(e);
      // eslint-disable-next-line no-alert
      window.alert('Something went wrong.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (projectActionId) getMeetings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pillsClass = {
    Draft: 'orange-pills',
    Scheduled: 'blue-pills',
    Completed: 'green-pills',
    Canceled: 'red-pills',
  };

  const [isFormDisabled, setIsFormDisabled] = useState(false);

  function clearData() {
    setMeetingTitle('');
    setDate('');
    setTime([null, null]);
    setLocation('');
    setNotes('');
    setParticipants([]);
    setParticipant('');
    setIsDraft(false);
  }

  async function openModal(row) {
    clearData();
    if (row) {
      try {
        const res = await getMeetingDetail(row.original.projectActionId, row.original.meetingId);
        setSelectedMeetingId(row.original.meetingId);
        if (res?.data.status === 'Success') {
          setMeetingTitle(res.data.data.title);
          setDate(moment(res.data.data.date));
          setTime([moment(res.data.data.start, 'HH:mm'), moment(res.data.data.end, 'HH:mm')]);
          setLocation(res.data.data.location);
          setNotes(res.data.data.notes);
          setParticipants(res.data.data.participants);
          setCreatedBy(res.data.data.createdBy);
          setParticipant('');
          if (row.original.status === 'Draft') setIsDraft(true);
        }
      } catch (e) {
        console.error(e);
        // eslint-disable-next-line no-alert
        window.alert('Something went wrong.');
      }
      if (row.original.status === 'Scheduled' && isAllowed) {
        setIsFormDisabled(true);
        setModalTitle('Manage Meeting');
      } else if (row.original.status === 'Draft' && isAllowed) {
        setIsFormDisabled(false);
        setModalTitle('Create a meeting');
      } else {
        setIsFormDisabled(true);
        setModalTitle('Meeting Details');
      }
    } else {
      setIsFormDisabled(false);
      setModalTitle('Create a meeting');
    }

    setIsVisible(true);
  }

  function openDeleteModal(e) {
    setMeetingBeDeleted(e.original.meetingId);
    setDeleteIsVisible(true);
  }

  const tableColumns = [
    {
      Header: 'Meeting Title',
      accessor: 'title',
      headerStyle: {
        maxWidth: '40%',
        minWidth: '40%',
        width: '40%',
      },
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { row } }) => (
        <button
          type="button"
          onClick={() => openModal(row)}
          className="link"
        >
          {/* eslint-disable-next-line react/prop-types */}
          {row.original.title}
        </button>
      ),
    },
    {
      Header: 'Date',
      accessor: 'date',
      headerStyle: {
        maxWidth: '13%',
        minWidth: '13%',
        width: '13%',
      },
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { value } }) => (
        <div>
          {value ? moment(value).format('DD MMM YYYY') : '-'}
        </div>
      ),
    },
    {
      Header: 'Time',
      accessor: 'start',
      headerStyle: {
        maxWidth: '13%',
        minWidth: '13%',
        width: '13%',
      },
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { row } }) => {
        function getDuration(start, end) {
          const startTime = moment(start, 'HH:mm:ss a');
          const endTime = moment(end, 'HH:mm:ss a');
          const duration = moment.duration(endTime.diff(startTime));
          const hours = parseFloat(duration.asHours()).toFixed(1);
          return hours;
        }
        return (
          <div>
            {/* eslint-disable-next-line react/prop-types */}
            {`${moment(row.original.start, 'HH:mm:ss').format('HH:mm')} - ${moment(row.original.end, 'HH:mm:ss').format('HH:mm')} 
              (${
                /* eslint-disable-next-line react/prop-types */
                getDuration(moment(row.original.start, 'HH:mm:ss').format('HH:mm'), moment(row.original.end, 'HH:mm:ss').format('HH:mm'))} H)`}
          </div>
        );
      },
    },
    {
      Header: 'Organized By',
      accessor: 'createdBy',
      headerStyle: {
        maxWidth: '13%',
        minWidth: '13%',
        width: '13%',
      },
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { value } }) => (
        <div>
          {value}
        </div>
      ),
    },
    {
      Header: 'Status',
      accessor: 'status',
      headerStyle: {
        maxWidth: '13%',
        minWidth: '13%',
        width: '13%',
      },
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { value } }) => (
        <div className={`pills ${pillsClass[value]}`}>
          {value}
        </div>
      ),
    },
    {
      Header: 'Action',
      accessor: 'templateId',
      disableSort: true,
      hideFilter: true,
      hideSort: true,
      headerStyle: {
        maxWidth: '13%',
        minWidth: '13%',
        width: '13%',
      },
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { row } }) => (
        <div className="table-inside-button">
          {
            // eslint-disable-next-line react/prop-types
            (row.original.status !== 'Completed' && isAllowed && projectActionStatus !== 'Completed') && (
              <Button
                label="Button Title"
                shape="circle"
                onClick={(e) => {
                  e.stopPropagation();
                  // eslint-disable-next-line react/prop-types
                  openDeleteModal(row);
                }}
                primaryIcon={<Icon name="trash-can" type="solid" />}
              />
            )
          }
        </div>
      ),
    },
  ];

  const tableColumnsComplete = [
    {
      Header: 'Meeting Title',
      accessor: 'title',
      headerStyle: {
        maxWidth: '40%',
        minWidth: '40%',
        width: '40%',
      },
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { row } }) => (
        <button
          type="button"
          onClick={() => openModal(row)}
          className="link"
        >
          {/* eslint-disable-next-line react/prop-types */}
          {row.original.title}
        </button>
      ),
    },
    {
      Header: 'Date',
      accessor: 'date',
      headerStyle: {
        maxWidth: '13%',
        minWidth: '13%',
        width: '13%',
      },
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { value } }) => (
        <div>
          {value ? moment(value).format('DD MMM YYYY') : '-'}
        </div>
      ),
    },
    {
      Header: 'Time',
      accessor: 'start',
      headerStyle: {
        maxWidth: '13%',
        minWidth: '13%',
        width: '13%',
      },
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { row } }) => {
        function getDuration(start, end) {
          const startTime = moment(start, 'HH:mm:ss a');
          const endTime = moment(end, 'HH:mm:ss a');
          const duration = moment.duration(endTime.diff(startTime));
          const hours = parseFloat(duration.asHours()).toFixed(1);
          const minutes = parseInt(duration.asMinutes(), 10) % 60;

          console.log(hours, minutes);
          return hours;
        }
        return (
          <div>
            {/* eslint-disable-next-line react/prop-types */}
            {`${moment(row.original.start, 'HH:mm:ss').format('HH:mm')} - ${moment(row.original.end, 'HH:mm:ss').format('HH:mm')} 
              (${
                /* eslint-disable-next-line react/prop-types */
                getDuration(moment(row.original.start, 'HH:mm:ss').format('HH:mm'), moment(row.original.end, 'HH:mm:ss').format('HH:mm'))} H)`}
          </div>
        );
      },
    },
    {
      Header: 'Organized By',
      accessor: 'createdBy',
      headerStyle: {
        maxWidth: '13%',
        minWidth: '13%',
        width: '13%',
      },
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { value } }) => (
        <div>
          {value}
        </div>
      ),
    },
    {
      Header: 'Status',
      accessor: 'status',
      headerStyle: {
        maxWidth: '13%',
        minWidth: '13%',
        width: '13%',
      },
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { value } }) => (
        <div className={`pills ${pillsClass[value]}`}>
          {value}
        </div>
      ),
    },
  ];

  async function removeMeeting() {
    setIsLoading(true);
    try {
      const res = await deleteMeeting(projectActionId, meetingBeDeleted);
      if (res?.data?.status === 'Success') {
        await getMeetings();
      }
    } catch (e) {
      console.error(e);
      // eslint-disable-next-line no-alert
      window.alert('Something went wrong.');
    }
    setDeleteIsVisible(false);
    setMeetingBeDeleted(null);
    setIsLoading(false);
  }

  function closeDeleteModal() {
    setDeleteIsVisible(false);
  }

  async function saveAsDraft() {
    const data = {
      projectActionId,
      title: meetingTitle,
      date: new Date(moment(date).format('YYYY-MM-DD')),
      start: moment(time[0]).format('HH:mm:ss'),
      end: moment(time[1]).format('HH:mm:ss'),
      location,
      notes,
      participants,
      status: 'Draft',
    };

    console.log(participants.find((item) => item.empEmail === userData.email));
    if (participants.find((item) => item.empEmail === userData.email) === undefined) {
      data.participants.push({
        empAccount: userData?.empAccount,
        empEmail: userData?.email,
        empName: userData?.name,
      });
    }
    setIsLoading(true);

    try {
      if (isDraft) {
        data.meetingId = selectedMeetingId;
        await updateMeeting(data).then((res) => {
          if (res?.status === 'Success') {
            getMeetings();
            clearData();
          }
        });
      } else {
        await addNewMeeting(data).then((res) => {
          if (res?.status === 'Success') {
            getMeetings();
            clearData();
          }
        });
      }
    } catch (e) {
      console.log(e);
      // eslint-disable-next-line no-alert
      window.alert('Something went wrong.');
    }
    setIsLoading(false);

    setIsVisible(false);
  }

  async function sendInvitation() {
    const data = {
      projectActionId,
      title: meetingTitle,
      date: new Date(moment(date).format('YYYY-MM-DD')),
      start: moment(time[0]).format('HH:mm:ss'),
      end: moment(time[1]).format('HH:mm:ss'),
      location,
      notes,
      participants,
      status: 'Scheduled',
    };

    if (participants.find((item) => item.empEmail === userData.email) === undefined) {
      data.participants.push({
        empAccount: userData?.empAccount,
        empEmail: userData?.email,
        empName: userData?.name,
      });
    }

    setIsLoading(true);
    try {
      if (isDraft) {
        data.meetingId = selectedMeetingId;
        await updateMeeting(data).then((res) => {
          if (res?.status === 'Success') {
            getMeetings();
            clearData();
            setMessageSuccess(true);
          }
        });
      } else {
        await addNewMeeting(data).then((res) => {
          if (res?.status === 'Success') {
            getMeetings();
            clearData();
            setMessageSuccess(true);
          }
        });
      }
      setIsVisible(false);
    } catch (e) {
      console.log(e);
      // eslint-disable-next-line no-alert
      window.alert('Something went wrong.');
    }
    setIsLoading(false);
  }

  async function cancelMeeting() {
    const data = {
      projectActionId,
      meetingId: selectedMeetingId,
      title: meetingTitle,
      date: new Date(moment(date).format('YYYY-MM-DD')),
      start: moment(time[0]).format('HH:mm:ss'),
      end: moment(time[1]).format('HH:mm:ss'),
      location,
      notes,
      participants,
      status: 'Canceled',
    };
    setIsLoading(true);

    try {
      await updateMeeting(data).then((res) => {
        if (res?.status === 'Success') {
          getMeetings();
          clearData();
        }
      });
    } catch (e) {
      console.log(e);
      // eslint-disable-next-line no-alert
      window.alert('Something went wrong.');
    }
    setIsLoading(false);

    setIsVisible(false);
  }

  async function completeMeeting() {
    setIsLoading(true);
    const data = {
      projectActionId,
      meetingId: selectedMeetingId,
      title: meetingTitle,
      date: new Date(moment(date).format('YYYY-MM-DD')),
      start: moment(time[0]).format('HH:mm:ss'),
      end: moment(time[1]).format('HH:mm:ss'),
      location,
      notes,
      participants,
      status: 'Completed',
    };

    try {
      await updateMeeting(data).then((res) => {
        if (res?.status === 'Success') {
          getMeetings();
          clearData();
        }
      });
    } catch (e) {
      console.log(e);
      // eslint-disable-next-line no-alert
      window.alert('Something went wrong.');
    }
    setIsLoading(false);
    setIsVisible(false);
  }

  function checkAllMeeting() {
    if (isLoading) return true;
    if (meetings.length === 0) return true;
    const anyScheduled = meetings.find((meeting) => meeting.status === 'Scheduled');
    const anyDraft = meetings.find((meeting) => meeting.status === 'Draft');
    if (anyDraft || anyScheduled) return true;
    return false;
  }
  async function completeMeetings() {
    setIsLoading(true);
    try {
      await completeAllMeeting(projectActionId).then((res) => {
        if (res?.status === 'Success') {
          getMeetings();
          getProjectDetail();
          clearData();
        }
      });
    } catch (e) {
      console.log(e);
      // eslint-disable-next-line no-alert
      window.alert('Something went wrong.');
    }
    setIsLoading(false);
    setShowCompleteConfirmation(false);
    setIsVisible(false);
  }

  const handleCancel = () => {
    setIsVisible(false);
    clearData();
  };

  function isAddDisabled() {
    if (meetingTitle && date && time[0] && time[1] && location && participants.length > 0) return false;
    return true;
  }

  function modalFooter() {
    if (modalTitle === 'Create a meeting') {
      return [
        <Button
          onClick={() => clearData()}
          label="Clear data"
          size="middle"
          type="link"
          disabled={isLoading}
        />,
        <Button
          onClick={() => saveAsDraft()}
          label="Save as Draft"
          size="middle"
          type="secondary"
          primaryIcon={isLoading && <Icon name="spinner-third" spin size={24} />}
          disabled={isLoading || isAddDisabled()}
        />,
        <Button
          onClick={() => sendInvitation()}
          label="Send Invitation"
          size="middle"
          type="primary"
          disabled={isLoading || isAddDisabled()}
          primaryIcon={isLoading && <Icon name="spinner-third" spin size={24} />}
        />,
      ];
    } if (modalTitle === 'Manage Meeting') {
      return [
        <Button
          onClick={() => cancelMeeting()}
          label="Cancel Meeting"
          size="middle"
          type="danger"
          disabled={isLoading}
          primaryIcon={isLoading && <Icon name="spinner-third" spin size={24} />}
        />,
        <Button
          onClick={() => completeMeeting()}
          label="Complete Meeting"
          size="middle"
          type="primary"
          disabled={isLoading}
          primaryIcon={isLoading && <Icon name="spinner-third" spin size={24} />}
        />,
      ];
    }
    return [];
  }

  const MessageContent = () => (
    <div>
      {
        (!isAllowed && meetings.length === 0) && (
          <Alert
            showIcon
            icon={{ name: 'hourglass-clock', size: 40 }}
            message={
              `Waiting to be scheduled by ${getActorName(refWorkflowActors, listOfActorName)}`
            }
            type="warning"
            closeable={false}
          />
        )
      }
      <div className="full-width">
        {(isAllowed && projectActionStatus !== 'Completed') && (
        <>
          {
            messageSuccess && (
              <Alert
                showIcon
                message="Invitation for scheduled meeting has successfully sent!"
                onClose={() => setMessageSuccess(false)}
              />
            )
          }
          <div style={{ marginTop: '16px' }} />
          <Button
            label="Create a Meeting"
            onClick={() => openModal()}
            primaryIcon={<Icon name="plus" type="solid" />}
          />
        </>
        )}
      </div>
      <div style={{ marginTop: '24px' }}>
        {
          meetings.length > 0 ?
            (
              <div style={{ height: meetings.length > 5 && 'calc(40vh - 27px)', maxHeight: meetings.length < 5 && 'calc(40vh - 27px)' }}>
                <Table
                  columns={projectActionStatus !== 'Completed' ? tableColumns : tableColumnsComplete}
                  data={meetings}
                  isLoading={isLoading}
                />
              </div>
            )
            : isAllowed && (
              <div className="empty-state">
                <img alt="empty-state" src={EmptyState} />
                <span className="header-text">There aren&apos;t any scheduled meeting yet</span>
                <span className="text">Start create a meeting.</span>
              </div>
            )
        }
      </div>
      <div className="meeting-footer">
        <div className="note">
          <Icon name="circle-info" type="solid" />
          This task can be completed if there are no more scheduled and draft meetings
        </div>
        {
          (isAllowed && projectActionStatus !== 'Completed') && (
          <div className="btn-section">
            <Button
              label="Complete All Meetings"
              onClick={() => setShowCompleteConfirmation(true)}
              primaryIcon={<Icon name="check" type="solid" />}
              disabled={checkAllMeeting()}
            />
          </div>
          )
        }
      </div>
    </div>
  );
  return (
    <div className="meeting">
      <ConfirmationModal
        open={showCompleteConfirmation}
        setOpen={setShowCompleteConfirmation}
        title="Completion Confirmation"
        message1="Are you sure you want to complete all meeting?"
        message2="This action can’t be undone."
        icon={{ name: 'square-check' }}
        buttonOkLabel="Yes, I’m sure"
        onOk={completeMeetings}
        isLoading={isLoading}
      />

      <ModalMeeting
        modalTitle={modalTitle}
        isVisible={isVisible}
        handleCancel={handleCancel}
        modalFooter={modalFooter}
        meetingTitle={meetingTitle}
        setMeetingTitle={setMeetingTitle}
        isFormDisabled={isFormDisabled}
        date={date}
        setDate={setDate}
        time={time}
        setTime={setTime}
        location={location}
        setLocation={setLocation}
        participants={participants}
        setParticipants={setParticipants}
        participant={participant}
        setParticipant={setParticipant}
        notes={notes}
        setNotes={setNotes}
        createdBy={createdBy}
      />
      <ModalDeleteMeeting
        deleteIsVisible={deleteIsVisible}
        closeDeleteModal={closeDeleteModal}
        removeMeeting={removeMeeting}
      />
      {
        (beforeStatus === 'Completed' || index === 0) && <MessageContent />
      }
      {
        (index !== 0 && beforeStatus !== 'Completed') && (
          <Alert
            showIcon
            icon={{ name: 'lock', size: 40 }}
            message={`Will be unlocked after ${headerBefore} Completed`}
            type="info"
            closeable={false}
          />
        )
      }
    </div>
  );
};

Meeting.propTypes = {
  index: PropTypes.number.isRequired,
  headerBefore: PropTypes.string.isRequired,
  refWorkflowActors: PropTypes.array.isRequired,
  beforeStatus: PropTypes.string.isRequired,
  projectActionId: PropTypes.string.isRequired,
  projectActionStatus: PropTypes.string.isRequired,
  getProjectDetail: PropTypes.func.isRequired,
  isAllowed: PropTypes.bool.isRequired,
  listOfActorName: PropTypes.array.isRequired,
};

export default Meeting;
