import { InputText, Datepicker, Icon } from '@solecode/sole-ui';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Modal, TimePicker } from 'antd';
import PropTypes from 'prop-types';
import './CalendarEvent.scss';

const format = 'HH:mm';

const ModalCalendarDetail = (
  {
    modalTitle, isVisible, handleCancel,
    meetingTitle, isFormDisabled, date,
    time, location,
    participants, notes,
    threshold, regional, zona, projectTitle, status, createdBy,
  }
) => {
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

  const statusObj = {
    Completed: 'completed',
    Overdue: 'overdue',
    Canceled: 'canceled',
    Scheduled: 'scheduled',
  };

  const FlagIcon = ({ type }) => (
    <div className={`flag-logo ${type}`}>
      <Icon
        name="flag"
        size="8"
        type="solid"
      />
    </div>
  );

  FlagIcon.propTypes = {
    type: PropTypes.string.isRequired,
  };

  return (
    <Modal
      className="rounded-modal-add"
      centered
      title={modalTitle}
      visible={isVisible}
      onCancel={handleCancel}
      width={800}
      footer={null}
    >
      <div className="modal-form">
        <div className="form">
          <div className={`status-container status-container-${statusObj[status]}`}>
            <FlagIcon type={statusObj[status]} />
            <div>{status}</div>
          </div>
          <div className="form-field">
            <div className="form-label">Meeting Title</div>
            <InputText
              type="text"
              placeholder="Input Meeting Title"
              size="large"
              value={meetingTitle}
              max={200}
              disabled={isFormDisabled}
            />
          </div>
          <div className="form-field">
            <div className="form-label">Project Title</div>
            <InputText
              type="text"
              placeholder="Input Project Title"
              size="large"
              value={projectTitle}
              max={200}
              disabled={isFormDisabled}
            />
          </div>
          <div className="row-3">
            <div className="form-field">
              <div className="form-label">Threshold</div>
              <InputText
                type="text"
                placeholder="Input Threshold"
                size="large"
                value={threshold}
                max={200}
                disabled={isFormDisabled}
              />
            </div>
            <div className="form-field">
              <div className="form-label">Regional</div>
              <InputText
                type="text"
                placeholder="Input Regional"
                size="large"
                value={regional}
                max={200}
                disabled={isFormDisabled}
              />
            </div>
            <div className="form-field">
              <div className="form-label">Zona</div>
              <InputText
                type="text"
                placeholder="Input Zona"
                size="large"
                value={zona}
                max={200}
                disabled={isFormDisabled}
              />
            </div>
          </div>
          <div className="row">
            <div className="form-field">
              <div className="form-label">Date</div>
              <Datepicker
                placeholder="Date"
                size="large"
                format="DD MMM YYYY"
                value={date}
                disabled={isFormDisabled}
              />
            </div>
            <div className="form-field">
              <div className="form-label">Time</div>
              <TimePicker.RangePicker
                value={time}
                format={format}
                disabled={isFormDisabled}
              />
            </div>
          </div>
          <div className="form-field">
            <div className="form-label">Meeting Location</div>
            <div className="location-box">
              <Icon name="location-dot" />
              <a href={location} target="_blank" rel="noreferrer">
                {location}
              </a>
            </div>
          </div>
          <div className="participant-list">
            <div className="form-label">Meeting Participant</div>

            {
              participants &&
              participants.map((p) => (
                <div className="participant-row">
                  <div>
                    <span className="name">{p.empName}</span>
                    {p.empEmail}
                  </div>
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
              {participants ? participants.length : 0}
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

ModalCalendarDetail.propTypes = {
  modalTitle: PropTypes.string.isRequired,
  isVisible: PropTypes.bool.isRequired,
  handleCancel: PropTypes.func.isRequired,
  meetingTitle: PropTypes.string.isRequired,
  isFormDisabled: PropTypes.bool.isRequired,
  date: PropTypes.any.isRequired,
  time: PropTypes.any.isRequired,
  location: PropTypes.string.isRequired,
  participants: PropTypes.array.isRequired,
  notes: PropTypes.any.isRequired,
  threshold: PropTypes.string.isRequired,
  regional: PropTypes.string.isRequired,
  zona: PropTypes.string.isRequired,
  projectTitle: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  createdBy: PropTypes.string,
};

ModalCalendarDetail.defaultProps = {
  createdBy: '',
};

export default ModalCalendarDetail;
