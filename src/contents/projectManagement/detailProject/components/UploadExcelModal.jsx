/* eslint-disable no-alert */
import './UploadExcelModal.scss';
import React, { useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import { Button, Card, Icon, Table } from '@solecode/sole-ui';
import RenderIf from '../../../RenderIf';
import columns from '../constants/uploadExcelTableHeader';
import useUpdateProjectDataApi from '../../../../hooks/api/updateProjectData';
import fileSizeFormatter from '../../../../libs/fileSizeFormatter';

const ALLOWED_FILE_EXTENSION = ['.xls', '.xlsx', '.xlm', '.xlsm'];

const UploadExcelModal = ({
  projectActionId,
  title,
  open,
  setOpen,
  onCancel,
  refreshFollowUpList,
  onSubmit,
}) => {
  const {
    uploadFollowUp,
    addNewFollowUp,
    getFollowUpDropdown,
  } = useUpdateProjectDataApi();
  const [errUploadMsg, setErrUploadMsg] = useState(null);
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fileObj, setFileObj] = useState({});

  const handleChange = async (file) => {
    setErrUploadMsg(null);

    try {
      setIsLoading(true);
      const res = await uploadFollowUp(file);

      if (res.data?.code !== 200) {
        window.alert('Something went wrong.');
        console.log(res);
        setFileObj({});
        setErrUploadMsg('Error while uploading file.');
        return;
      }

      setData(res.data.data);
      setFileObj(file);
      setIsLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  const addFollowUp = async () => {
    try {
      setSubmitLoading(true);
      const followUpDropodownRes = await getFollowUpDropdown();

      if (followUpDropodownRes.data.code !== 200) {
        window.alert('Something went wrong.');
        console.log(followUpDropodownRes);
        return;
      }

      const payload = data?.dtos.map((el) => {
        el.riskLevelParId = followUpDropodownRes.data.data?.riskLevel.find(
          (obj) => obj.value === el.riskLevelParId
        )?.key;

        return { ...el, projectActionId };
      });

      const res = await addNewFollowUp(payload);

      if (res.data?.code !== 200) {
        window.alert('Something went wrong.');
        console.log(res.response);
        return;
      }

      setFileObj({});
      setData({});
      setErrUploadMsg(null);
      refreshFollowUpList();
      setOpen(false);
      onSubmit(data.dtos[0].followUpAspectParId);
    } catch (e) {
      console.log(e);
    } finally {
      setSubmitLoading(false);
    }
  };

  const onTypeError = (err) => {
    setErrUploadMsg(err);
    console.log(err);
  };

  const onDeleteFileHandler = () => {
    setData({});
    setFileObj({});
  };

  const placeholderBody = (
    <div className="custom-dropzone-content">
      <Icon
        name="cloud-arrow-up"
        size={44}
      />
      <div className="text">
        <div>Select a file to upload</div>
        <div>or drag and drop from your device here.</div>
      </div>
    </div>
  );

  return (
    <Modal
      title={title}
      className="upload-excel-modal"
      centered
      visible={open}
      okText="Submit"
      onCancel={onCancel}
      footer={[
        <Button
          label={
            submitLoading ?
              (
                <>
                  <Icon name="spinner-third" spin size={24} />
                  Submit Data
                </>
              )
              : 'Submit Data'
          }
          onClick={() => {
            if (data?.dtos) addFollowUp();
            else {
              setErrUploadMsg(null);
              setData({});
            }
          }}
          disabled={!data?.dtos?.length || submitLoading}
        />,
      ]}
      width={1200}
    >
      <div className="upload-excel-modal-content">
        <div className="custom-row">
          <Card
            body={(
              <>
                <div className="wrapper">
                  <div className="dropzone-wrapper">
                    <RenderIf isTrue={Boolean(!fileObj?.name)}>
                      <FileUploader
                        name="file"
                        types={ALLOWED_FILE_EXTENSION.map((e) => e.replace('.', ''))}
                        handleChange={handleChange}
                        onTypeError={onTypeError}
                        multiple={false}
                        hoverTitle=""
                      >
                        {placeholderBody}
                      </FileUploader>
                      <RenderIf isTrue={errUploadMsg}>
                        <div className="error-message">
                          <Icon name="circle-exclamation" type="solid" />
                          <span className="text">{errUploadMsg}</span>
                        </div>
                      </RenderIf>
                    </RenderIf>
                    <RenderIf isTrue={Boolean(fileObj?.name)}>
                      <div className="file-upload-success">
                        <Icon name="file-excel" size="56" type="solid" />
                        <div className="file-details">
                          <span>{fileObj?.name}</span>
                          <span>{fileSizeFormatter(fileObj?.size)}</span>
                        </div>
                        <div className="delete-ic">
                          <span
                            tabIndex={0}
                            onKeyDown={onDeleteFileHandler}
                            onClick={onDeleteFileHandler}
                            role="button"
                          >
                            <Icon name="trash-can" />
                          </span>
                        </div>
                      </div>
                    </RenderIf>
                  </div>
                  <div className="status-wrapper">
                    <div className="uploading-status">
                      <Icon name="circle-info" type="regular" />
                      <span>Uploading Status</span>
                    </div>
                    <div className="data-qty">
                      <span className={`value-${data?.totalData ? 'filled' : 'empty'}`}>{data?.totalData || 0}</span>
                      <span>data recorded</span>
                    </div>
                    <div className="aspect-found-qty">
                      <span className={`value-${data?.totalAspect ? 'filled' : 'empty'}`}>{data?.totalAspect || 0}</span>
                      <span>aspect found</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          />
        </div>
        <div className="custom-row">
          <div className={`table-wrapper ${!data?.dtos?.length ? 'no-data' : null}`}>
            <Table
              columns={columns}
              data={data?.dtos}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

UploadExcelModal.propTypes = {
  projectActionId: PropTypes.string.isRequired,
  title: PropTypes.string,
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  onCancel: PropTypes.func,
  refreshFollowUpList: PropTypes.func,
  onSubmit: PropTypes.func,
};

UploadExcelModal.defaultProps = {
  title: '',
  open: false,
  setOpen: () => {},
  onCancel: () => {},
  refreshFollowUpList: () => {},
  onSubmit: () => {},
};

export default UploadExcelModal;
