/* eslint-disable no-alert */

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import moment from 'moment';
import { Modal } from 'antd';
import { FileUploader } from 'react-drag-drop-files';
import { Button, Icon, InputText, Table } from '@solecode/sole-ui';
import FileExcelImg from '../../../assets/file-excel.png';
import FileImageImg from '../../../assets/file-image.png';
import FilePdfImg from '../../../assets/file-pdf.png';
import FilePowerpointImg from '../../../assets/file-powerpoint.png';
import FileWordImg from '../../../assets/file-word.png';
import { ConfirmationModal, DeleteModal, EmptyState, PaperHeader, PaperTitle } from '../../../components';
import { useLoadData } from '../../../hooks';
import useDocumentApi from '../../../hooks/api/document';
import useProjectManagementApi from '../../../hooks/api/projectManagement';
import fileSizeFormatter from '../../../libs/fileSizeFormatter';
import RenderIf from '../../RenderIf';
import { getActorName } from '../../../libs/commonUtils';
import './UploadDocumentContent.scss';

const ALLOWED_FILE_EXTENSION = [
  '.pdf',
  '.xls',
  '.xlsx',
  '.xlm',
  '.xlsm',
  '.doc',
  '.docx',
  '.jpg',
  '.jpeg',
  '.ppt',
  '.pptx',
];

const RequiredDocumentCard = ({ title, onSelect, onDrop, onDropError }) => (
  <div>
    <div>{title}</div>
    <div>
      <FileUploader
        name="file"
        types={ALLOWED_FILE_EXTENSION.map((e) => e.replace('.', ''))}
        handleChange={onDrop}
        onTypeError={onDropError}
        onSelect={(e) => { onSelect(e); }}
      />
      <Icon
        name="cloud-arrow-up"
        size={44}
      />
      <div>
        <div>Select a file to upload</div>
        <div>or drag and drop from your device here.</div>
      </div>
    </div>
  </div>
);

RequiredDocumentCard.propTypes = {
  title: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
  onDropError: PropTypes.func.isRequired,
};

const FilledRequiredDocumentCard = ({
  title,
  documentDetails,
  // onDownload,
  onDelete,
  isViewOnly,
  disableDelete,
  onReupload,
}) => {
  const { fileSize, fileExtension } = documentDetails;
  const location = useLocation();

  const getFileIcon = () => {
    if (!fileExtension) {
      return FilePdfImg;
    }

    switch (fileExtension.toLowerCase()) {
      case '.pdf': return FilePdfImg;
      case '.xls': return FileExcelImg;
      case '.xlsx': return FileExcelImg;
      case '.xlm': return FileExcelImg;
      case '.xlsm': return FileExcelImg;
      case '.doc': return FileWordImg;
      case '.docx': return FileWordImg;
      case '.jpg': return FileImageImg;
      case '.jpeg': return FileImageImg;
      case '.ppt': return FilePowerpointImg;
      case '.pptx': return FilePowerpointImg;
      default: return FilePdfImg;
    }
  };

  const redirectToPreviewPage = (newTab = true) => {
    localStorage.setItem('tempLocation', `${location.pathname}${location.search}`);
    const URL = `${process.env.PUBLIC_URL}/document-management/preview?transDocId=${documentDetails?.transactionDocId}`;

    if (newTab) {
      window.open(URL, '_blank');
    }
  };

  const rmTempLocation = () => localStorage.removeItem('tempLocation');

  useEffect(() => {
    rmTempLocation();
  }, []);

  return (
    <div>
      <div>{title}</div>
      <div className="required-document-filled">
        <div>
          <img
            src={getFileIcon()}
            alt="file-icon"
          />
        </div>
        <div>
          <div
            role="button"
            tabIndex={-1}
            // onClick={onDownload}
            onClick={redirectToPreviewPage}
            onKeyDown={() => {}}
          >
            <div title={`${title}${fileExtension}`}>
              {`${title}${fileExtension}`}
            </div>
          </div>
          <div>{fileSizeFormatter(fileSize)}</div>
        </div>
        <RenderIf isTrue={!isViewOnly && !disableDelete}>
          <div>
            <div
              role="button"
              tabIndex={-1}
              onClick={onDelete}
              onKeyDown={() => {}}
            >
              <Icon
                name="trash-can"
              />
            </div>
          </div>
        </RenderIf>
        <RenderIf isTrue={!isViewOnly && disableDelete}>
          <div>
            <div
              className="reupload-icon"
              role="button"
              tabIndex={-1}
              onClick={onReupload}
              onKeyDown={() => {}}
            >
              <Icon
                name="arrow-up-from-bracket"
              />
            </div>
          </div>
        </RenderIf>
      </div>
    </div>
  );
};

FilledRequiredDocumentCard.propTypes = {
  title: PropTypes.string.isRequired,
  documentDetails: PropTypes.object.isRequired,
  // onDownload: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isViewOnly: PropTypes.bool,
  disableDelete: PropTypes.bool,
  onReupload: PropTypes.func,
};

FilledRequiredDocumentCard.defaultProps = {
  isViewOnly: false,
  disableDelete: false,
  onReupload: () => {},
};

const WaitingDocumentCard = ({
  title,
  message,
}) => (
  <div className="waiting-document-card">
    <div>{title}</div>
    <div className="waiting-uploaded">
      <div>
        <Icon
          name="hourglass-clock"
          size={40}
        />
      </div>
      <div>
        {message}
      </div>
    </div>
  </div>
);

WaitingDocumentCard.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
};

WaitingDocumentCard.defaultProps = {
  message: null,
};

const ManageFileModal = ({ open, setOpen, onSave, onDelete, data }) => {
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setFileName(data?.uploadedDocument?.docName);
  }, [open, data?.uploadedDocument?.docName]);

  return (
    <Modal
      className="upload-document-manage-file-modal"
      centered
      visible={open}
      footer={null}
      onCancel={() => { setOpen(false); }}
      title="Manage File"
    >
      <div>
        <div>
          <div><b>File Name</b></div>
          <InputText
            value={fileName}
            onChange={(e) => { setFileName(e.target.value); }}
          />
        </div>
        <div>
          <div>
            <div><b>File Type</b></div>
            <InputText
              value={data?.uploadedDocument?.fileExtension}
              disabled
            />
          </div>
          <div>
            <div><b>File Size</b></div>
            <InputText
              value={fileSizeFormatter(data?.uploadedDocument?.fileSize ?? 0)}
              disabled
            />
          </div>
        </div>
        <div>
          <div>
            <Button
              label="Delete"
              size={Button.Size.LARGE}
              danger
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
            />
          </div>
          <div>
            <Button
              label="Cancel"
              size={Button.Size.LARGE}
              type={Button.Type.SECONDARY}
              onClick={() => { setOpen(false); }}
            />
            <Button
              label="Save Changes"
              size={Button.Size.LARGE}
              onClick={() => {
                setOpen(false);
                onSave(fileName);
              }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

ManageFileModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  data: PropTypes.object,
};

ManageFileModal.defaultProps = {
  data: {},
};

const LoadingModal = ({ open, message }) => (
  <Modal
    visible={open}
    footer={null}
    mask
    closable={false}
    width={200}
  >
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <Icon
        name="loader"
        type={Icon.Type.SOLID}
        size={50}
        spin
      />
      <span>{message}</span>
    </div>
  </Modal>
);

LoadingModal.propTypes = {
  open: PropTypes.bool.isRequired,
  message: PropTypes.string,
};

LoadingModal.defaultProps = {
  message: 'Loading...',
};

const FidComponent = ({
  projectId,
  projectVersion,
  projectCategory,
  threshold,
  fidCode,
  fidInput,
  setFidInput,
  fidInputErr,
  setFidInputErr,
  status,
  regional,
  onComplete,
  isWaiting,
  actors,
  listOfActorName,
}) => {
  const {
    generateFid,
    inputFid,
  } = useProjectManagementApi();
  const [confirmaionFidModal, setConfirmationFidModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      const payload = {
        projectId,
        projectVersion,
      };

      if (threshold === 'Regional') {
        payload.fidCode = fidInput;
      } else {
        payload.subholdingCode = '1';
        payload.projectCategory = projectCategory;
        payload.regional = regional;
        payload.approvedYear = moment().year();
      }

      const res = threshold === 'Regional' ? await inputFid(payload) : await generateFid(payload);
      if (res.data?.code !== 200) {
        console.log(res.response);
        if (res.response.data.message.includes('already registered')) {
          setFidInputErr(true);
          return;
        }
        window.alert('Something went wrong.');
        return;
      }

      setFidInputErr(false);
      onComplete();
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
      setConfirmationFidModal(false);
    }
  };

  return (
    <>
      <PaperHeader>
        <PaperTitle>
          {`${threshold !== 'Regional' ? 'Generate' : 'Input'} FID Number`}
        </PaperTitle>
      </PaperHeader>
      <RenderIf isTrue={!isWaiting}>
        <div className="fid-content">
          <div className="form-field">
            <div className="form-label">FID Number</div>
            <div className="input-wrapper">
              <RenderIf isTrue={threshold !== 'Regional' && status !== 'Completed'}>
                <Button
                  label="Generate FID Number"
                  size="large"
                  disabled={[status === 'Completed', isLoading, !!fidCode].includes(true)}
                  onClick={() => setConfirmationFidModal(true)}
                />
              </RenderIf>
              <InputText
                type="text"
                placeholder={`${threshold !== 'Regional' ? 'Please Generate' : 'Input'} FID Number ${threshold !== 'Regional' ? 'first' : ''}`}
                size="large"
                max={200}
                value={fidInput}
                onChange={(e) => {
                  setFidInput(e.target.value?.toUpperCase());
                }}
                disabled={[status === 'Completed', threshold !== 'Regional', !!fidCode].includes(true)}
              />
            </div>
            <RenderIf isTrue={fidInputErr && threshold === 'Regional'}>
              <div className="err-wrapper">
                <Icon
                  name="circle-xmark"
                  size={20}
                  type="solid"
                />
                <span>This FID Number is already registered</span>
              </div>
            </RenderIf>
          </div>
          <RenderIf isTrue={threshold === 'Regional' && status !== 'Completed'}>
            <div className="btn-apply-wrapper">
              <Button
                label="Apply"
                size="large"
                disabled={[!fidInput, fidInput === '', status === 'Completed', isLoading, !!fidCode].includes(true)}
                onClick={() => setConfirmationFidModal(true)}
              />
            </div>
          </RenderIf>
        </div>
      </RenderIf>
      <RenderIf isTrue={isWaiting}>
        <WaitingDocumentCard
          title="FID Number"
          message={`Waiting to be ${threshold !== 'Regional' ? 'generated' : 'input'} by ${getActorName(actors, listOfActorName)}..`}
        />
      </RenderIf>

      <ConfirmationModal
        open={confirmaionFidModal}
        setOpen={setConfirmationFidModal}
        onOk={() => {
          onSubmit();
        }}
        title="FID Number Confirmation"
        message1={`Are you sure you want to ${threshold === 'Regional' ? 'apply' : 'generate'} FID Number?`}
        message2="You can’t use previous sequence number after this."
        buttonOkLabel="Yes, I'm sure"
        isLoading={isLoading}
      />
    </>
  );
};

FidComponent.propTypes = {
  projectId: PropTypes.string.isRequired,
  projectVersion: PropTypes.any.isRequired,
  projectCategory: PropTypes.string,
  threshold: PropTypes.string,
  fidCode: PropTypes.string,
  fidInput: PropTypes.string,
  setFidInput: PropTypes.func,
  fidInputErr: PropTypes.bool,
  setFidInputErr: PropTypes.func,
  status: PropTypes.string,
  regional: PropTypes.string,
  onComplete: PropTypes.func,
  isWaiting: PropTypes.bool,
  actors: PropTypes.array,
  listOfActorName: PropTypes.array,
};

FidComponent.defaultProps = {
  projectCategory: null,
  threshold: null,
  fidCode: null,
  fidInput: '',
  setFidInput: () => {},
  fidInputErr: false,
  setFidInputErr: () => {},
  status: null,
  regional: null,
  onComplete: () => {},
  isWaiting: false,
  actors: [],
  listOfActorName: [],
};

const UploadDocumentContent = ({
  actors,
  listOfActorName,
  projectId,
  projectVersion,
  projectActionId,
  onFormValidChange,
  isViewOnly,
  disableDelete,
  showComplete,
  onComplete,
  waiting,
  onAfterUpload,
  workflowActionTypeParId,
  fidCode,
  threshold,
  status,
  projectCategory,
  regional,
  isLoading,
  setIsLoading,
}) => {
  const {
    getProjectDetails,
    getDocumentDetails,
    deleteDocument,
    downloadDocument,
    renameDocument,
    uploadRequiredDocument,
    uploadSupportingDocument,
  } = useDocumentApi();

  const {
    completeUpload,
  } = useProjectManagementApi();

  const [projectDetailsData] = useLoadData({
    getDataFunc: getProjectDetails,
    getDataParams: { projectId, projectVersion },
    dataKey: 'data',
  });

  const [documentDetailsData,,, updateGetDataParams, refreshData] = useLoadData({
    getDataFunc: getDocumentDetails,
    getDataParams: { projectActionId: projectActionId || projectDetailsData?.initiationAction },
    dataKey: 'data',
  });

  const [fid, setFid] = useState('');
  const [fidInputErr, setFidInputErr] = useState(false);
  const [toDeleteId, setToDeleteId] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedRow, setSelectedRow] = useState(null);
  const [manageFileModalOpen, setManageFileModalOpen] = useState(false);

  const [forbiddenFileModalOpen, setForbiddenFileModalOpen] = useState(false);
  const [forbiddenFileSizeModalOpen, setForbiddenFileSizeModalOpen] = useState(false);
  const [forbiddenFileMaxLengthModalOpen, setForbiddenFileMaxLengthModalOpen] = useState(false);
  const [forbiddenFileMaxLengthAltModalOpen, setForbiddenFileMaxLengthAltModalOpen] = useState(false);
  const [completeConfirmationModalOpen, setCompleteConfirmationModalOpen] = useState(false);

  const [isUploading, setIsUploading] = useState(false);

  const [completeIsValid, setCompleteIsValid] = useState(false);

  const fileRef = useRef(null);
  const fileInputRef = useRef(null);
  const fileKeyRef = useRef(null);

  useEffect(() => {
    if (projectActionId) {
      return;
    }

    if (!projectDetailsData?.initiationAction || documentDetailsData) {
      return;
    }

    updateGetDataParams({
      projectActionId: projectDetailsData.initiationAction,
    });
    refreshData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectDetailsData?.initiationAction, projectActionId]);

  useEffect(() => {
    if (fidCode) {
      setFid(fidCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fidCode]);

  useEffect(() => {
    if ([fid !== fidCode, !fid, fidInputErr].includes(true)) {
      setCompleteIsValid(false);
      return;
    }

    setCompleteIsValid(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fid, fidInputErr]);

  useEffect(() => {
    if (!documentDetailsData?.requiredDocs) {
      onFormValidChange(false);
      setCompleteIsValid(false);

      return;
    }

    if (documentDetailsData.requiredDocs.find((e) => e.uploadedDocument === null)) {
      onFormValidChange(false);
      setCompleteIsValid(false);

      return;
    }

    if (
      status === 'In-Progress'
      && workflowActionTypeParId === 'UploadFID'
      && [fid !== fidCode, !fid, fidInputErr].includes(true)
    ) {
      setCompleteIsValid(false);
      return;
    }

    onFormValidChange(true);
    setCompleteIsValid(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentDetailsData?.requiredDocs, fid, fidInputErr]);

  const clickToUploadHandler = () => {
    fileKeyRef.current = null;
    fileInputRef.current.click();
  };

  const onRowEditHandler = (index) => {
    setSelectedRow(documentDetailsData.supportingDocs[index]);
    setManageFileModalOpen(true);
  };

  const onRowDeleteHandler = (index) => {
    setToDeleteId(documentDetailsData.supportingDocs[index].uploadedDocument.transactionDocId);
    setDeleteModalOpen(true);
  };

  const onDeleteRequiredDocument = (id) => {
    setToDeleteId(id);
    setDeleteModalOpen(true);
  };

  const onDownloadDocumentHandler = async (id, fileName, fileExtension) => {
    const response = await downloadDocument({ transactionDocId: id });

    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileName}${fileExtension}`);
    document.body.appendChild(link);
    link.click();
  };

  const onSaveFileHandler = async (newName) => {
    const id = selectedRow.uploadedDocument.transactionDocId;

    if (newName.length > 150) {
      setForbiddenFileMaxLengthAltModalOpen(true);

      return;
    }

    await renameDocument({ transactionDocId: id, newName });

    refreshData();
  };

  const onFileChangeHandler = async (e) => {
    if (!e.target.files.length) {
      return;
    }

    const file = e.target.files[0];
    fileRef.current = file;

    const fileNames = file.name.split('.');
    // eslint-disable-next-line no-shadow
    const fileName = fileNames.filter((e, i) => i < fileNames.length - 1).join('.');
    const fileExtension = `.${fileNames[fileNames.length - 1]}`;

    if (!ALLOWED_FILE_EXTENSION.includes(fileExtension.toLowerCase())) {
      setForbiddenFileModalOpen(true);

      return;
    }

    const fileSize = file.size;

    if (fileSize > 70 * 1024 * 1024) {
      setForbiddenFileSizeModalOpen(true);

      return;
    }

    if (!fileKeyRef.current && fileName.length > 150) {
      setForbiddenFileMaxLengthModalOpen(true);

      return;
    }

    const projectActionIdParam = projectActionId || projectDetailsData?.initiationAction;

    setIsUploading(true);

    if (!fileKeyRef.current) {
      await uploadSupportingDocument({
        projectActionId: projectActionIdParam,
        file,
      });
    } else {
      await uploadRequiredDocument({
        projectActionId: projectActionIdParam,
        docDescriptionId: fileKeyRef.current,
        file,
      });
    }

    setIsUploading(false);

    refreshData();
    onAfterUpload();
  };

  const completeHandler = async () => {
    const projectActionIdParam = projectActionId || projectDetailsData?.initiationAction;

    try {
      setIsLoading(true);
      await completeUpload({ projectActionId: projectActionIdParam });
      onComplete();
    } catch (e) {
      console.log(e);
    } finally {
      setCompleteConfirmationModalOpen(false);
      setIsLoading(false);
    }
  };

  const disableComplete = () => !completeIsValid;

  const supportingDocumentColumns = [
    {
      Header: 'File Name',
      accessor: 'docName',
      // eslint-disable-next-line react/prop-types
      Cell: ({ value, row }) => {
        // eslint-disable-next-line react/prop-types
        const { transactionDocId } = row.original;

        return (
          <div
            style={{
              color: '#1a79cb',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
            role="button"
            tabIndex={-1}
            onClick={() => {
              const URL = `${process.env.PUBLIC_URL}/document-management/preview?transDocId=${transactionDocId}`;

              window.open(URL, '_blank');
            }}
            onKeyDown={() => {}}
            title={value}
          >
            {value}
          </div>
        );
      },
    },
    { Header: 'File Type', accessor: 'fileExtension' },
    {
      Header: 'Size',
      accessor: 'fileSize',
      // eslint-disable-next-line react/prop-types
      Cell: ({ value }) => (
        <div>
          {fileSizeFormatter(value ?? 0)}
        </div>
      ),
    },
    {
      Header: 'Date Modified',
      accessor: 'updatedDate',
      // eslint-disable-next-line react/prop-types
      Cell: ({ value }) => (
        <div>
          {value ? moment.utc(value, 'DD-MM-YYYY').clone().local().format('DD MMM YYYY') : '-'}
        </div>
      ),
    },
    {
      Header: 'Action',
      accessor: 'action',
      // eslint-disable-next-line react/prop-types
      Cell: ({ row }) => (
        <div className="action-cell">
          <div className="edit-icon">
            <Button
              label=""
              shape={Button.Shape.CIRCLE}
              onClick={(e) => {
                e.stopPropagation();
                // eslint-disable-next-line react/prop-types
                onRowEditHandler(row.id);
              }}
              primaryIcon={(
                <Icon
                  name="pencil"
                  type="solid"
                />
              )}
            />
          </div>
          <div className="trash-can-icon">
            <Button
              label=""
              shape={Button.Shape.CIRCLE}
              onClick={(e) => {
                e.stopPropagation();
                // eslint-disable-next-line react/prop-types
                onRowDeleteHandler(row.id);
              }}
              primaryIcon={(
                <Icon
                  name="trash-can"
                  type="solid"
                />
              )}
            />
          </div>
        </div>
      ),
    },
  ];

  if (!documentDetailsData) {
    return <></>;
  }

  return (
    <>
      <div className="create-project-upload-document-content">
        <RenderIf isTrue={workflowActionTypeParId === 'UploadFID'}>
          <div className="create-project-upload-document-paper">
            <FidComponent
              projectId={projectId}
              projectVersion={projectVersion}
              threshold={threshold}
              fidCode={fidCode}
              fidInput={fid}
              setFidInput={(value) => setFid(value)}
              fidInputErr={fidInputErr}
              setFidInputErr={(value) => setFidInputErr(value)}
              status={status}
              onComplete={onComplete}
              regional={regional}
              projectCategory={projectCategory}
              isWaiting={waiting}
              actors={actors}
              listOfActorName={listOfActorName}
            />
          </div>
        </RenderIf>
        <div className="create-project-upload-document-paper">
          <PaperHeader>
            <PaperTitle>
              Required Document
            </PaperTitle>
          </PaperHeader>
          <div className="required-document">
            <div
              style={{
                width: documentDetailsData.requiredDocs.length > 1 ? 'calc(50% - 16px)' : '100%',
              }}
            >
              {
                documentDetailsData.requiredDocs
                  .map((e) => ({ ...e, key: e.docDescriptionId, value: e.requiredName }))
                  .filter((e, index) => index < documentDetailsData.requiredDocs.length / 2)
                  .map((e) => {
                    if (waiting) {
                      return (
                        <WaitingDocumentCard
                          key={e.key}
                          title={e.value}
                          message={`Waiting to be uploaded by ${getActorName(actors, listOfActorName)}..`}
                        />
                      );
                    }

                    if (e.uploadedDocument) {
                      return (
                        <FilledRequiredDocumentCard
                          key={e.key}
                          title={e.value}
                          documentDetails={e.uploadedDocument}
                          onDownload={() => {
                            onDownloadDocumentHandler(
                              e.uploadedDocument.transactionDocId,
                              e.uploadedDocument.docName,
                              e.uploadedDocument.fileExtension,
                            );
                          }}
                          onDelete={() => { onDeleteRequiredDocument(e.uploadedDocument.transactionDocId); }}
                          isViewOnly={isViewOnly}
                          disableDelete={disableDelete}
                          onReupload={() => {
                            fileKeyRef.current = e.key;
                            fileInputRef.current.click();
                          }}
                        />
                      );
                    }

                    return (
                      <RequiredDocumentCard
                        key={e.key}
                        title={e.value}
                        onSelect={() => {
                          fileKeyRef.current = e.key;
                        }}
                        onDrop={(droppedFile) => {
                          fileKeyRef.current = e.key;
                          onFileChangeHandler({ target: { files: [droppedFile] } });
                        }}
                        onDropError={() => { setForbiddenFileModalOpen(true); }}
                      />
                    );
                  })
              }
            </div>
            <div
              style={{
                display: documentDetailsData.requiredDocs.length > 1 ? 'flex' : 'none',
              }}
            >
              {
                documentDetailsData.requiredDocs
                  .map((e) => ({ ...e, key: e.docDescriptionId, value: e.requiredName }))
                  .filter((e, index) => index >= documentDetailsData.requiredDocs.length / 2)
                  .map((e) => {
                    if (waiting) {
                      return (
                        <WaitingDocumentCard
                          key={e.key}
                          title={e.value}
                          message={`Waiting to be uploaded by ${getActorName(actors, listOfActorName)}..`}
                        />
                      );
                    }

                    if (e.uploadedDocument) {
                      return (
                        <FilledRequiredDocumentCard
                          key={e.key}
                          title={e.value}
                          documentDetails={e.uploadedDocument}
                          onDownload={() => {
                            onDownloadDocumentHandler(
                              e.uploadedDocument.transactionDocId,
                              e.uploadedDocument.docName,
                              e.uploadedDocument.fileExtension,
                            );
                          }}
                          onDelete={() => { onDeleteRequiredDocument(e.uploadedDocument.transactionDocId); }}
                          isViewOnly={isViewOnly}
                          disableDelete={disableDelete}
                          onReupload={() => {
                            fileKeyRef.current = e.key;
                            fileInputRef.current.click();
                          }}
                        />
                      );
                    }

                    return (
                      <RequiredDocumentCard
                        key={e.key}
                        title={e.value}
                        onSelect={() => {
                          fileKeyRef.current = e.key;
                        }}
                        onDrop={(droppedFile) => {
                          fileKeyRef.current = e.key;
                          onFileChangeHandler({ target: { files: [droppedFile] } });
                        }}
                        onDropError={() => { setForbiddenFileModalOpen(true); }}
                      />
                    );
                  })
              }
            </div>
          </div>
        </div>
        <div className="create-project-upload-document-paper">
          <PaperHeader>
            <PaperTitle>
              <div>Supporting Document</div>
              <RenderIf isTrue={!isViewOnly && !waiting}>
                <Button
                  label="Click to upload"
                  size={Button.Size.LARGE}
                  type={Button.Type.SECONDARY}
                  primaryIcon={<Icon name="arrow-up-from-bracket" />}
                  onClick={clickToUploadHandler}
                />
              </RenderIf>
            </PaperTitle>
          </PaperHeader>
          <div
            style={{
              height:
                documentDetailsData?.supportingDocs?.length && !waiting
                  ? (documentDetailsData.supportingDocs.length * 58) + documentDetailsData.supportingDocs.length + 49
                  : 400,
            }}
          >
            <Table
              data={
                !documentDetailsData?.supportingDocs?.length || waiting
                  ? []
                  : documentDetailsData.supportingDocs.map((e) => ({
                    ...e,
                    ...e.uploadedDocument,
                  }))
              }
              columns={supportingDocumentColumns}
              disableSort
              placeholder={(
                <div>
                  <EmptyState
                    text={waiting ? (
                      <>
                        <div><b>Waiting to be uploaded.</b></div>
                      </>
                    ) : (
                      <>
                        <div><b>There aren’t any supporting document yet</b></div>
                        <div>Start add supporting document.</div>
                      </>
                    )}
                  />
                </div>
              )}
              hiddenColumns={isViewOnly ? ['action'] : []}
            />
          </div>
        </div>
        <div>
          {
            showComplete && (
              <Button
                label="Complete"
                size={Button.Size.LARGE}
                primaryIcon={<Icon name="check" />}
                onClick={() => { setCompleteConfirmationModalOpen(true); }}
                disabled={disableComplete()}
              />
            )
          }
        </div>
      </div>
      <DeleteModal
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
        onDelete={async () => {
          if (toDeleteId === null) {
            setDeleteModalOpen(false);

            return;
          }

          await deleteDocument({ transactionDocId: toDeleteId });

          setDeleteModalOpen(false);

          refreshData();
        }}
        message1="Are you sure you want to delete this document?"
        message2="This action can’t be undone."
      />
      <ManageFileModal
        open={manageFileModalOpen}
        setOpen={setManageFileModalOpen}
        onSave={onSaveFileHandler}
        onDelete={() => {
          setToDeleteId(selectedRow.uploadedDocument.transactionDocId);
          setDeleteModalOpen(true);
          refreshData();
        }}
        data={selectedRow}
      />
      <ConfirmationModal
        open={forbiddenFileModalOpen}
        setOpen={setForbiddenFileModalOpen}
        onOk={() => {
          setForbiddenFileModalOpen(false);
          fileInputRef.current.click();
        }}
        title="Unsupported File Type"
        message1="You can't upload file with this type"
        message2="Try to upload with one of these file types: PDF, JPG/JPEG, DOC/DOCX, XLS/XLSX, PPT/PPTX."
        buttonOkLabel="Re-Upload"
        isDanger
      />
      <ConfirmationModal
        open={forbiddenFileSizeModalOpen}
        setOpen={setForbiddenFileSizeModalOpen}
        onOk={() => {
          setForbiddenFileSizeModalOpen(false);
          fileInputRef.current.click();
        }}
        title="Unsupported File Size"
        message1="File size exceeds the maximum size"
        message2="This file can't be uploaded because it exceeds the maximum file size (70 Mb)"
        buttonOkLabel="Re-Upload"
        isDanger
      />
      <ConfirmationModal
        open={forbiddenFileMaxLengthModalOpen}
        setOpen={setForbiddenFileMaxLengthModalOpen}
        onOk={() => {
          setForbiddenFileMaxLengthModalOpen(false);
          fileInputRef.current.click();
        }}
        title="File Name Max Length"
        message1="File name max length must be less than 150 characters."
        buttonOkLabel="Re-Upload"
        isDanger
      />
      <ConfirmationModal
        open={forbiddenFileMaxLengthAltModalOpen}
        setOpen={setForbiddenFileMaxLengthAltModalOpen}
        onOk={() => {
          setForbiddenFileMaxLengthAltModalOpen(false);
          setManageFileModalOpen(true);
        }}
        title="File Name Max Length"
        message1="File name max length must be less than 150 characters."
        buttonOkLabel="OK"
        isDanger
        isSingleButton
      />
      <ConfirmationModal
        open={completeConfirmationModalOpen}
        setOpen={setCompleteConfirmationModalOpen}
        onOk={() => completeHandler()}
        title="Completion Confirmation"
        message1="Are you sure you want to complete this process?"
        message2="This action can’t be undone."
        buttonOkLabel="Yes, I'm sure"
        isLoading={isLoading}
      />
      <LoadingModal
        open={isUploading}
        message="Uploading..."
      />
      <input
        ref={fileInputRef}
        type="file"
        name="import-file"
        onChange={(e) => {
          onFileChangeHandler(e);
          fileInputRef.current.value = '';
        }}
        accept="*"
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
    </>
  );
};

UploadDocumentContent.propTypes = {
  actors: PropTypes.array,
  listOfActorName: PropTypes.array,
  projectId: PropTypes.string,
  projectVersion: PropTypes.any,
  projectActionId: PropTypes.string,
  onFormValidChange: PropTypes.func,
  isViewOnly: PropTypes.bool,
  disableDelete: PropTypes.bool,
  showComplete: PropTypes.bool,
  onComplete: PropTypes.func,
  waiting: PropTypes.bool,
  onAfterUpload: PropTypes.func,
  workflowActionTypeParId: PropTypes.string,
  threshold: PropTypes.string,
  fidCode: PropTypes.string,
  status: PropTypes.string,
  projectCategory: PropTypes.string,
  regional: PropTypes.string,
  isLoading: PropTypes.bool,
  setIsLoading: PropTypes.func,
};

UploadDocumentContent.defaultProps = {
  actors: [],
  listOfActorName: [],
  projectId: '',
  projectVersion: 1,
  projectActionId: null,
  onFormValidChange: () => {},
  isViewOnly: false,
  disableDelete: false,
  showComplete: false,
  onComplete: () => {},
  waiting: false,
  onAfterUpload: () => {},
  workflowActionTypeParId: null,
  fidCode: null,
  status: null,
  regional: null,
  projectCategory: null,
  threshold: null,
  isLoading: false,
  setIsLoading: () => {},
};

export default UploadDocumentContent;
