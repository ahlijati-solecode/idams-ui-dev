/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-alert */

import { useEffect, useState, useCallback } from 'react';
import _debounce from 'lodash/debounce';
import { InputText, Datepicker, Button, Icon } from '@solecode/sole-ui';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Modal, TimePicker, AutoComplete } from 'antd';
import PropTypes from 'prop-types';
import useProjectManagementApi from '../../../../hooks/api/projectManagement';
import './Meeting.scss';

const format = 'HH:mm';

const { Option } = AutoComplete;

const ModalMeeting = ({
  modalTitle,
  isVisible,
  handleCancel,
  modalFooter,
  meetingTitle,
  setMeetingTitle,
  isFormDisabled,
  date,
  setDate,
  time,
  setTime,
  location,
  setLocation,
  participants,
  setParticipants,
  participant,
  setParticipant,
  notes,
  setNotes,
  createdBy,
}) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['link'],
      ['clean'],
      [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link',
  ];

  const [isEmail, setIsEmail] = useState();
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [enterTrigerrer, setEnterTrigerrer] = useState(0);

  const {
    getParticipantDetail,
  } = useProjectManagementApi();

  const addParticipant = async () => {
    setIsLoading(true);
    try {
      const res = await getParticipantDetail(participant);
      if (res?.data?.status === 'Success') {
        const arrParticipants = participants;

        const arr = res.data.data;
        let user = {};
        for (let i = 0; i < arr.length; i += 1) {
          if (arr[i].empEmail === participant) user = arr[i];
        }

        if (!user.empEmail) {
          user = {
            empAccount: '',
            empEmail: participant,
            empName: '',
          };
        }

        setParticipants([...arrParticipants, user]);
        setOptions([]);
        setParticipant('');
      }
      setIsLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  function deleteParticipant(i) {
    const arrParticipants = participants;
    arrParticipants.splice(i, 1);
    setParticipants([...arrParticipants]);
  }

  function validateEmail() {
    // eslint-disable-next-line no-useless-escape
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(participant)) {
      setIsEmail(false);
    } else {
      setIsEmail(true);
    }
  }

  useEffect(() => {
    if (!participant) return;
    // eslint-disable-next-line no-useless-escape
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(participant) === false) return;
    addParticipant();
  }, [enterTrigerrer]);

  useEffect(() => {
    validateEmail();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participant]);

  const onSearch = async (searchText) => {
    try {
      setOptions([]);

      const res = await getParticipantDetail(searchText);

      if (res.data?.code !== 200) {
        setOptions([]);
        return;
      }

      setOptions(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const onSelect = (data) => {
    setParticipant(data);
  };

  const debouncedSearch = useCallback(_debounce(onSearch, 1000), []);

  const handleSearch = (event) => {
    if (!event) {
      setOptions([]);
      return;
    }
    debouncedSearch(event);
  };

  const onChange = (data) => {
    setParticipant(data);
  };

  return (
    <Modal
      className="rounded-modal-add"
      centered
      title={modalTitle}
      visible={isVisible}
      onCancel={handleCancel}
      footer={modalFooter()}
      width={800}
    >
      <div className="modal-form">
        <div className="form">
          <div className="form-field">
            <div className="form-label">Meeting Title</div>
            <InputText
              type="text"
              placeholder="Input Meeting Title"
              size="large"
              value={meetingTitle}
              max={200}
              onChange={(e) => setMeetingTitle(e.target.value)}
              disabled={isFormDisabled}
            />
          </div>
          <div className="row">
            <div className="form-field">
              <div className="form-label">Select Date</div>
              <Datepicker
                placeholder="Select Date"
                size="large"
                format="DD MMM YYYY"
                value={date}
                onChange={(e, dateStr) => setDate(dateStr)}
                disabled={isFormDisabled}
              />
            </div>
            <div className="form-field">
              <div className="form-label">Select Time</div>
              <TimePicker.RangePicker
                value={time}
                format={format}
                onChange={(e) => {
                  setTime(e);
                }}
                disabled={isFormDisabled}
              />
            </div>
          </div>
          <div className="form-field">
            <div className="form-label">Meeting Location</div>
            <InputText
              type="text"
              placeholder="Input Meeting Location"
              size="large"
              value={location}
              max={200}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isFormDisabled}
            />
          </div>
          <div className="form-field">
            <div className="form-label">Meeting Participant</div>
            <div className="participants-container" style={{ display: isFormDisabled ? 'none' : 'flex' }}>
              <AutoComplete
                style={{
                  width: '100%',
                }}
                onSelect={onSelect}
                size="large"
                onSearch={handleSearch}
                value={participant}
                onChange={onChange}
                placeholder="Input Meeting Participant"
                onKeyDown={(e) => {
                  if (e.keyCode === 13) {
                    setEnterTrigerrer((prev) => prev + 1);
                  }
                }}
              >
                {options.map((option) => (
                  <Option
                    key={option.empEmail}
                    value={option.empEmail}
                  >
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        fontStretch: 'normal',
                        fontStyle: 'normal',
                        lineHeight: 1.5,
                        letterSpacing: 'normal',
                        textAlign: 'left',
                        color: 'rgba(38, 38, 38, 0.45)',
                        marginRight: '8px',
                      }}
                      >
                        {option.empName}
                      </div>
                      <div>
                        {option.empEmail}
                      </div>
                    </div>
                  </Option>
                ))}
              </AutoComplete>
              <Button
                onClick={() => addParticipant()}
                label="Add"
                size="middle"
                type="secondary"
                disabled={isLoading || isEmail}
                primaryIcon={isLoading && <Icon name="spinner-third" spin size={24} />}
              />
            </div>
          </div>
          <div className="participant-list">
            {
              participants.map((p, index) => (
                <div className="participant-row">
                  <div>
                    {p.empName !== '' && <span className="name">{p.empName}</span>}
                    {p.empEmail}
                  </div>
                  {
                    !isFormDisabled && (
                    <Button
                      label="Button Title"
                      shape="circle"
                      onClick={() => {
                        deleteParticipant(index);
                      }}
                      primaryIcon={<Icon name="trash-can" type="solid" />}
                    />
                    )
                  }
                </div>
              ))
            }
          </div>
          <div className="participant-count">
            <Icon
              name="user-group"
              size={16}
            />
            <span>
              {participants.length}
              &nbsp;
              participants
            </span>
          </div>
          <div className="form-field" style={{ display: isFormDisabled ? 'block' : 'none' }}>
            <div className="form-label">Organized By</div>
            <InputText
              type="text"
              placeholder="Input Organized By"
              size="large"
              value={createdBy}
              max={200}
              disabled={isFormDisabled}
            />
          </div>
          {
            modalTitle !== 'Create a meeting' && (
              <div className="form-field">
                <div className="form-label">Notes</div>
                {
                  modalTitle !== 'Manage Meeting' && isFormDisabled ?
                    // eslint-disable-next-line react/no-danger
                    <div className="notes" dangerouslySetInnerHTML={{ __html: notes }} />
                    : (
                      <ReactQuill
                        theme="snow"
                        value={notes}
                        onChange={setNotes}
                        modules={modules}
                        formats={formats}
                      />
                    )
                }
              </div>
            )
          }
        </div>
      </div>
    </Modal>
  );
};

ModalMeeting.propTypes = {
  modalTitle: PropTypes.string.isRequired,
  isVisible: PropTypes.bool.isRequired,
  handleCancel: PropTypes.func.isRequired,
  modalFooter: PropTypes.any.isRequired,
  meetingTitle: PropTypes.string.isRequired,
  setMeetingTitle: PropTypes.func.isRequired,
  isFormDisabled: PropTypes.bool.isRequired,
  date: PropTypes.any.isRequired,
  setDate: PropTypes.func.isRequired,
  time: PropTypes.any.isRequired,
  setTime: PropTypes.func.isRequired,
  location: PropTypes.string.isRequired,
  setLocation: PropTypes.func.isRequired,
  participants: PropTypes.array.isRequired,
  setParticipants: PropTypes.func.isRequired,
  notes: PropTypes.any.isRequired,
  setNotes: PropTypes.func.isRequired,
  participant: PropTypes.string.isRequired,
  setParticipant: PropTypes.func.isRequired,
  createdBy: PropTypes.string,
};

ModalMeeting.defaultProps = {
  createdBy: '',
};
export default ModalMeeting;
