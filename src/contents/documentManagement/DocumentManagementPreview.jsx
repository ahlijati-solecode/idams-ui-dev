/* eslint-disable no-alert */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Icon, Button } from '@solecode/sole-ui';
import RenderIf from '../RenderIf';
import useDocumentApi from '../../hooks/api/document';
import convertToLocalTime from '../../libs/convertToLocalTime';
import './DocumentManagementPreview.scss';
import { goToTop } from '../../libs/commonUtils';
import { sourceParent, TabItem } from './enums/enums';

const DocumentManagementPreview = () => {
  const navigate = useNavigate();
  const { getHistoryDocument, dlDocument, downloadDocument } = useDocumentApi();
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const transDocId = searchParams.get('transDocId');
  const [isLoading, setIsLoading] = useState({ list: false, preview: false, download: false });
  const [list, setList] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [selectedDoc, setSelectedDoc] = useState({});
  const [isPreviewAvailable, setIsPreviewAvailable] = useState(true);

  const downloadFiles = async (isMultiple = false) => {
    try {
      setIsLoading((prev) => ({ ...prev, download: true }));
      let selectedIds = null;
      if (!isMultiple) selectedIds = [selectedDoc?.transactionDocId];
      else selectedIds = list?.map((el) => el?.transactionDocId);

      const res = await dlDocument(selectedIds);
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', selectedIds.length === 1 ? `${selectedDoc?.fileName}` : 'documents');
      document.body.appendChild(link);
      link.click();
      setIsLoading((prev) => ({ ...prev, download: false }));
    } catch (e) {
      console.log(e);
    }
  };

  const getTempLocation = () => localStorage.getItem('tempLocation');

  const redirectToList = () => {
    console.log('redirect to list...', state);
    if (!state) {
      navigate(getTempLocation());
    } else if (state?.tab === sourceParent.FILES) {
      navigate('/document-management/project-document', { state: { selectedTab: TabItem?.FILES } });
    } else if (state?.tab === sourceParent.DETAILS) {
      navigate(`/project-management/detail-project?projectId=${state?.params?.projectId}&projectVersion=${state?.params?.projectVersion}&tab=projectDocument`, {
        state: {
          projectName: state?.params?.projectName,
          workflowType: state?.params?.workflowType,
          status: state?.params?.status,
          regional: state?.params?.regional,
          zona: state?.params?.zona,
          rkap: state?.params?.rkap,
          revision: state?.params?.revision,
          threshold: state?.params?.threshold,
          subCriteria: state?.params?.subCriteria,
        },
      });
    } else if (state?.tab === sourceParent.PROJECTS) {
      const url = `/document-management/project-document${state?.params?.projectId ? `?projectId=${state?.params?.projectId}` : ''}`;
      navigate(url, {
        state: {
          selectedTab: TabItem?.PROJECTS,
          projectName: state?.params?.projectName,
          workflowType: state?.params?.workflowType,
          status: state?.params?.status,
          regional: state?.params?.regional,
          zona: state?.params?.zona,
          rkap: state?.params?.rkap,
          revision: state?.params?.revision,
          threshold: state?.params?.threshold,
          subCriteria: state?.params?.subCriteria,
        },
      });
    } else {
      console.log('masuk sini dia...');
    }
  };

  const previewFile = async (id) => {
    try {
      setIsLoading((prev) => ({ ...prev, preview: true }));
      const res = await downloadDocument({ transactionDocId: id });
      if (res?.status !== 200) {
        window.alert('Something went wrong.');
        console.log(res);
        return;
      }
      const file = window.URL.createObjectURL(res?.data);
      setIsLoading((prev) => ({ ...prev, preview: false }));

      const iframe = document.querySelector('iframe');
      if (iframe?.src) iframe.src = file;
    } catch (e) {
      console.log(e);
    }
  };

  const setPreviewHandler = (doc) => {
    if (!['.pdf', '.jpg', '.jpeg', '.png', 'jfif'].includes(doc?.fileExtension?.toLowerCase())) {
      setIsPreviewAvailable(false);
    } else {
      setIsPreviewAvailable(true);
      previewFile(doc?.transactionDocId);
    }
  };

  const getDocHistory = async (id) => {
    try {
      setIsLoading((prev) => ({ ...prev, list: true }));
      const res = await getHistoryDocument(id);
      if (res.data?.code !== 200) {
        window.alert('Something went wrong.');
        console.log(res);
        return;
      }

      const datas = res.data.data;
      const selectedIdxs = datas.findIndex((item) => item?.transactionDocId === transDocId);
      const selected = datas.find((item) => item?.transactionDocId === transDocId);
      setSelectedDoc(selected);
      setPreviewHandler(selected);
      setList(datas);
      setActiveIdx(selectedIdxs);
      setIsLoading((prev) => ({ ...prev, list: false }));
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (!transDocId) return;
    getDocHistory(transDocId);
    goToTop();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!list?.length) return;
    setSelectedDoc(list?.[activeIdx]);
    setPreviewHandler(selectedDoc);

    // eslint-disable-next-line consistent-return
    return () => {
      setSelectedDoc({});
    };
  }, [activeIdx, selectedDoc]);

  return (
    <div className="document-management-preview-page">
      <div className="custom-row">
        <div className="custom-col-12">
          <div className="header-banner-1">
            <div className="left">
              <Icon name="arrow-left" />
              <span
                className="breadcrumb"
                onClick={redirectToList}
                onKeyDown={redirectToList}
                role="button"
                tabIndex={0}
              >
                Browse Files
              </span>
            </div>
            <div className="right">
              <RenderIf isTrue={isLoading?.download}>
                <div className="spinner-wrapper">
                  <Icon name="spinner-third" spin size={24} />
                </div>
              </RenderIf>
              <Button
                shape="circle"
                primaryIcon={<Icon name="arrow-down-to-bracket" type="regular" />}
                disabled={Boolean(!Object.keys(selectedDoc).length) || isLoading?.download}
                onClick={() => {
                  if (isLoading?.download) return;
                  downloadFiles(false);
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="custom-row">
        <div className="custom-col-3">
          <div className="list-wrapper">
            <RenderIf isTrue={isLoading?.list}>
              <div className="spinner-wrapper">
                <Icon name="spinner-third" size={64} spin />
              </div>
            </RenderIf>
            <RenderIf isTrue={!isLoading?.list}>
              <div className="custom-container">
                <div className="detail-wrapper">
                  <div className="file-name">{selectedDoc?.fileName}</div>
                  <div className="text-normal">
                    <div className="doc-type">{selectedDoc?.docType}</div>
                    <div className="project-title">{selectedDoc?.projectName}</div>
                    <div className="treshold-regional-zona">{`${selectedDoc?.regional} · ${selectedDoc?.zona} · ${selectedDoc?.threshold}`}</div>
                  </div>
                  <div className="last-modified">{`Last update ${selectedDoc?.lastModified ? convertToLocalTime(selectedDoc?.lastModified) : '-'}`}</div>
                </div>
                <div className="version-history">
                  <span>Version History</span>
                  <span
                    className="link"
                    onClick={() => {
                      if (isLoading?.download) return;
                      downloadFiles(true);
                    }}
                    onKeyDown={() => {
                      if (isLoading?.download) return;
                      downloadFiles(true);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    Download All
                  </span>
                </div>
              </div>
              <div className="history-wrapper">
                {
                  list?.map((item, idx) => (
                    <div
                      key={`item-${item?.transactionDocId}`}
                      className={['list', activeIdx === idx ? 'active' : ''].join(' ')}
                      onClick={() => setActiveIdx(idx)}
                      onKeyDown={() => setActiveIdx(idx)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="file-name">{item?.fileName}</div>
                      <div className="workflow-type-etc">{`${item?.docType} · ${item?.workflowType} · ${item?.projectName}`}</div>
                      <div className="last-modified">{`Last update ${item?.lastModified ? convertToLocalTime(item?.lastModified) : '-'}`}</div>
                    </div>
                  ))
                }
              </div>
            </RenderIf>
          </div>
        </div>
        <div className="custom-col-9">
          <div className="file-viewer-wrapper">
            <RenderIf isTrue={isLoading?.preview}>
              <div className="spinner-wrapper">
                <Icon name="spinner-third" spin size={64} />
              </div>
            </RenderIf>
            <RenderIf isTrue={!isLoading?.preview && !isPreviewAvailable}>
              <div className="no-preview">
                No preview available for this file type.
              </div>
            </RenderIf>
            <RenderIf isTrue={!isLoading?.preview && isPreviewAvailable}>
              <iframe title="previewFile" src="" width="100%" height="100%" />
            </RenderIf>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentManagementPreview;
