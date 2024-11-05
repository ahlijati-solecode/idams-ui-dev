/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-alert */
import React, { useState, useEffect } from 'react';
import moment from 'moment/moment';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Icon } from '@solecode/sole-ui';
import RecentFileCards from './components/RecentFileCards';
import FilesContent from './components/FilesContent';
import ProjectsContent from './components/ProjectsContent';
import KEY_NAME from './enums/keyName';
import HeaderBanner from '../../components/HeaderBanner';
import { TabItem, IconSet, sourceParent, Header } from './enums/enums';
import { PaperHeader, PaperTitle } from '../../components';
import convertToLocalTime from '../../libs/convertToLocalTime';
import fileSizeFormatter from '../../libs/fileSizeFormatter';
import RenderIf from '../RenderIf';
import useDocumentApi from '../../hooks/api/document';
import './DocumentManagement.scss';

const PAGE_SIZE = 10;

const DocumentManagement = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { getDocumentList } = useDocumentApi();
  const [selectedTab, setSelectedTab] = useState(state?.selectedTab || TabItem.PROJECTS);
  const [fileList, setFileList] = useState({});
  const [isLoading, setIsLoading] = useState({ list: false, download: false });
  const [selectedRowIds, setSelectedRowIds] = useState({});
  const [sortValue, setSortValue] = useState(KEY_NAME.DATE_MODIFIED);
  const [sortType, setSortType] = useState('desc');
  const [isFirstRender, setIsFirstRender] = useState(true);

  const getRecentFileHandler = () => JSON.parse(localStorage.getItem('recentFile'));

  const setRecentFileHandler = (data) => {
    const tempData = { ...data, lastOpened: convertToLocalTime(moment(), 'MM/DD/YYYY HH:mm:ss') };

    if (!getRecentFileHandler()) {
      localStorage.setItem('recentFile', JSON.stringify([tempData]));
    } else {
      const temp = getRecentFileHandler();
      const duplicateIdx = temp.findIndex((el) => el?.transactionDocId === tempData?.transactionDocId);
      if (duplicateIdx === -1) {
        if (temp.length <= 9) {
          temp.unshift(tempData);
          localStorage.setItem('recentFile', JSON.stringify(temp));
        } else {
          temp.pop();
          temp.unshift(tempData);
          localStorage.setItem('recentFile', JSON.stringify(temp));
        }
      } else {
        const first = tempData?.transactionDocId;
        const sortedData = temp.sort((x, y) => {
          let res = null;
          if (x?.transactionDocId === first) res = -1;
          else res = y === first ? 1 : 0;

          return res;
        });

        localStorage.setItem('recentFile', JSON.stringify(sortedData));
      }
    }
  };

  const redirectToPreviewPage = (data) => {
    setRecentFileHandler(data);
    navigate(`/document-management/preview?transDocId=${data?.transactionDocId}`, { state: { tab: `document-management-${selectedTab}` || sourceParent?.FILES } });
  };

  const getBadgePillClasses = (item) => {
    let classes = '';
    if (item === 'Inisiasi') classes = 'blue';
    else if (item === 'Seleksi') classes = 'green';
    else classes = 'red';

    return classes;
  };

  const getDocList = async (filterData = null, filterQuery = null) => {
    try {
      setSelectedRowIds({});
      setIsLoading((prev) => ({ ...prev, list: true }));

      const payload = {
        page: filterData?.page || filterQuery?.page,
        size: PAGE_SIZE,
        sort: filterData?.sort || `${sortValue} ${sortType || 'desc'}`,
        ...filterData,
        ...filterQuery,
      };

      const res = await getDocumentList(payload);

      if (res.data?.code !== 200) {
        window.alert('Something went wrong.');
        console.log(res);
        return;
      }

      const mappedItems = res.data.data?.items?.map((el) => ({
        [KEY_NAME.TRANS_DOC_ID]: el?.transactionDocId,
        [KEY_NAME.FILE_NAME]: el?.fileName ? (
          <div className="filename-wrapper">
            <RenderIf isTrue={el?.fileExtension?.toLowerCase() === '.pdf'}>
              <Icon name={IconSet.PDF} type="solid" />
            </RenderIf>
            <RenderIf isTrue={['.xlsx', '.xls', '.xlm', '.xlsm'].includes(el?.fileExtension?.toLowerCase())}>
              <Icon name={IconSet.XLS} type="solid" />
            </RenderIf>
            <RenderIf isTrue={['.docx', '.doc'].includes(el?.fileExtension?.toLowerCase())}>
              <Icon name={IconSet.WORD} type="solid" />
            </RenderIf>
            <RenderIf isTrue={['.pptx', '.ppt'].includes(el?.fileExtension?.toLowerCase())}>
              <Icon name={IconSet.PPT} type="solid" />
            </RenderIf>
            <RenderIf isTrue={['.jpeg', '.jpg'].includes(el?.fileExtension?.toLowerCase())}>
              <Icon name={IconSet.JPG} type="solid" />
            </RenderIf>
            <span
              className="link"
              onClick={() => redirectToPreviewPage(el)}
              onKeyDown={() => redirectToPreviewPage(el)}
              role="button"
              tabIndex={0}
            >
              {el?.fileName}
            </span>
          </div>
        ) : '-',
        [KEY_NAME.DOC_TYPE]: el?.docType || '-',
        [KEY_NAME.DOC_CATEGORY]: el?.docCategory ? <span className={`badge badge-pill-${getBadgePillClasses(el?.docCategory)}`}>{el?.docCategory}</span> : '-',
        [KEY_NAME.PROJECT_NAME]: el?.projectName || '-',
        [KEY_NAME.REGIONAL]: el?.regional || '-',
        [KEY_NAME.ZONA]: el?.zona || '-',
        [KEY_NAME.THRESHOLD]: el?.threshold ? (
          <div className="threshold-wrapper">
            <span className={`dot dot-${el?.threshold?.toLowerCase()}`} />
            <span>{el?.threshold}</span>
          </div>
        ) : '-',
        [KEY_NAME.RKAP]: `RKAP ${el?.rkap} ${el?.revision ? 'Revisi' : ''}` || '-',
        [KEY_NAME.STAGE]: el?.stage ? <span className={`badge badge-pill-${getBadgePillClasses(el?.stage)}`}>{el?.stage}</span> : '-',
        [KEY_NAME.WORKFLOW_TYPE]: el?.workflowType || '-',
        [KEY_NAME.FILE_SIZE]: el?.fileSize ? fileSizeFormatter(el?.fileSize) : '-',
        [KEY_NAME.UPLOAD_BY]: el?.uploadBy || '-',
        [KEY_NAME.DATE_MODIFIED]: el?.dateModified ? convertToLocalTime(el?.dateModified, 'DD MMM YYYY HH:MM') : '-',
        [KEY_NAME.FILE_TYPE]: el?.fileExtension,
      }));

      setFileList({ totalItems: res.data.data?.totalItems, items: mappedItems });
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading((prev) => ({ ...prev, list: false }));
    }
  };

  const setSort = (key, value) => {
    if (key === 'type') setSortType(value);
    else setSortValue(value);
  };

  const handleScroll = (left) => {
    const el = document.getElementById('recent-file-list');
    const scrollPosition = el.scrollLeft;
    const offset = 420;

    let newScrollPosition = scrollPosition - offset < 0 ? 0 : scrollPosition - offset;

    if (!left) newScrollPosition = scrollPosition + offset;

    el.scroll(newScrollPosition, 0);
  };

  useEffect(() => {
    getDocList();
  }, []);

  return (
    <div className="document-management-page">
      <div className="custom-row">
        <HeaderBanner
          title="Document Management"
          type="primary"
        />
      </div>
      <div className="custom-row">
        <RenderIf isTrue={Boolean(getRecentFileHandler()?.length)}>
          <div className="recent-file-wrapper">
            <PaperHeader>
              <PaperTitle>
                <div>Recent Files</div>
                <div className="btn-scroll-wrapper">
                  <div className="nav-icon">
                    <Button
                      label=""
                      type="secondary"
                      size="small"
                      shape={Button.Shape.CIRCLE}
                      onClick={() => { handleScroll(true); }}
                      primaryIcon={(
                        <Icon
                          name="arrow-left"
                          size={12}
                        />
                      )}
                    />
                  </div>
                  <div className="nav-icon">
                    <Button
                      label=""
                      type="secondary"
                      size="small"
                      shape={Button.Shape.CIRCLE}
                      onClick={() => { handleScroll(false); }}
                      primaryIcon={(
                        <Icon
                          name="arrow-right"
                          size={12}
                        />
                      )}
                    />
                  </div>
                </div>
              </PaperTitle>
            </PaperHeader>
            <RecentFileCards
              data={getRecentFileHandler() ?? []}
              redirectToPreviewPage={redirectToPreviewPage}
            />
          </div>
        </RenderIf>
        <div className="group-by-wrapper">
          <span
            style={{ fontSize: '16px', fontWeight: '600', marginRight: '16px' }}
          >
            Group By
          </span>
          <div className={`btn-wrapper ${selectedTab === TabItem.PROJECTS ? 'selected' : null}`}>
            <Button
              label="Project"
              size="large"
              type="secondary"
              onClick={() => {
                navigate('/document-management/project-document');
                setSelectedTab(TabItem.PROJECTS);
              }}
              primaryIcon={(
                <Icon
                  name="suitcase"
                  type="regular"
                  size={20}
                />
              )}
            />
          </div>
          <div className={`btn-wrapper ${selectedTab === TabItem.FILES ? 'selected' : null}`}>
            <Button
              label="Files"
              size="large"
              type="secondary"
              onClick={() => {
                navigate('/document-management/project-document');
                setSelectedTab(TabItem.FILES);
              }}
              primaryIcon={(
                <Icon
                  name="folder-blank"
                  type="regular"
                  size={20}
                />
              )}
            />
          </div>
        </div>
        <div className="main-wrapper">
          <RenderIf isTrue={selectedTab === TabItem.PROJECTS}>
            <ProjectsContent />
          </RenderIf>
          <RenderIf isTrue={selectedTab === TabItem.FILES}>
            <FilesContent
              data={{
                isLoading,
                fileList,
                selectedRowIds,
                sortType,
                sortValue,
                header: Header,
              }}
              sourceParent={sourceParent.FILES}
              getList={getDocList}
              setIsLoading={setIsLoading}
              setSort={setSort}
              setSelectedRowIds={setSelectedRowIds}
              isFirstRender={isFirstRender}
              setIsFirstRender={setIsFirstRender}
            />
          </RenderIf>
        </div>
      </div>
    </div>
  );
};

export default DocumentManagement;
