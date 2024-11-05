/* eslint-disable no-alert */
import './ModalComments.scss';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useSearchParams } from 'react-router-dom';
import moment from 'moment/moment';

import { Icon, InputText, Button } from '@solecode/sole-ui';
import { Modal } from 'antd';
import RenderIf from '../../../RenderIf';
import { Popover } from '../../../../components';
import EmptyState from '../../../../assets/empty-state.png';

import useProjectManagementApi from '../../../../hooks/api/projectManagement';

const CommentItem = ({
  projectId,
  projectCommentId,
  empName,
  comment,
  stage,
  workflow,
  createdDate,
  deleteCallback,
}) => {
  const { userData } = useSelector((state) => state.appReducer);
  const [isOpenPopOver, setIsOpenPopOver] = useState(false);

  const { deleteProjectComment } = useProjectManagementApi();

  const deleteProjectCommentAction = async () => {
    try {
      const res = await deleteProjectComment({ projectId, projectCommentId });

      if (res?.code !== 200) {
        window.alert('Something went wrong.');
        return;
      }
      // eslint-disable-next-line no-unused-expressions
      deleteCallback && deleteCallback();
    } catch (e) {
      console.error(e);
    }
  };

  const getInitial = (createdBy) => {
    if (!createdBy) return '';

    const names = createdBy.split(' ');
    const name1 = names[0] ? names[0][0] : '';
    const name2 = names[1] ? names[1][0] : '';

    return `${name1}${name2}`;
  };

  const isCurrentUser = (data) => userData.name === data;

  return (
    <div className="comment-item">
      <div className="comment-avatar">
        {getInitial(empName)}
      </div>

      <div className="comment-content">
        <div className="header">
          {empName}
          <RenderIf isTrue={isCurrentUser(empName)}>
            <Popover
              content={(
                <div className="project-detail-delete-comment-popover">
                  <Button
                    onClick={() => deleteProjectCommentAction()}
                    label="Delete Comment"
                    size="large"
                    type="primary"
                    danger
                  />
                  <Button
                    onClick={() => setIsOpenPopOver(false)}
                    label="Cancel"
                    size="large"
                    type="secondary"
                  />
                </div>
          )}
              placement="bottomRight"
              visible={isOpenPopOver}
              onVisibleChange={setIsOpenPopOver}
            >
              <div
                className="icon-delete"
                onClick={() => setIsOpenPopOver(true)}
                aria-hidden="true"
              >
                <Icon
                  name="trash-can"
                  type="regular"
                />
              </div>
            </Popover>
          </RenderIf>
        </div>

        <div className="body">{comment}</div>

        <div className="footer">
          <div>
            <span className="stage">
              {stage}
              {' '}
            </span>
            &#183;
            <span>
              {' '}
              {workflow}
            </span>
          </div>

          <div>
            {createdDate ? moment.utc(createdDate).clone().local().format('DD MMM YYYY HH:mm') : '-'}
          </div>
        </div>
      </div>
    </div>
  );
};

CommentItem.propTypes = {
  projectId: PropTypes.string,
  projectCommentId: PropTypes.number,
  empName: PropTypes.string,
  comment: PropTypes.string,
  stage: PropTypes.string,
  workflow: PropTypes.string,
  createdDate: PropTypes.string,
  deleteCallback: PropTypes.func,
};

CommentItem.defaultProps = {
  projectId: '',
  projectCommentId: null,
  empName: '',
  comment: '',
  stage: '',
  workflow: '',
  createdDate: '',
  deleteCallback: () => {},
};

const ModalComments = ({ visible, setVisible }) => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);

  const {
    getProjectComments,
    postProjectComment,
  } = useProjectManagementApi();

  const getProjectCommentsAction = async () => {
    try {
      const res = await getProjectComments(projectId);

      if (res?.code !== 200) {
        window.alert('Something went wrong.');
        return;
      }
      setComments(res?.data?.items);
      setTotalComments(res?.data?.totalItems);
    } catch (e) {
      console.error(e);
    }
  };

  const postProjectCommentAction = async () => {
    try {
      const res = await postProjectComment(projectId, { comment });

      if (res?.code !== 200) {
        window.alert('Something went wrong.');
        return;
      }
      setComment('');
      getProjectCommentsAction();
    } catch (e) {
      console.error(e);
    }
  };

  const handleInputComment = (e) => {
    const { value } = e.target;
    if (value?.length > 250) return;

    setComment(value);
  };

  useEffect(() => {
    if (!projectId || !visible) return;
    setComment('');
    getProjectCommentsAction();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, visible]);

  return (
    <Modal
      title={(
        <div className="modal-comments-title">
          Comments
        </div>
      )}
      centered
      visible={visible}
      onCancel={() => setVisible()}
      type="default"
      width={848}
      footer={(
        <div className="modal-comments-footer">
          Total
          {' '}
          {totalComments}
          {' '}
          Comments
        </div>
      )}
    >
      <div className="modal-comments">
        <div className="input-comment">
          <InputText
            value={comment}
            placeholder="Input your comment here.."
            onChange={handleInputComment}
            onPressEnter={postProjectCommentAction}
            suffix={{
              name: 'paper-plane-top',
              type: 'solid',
            }}
            max={250}
          />
          <div className="input-comment-counter">
            {comment?.length}
            /250
          </div>
          <Button
            onClick={postProjectCommentAction}
            label=" "
            size="large"
            type="secondary"
          />
        </div>

        <RenderIf isTrue={comments?.length === 0}>
          <div>
            <div className="empty-state">
              <img alt="empty-state" src={EmptyState} />
              <span className="text">There aren&apos;t any posted comments yet</span>
            </div>
          </div>
        </RenderIf>

        <RenderIf isTrue={!!comments?.length}>
          <div className="comment-list">
            {comments?.map((item) => (
              <CommentItem
                key={item?.projectCommentId}
                projectId={projectId}
                deleteCallback={getProjectCommentsAction}
                {...item}
              />
            ))}
          </div>
        </RenderIf>
      </div>
    </Modal>
  );
};

ModalComments.propTypes = {
  visible: PropTypes.bool,
  setVisible: PropTypes.func,
};

ModalComments.defaultProps = {
  visible: false,
  setVisible: () => {},
};

export default ModalComments;
