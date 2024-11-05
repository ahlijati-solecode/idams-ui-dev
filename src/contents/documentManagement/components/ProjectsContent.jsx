/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-alert */
import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment/moment';
import PropTypes from 'prop-types';
import { Pagination, Icon } from '@solecode/sole-ui';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import ProjectFileCard from './ProjectFileCard';
import { Dropdown, SearchFilter, PaperHeader, PaperTitle, EmptyState } from '../../../components';
import { filterColProject, HeaderProject, IconSet, sourceParent } from '../enums/enums';
import useProjectManagementApi from '../../../hooks/api/projectManagement';
import RenderIf from '../../RenderIf';
import fileSizeFormatter from '../../../libs/fileSizeFormatter';
import convertToLocalTime from '../../../libs/convertToLocalTime';
import useDocumentApi from '../../../hooks/api/document';
import KEY_NAME from '../enums/keyName';
import FilesContent from './FilesContent';
import './ProjectsContent.scss';

const PAGE_SIZE = 9;
const LIST_PAGE_SIZE = 10;

const ProjectsContent = ({ paramsData }) => {
  const [searchParams] = useSearchParams();
  const { state } = useLocation();
  const projectId = searchParams.get('projectId') || paramsData?.projectId;
  const navigate = useNavigate();
  const { getDropdown, getList } = useProjectManagementApi();
  const { getDocumentListByProject } = useDocumentApi();
  const [searchBy, setSearchBy] = useState(filterColProject[0].value);
  const [searchValue, setSearchValue] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [filterQuery, setFilterQuery] = useState({});
  const [filterData, setFilterData] = useState({ hierLvl2Desc: '', threshold: '', stage: '' });
  const [projectData, setProjectData] = useState({});
  const [listData, setListData] = useState({});
  const selectedProject = useRef({});
  const [isLoading, setIsLoading] = useState({ list: false });
  const [selectedRowIds, setSelectedRowIds] = useState({});
  const [sortValue, setSortValue] = useState(KEY_NAME.DATE_MODIFIED);
  const [sortType, setSortType] = useState('desc');

  const [dropdownDataFilter, setDropdownDataFilter] = useState({});
  const [dropdownRegionalOpen, setDropdownRegionalOpen] = useState(false);
  const [dropdownThresholdOpen, setDropdownThresholdOpen] = useState(false);
  const [dropdownStageOpen, setDropdownStageOpen] = useState(false);
  const [dropdownRevisionFilterLabel, setDropdownRevisionFilterLabel] = useState('All RKAP');
  const [dropdownDataRevision] = useState([
    {
      key: 'all',
      children: 'All RKAP',
    },
    {
      key: 'revisi',
      children: 'Revisi',
    },
    {
      key: 'nonRevisi',
      children: 'Non-Revisi',
    },
  ]);
  const [dropdownRevisionOpen, setDropdownRevisionOpen] = useState(false);

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

  const redirectToList = (item) => {
    navigate(`/document-management/project-document?projectId=${item?.projectId}`, {
      state: {
        projectName: item?.projectName,
        status: item?.status,
        workflowType: item?.workflowType,
        regional: item?.hierLvl2Desc,
        zona: item?.hierLvl3Desc,
        rkap: item?.rkap,
        revision: item?.revision,
        threshold: item?.threshold,
        subCriteria: item?.subCriteria,
      },
    });
    selectedProject.current = item;
  };

  const redirectToPreviewPage = (data) => {
    setRecentFileHandler(data);
    navigate(`/document-management/preview?transDocId=${data?.transactionDocId}`, {
      state: {
        tab: paramsData?.sourceParent || sourceParent.PROJECTS,
        params: {
          projectId,
          projectName: selectedProject.current?.projectName || state?.projectName,
          projectVersion: selectedProject.current?.projectVersion || state?.version,
          workflowType: selectedProject.current?.workflowType || state?.workflowType,
          threshold: selectedProject.current?.threshold || state?.threshold,
          regional: selectedProject.current?.hierLvl2Desc || state?.regional,
          zona: selectedProject.current?.hierLvl3Desc || state?.zona,
          status: selectedProject.current?.status || state?.status,
          rkap: selectedProject.current?.rkap || state?.rkap,
          revision: selectedProject.current?.revision || state?.revision,
          subCriteria: selectedProject.current?.subCriteria || state?.subCriteria,
        },
      },
    });
  };

  const getBadgePillClasses = (item) => {
    let classes = '';
    if (item === 'Inisiasi') classes = 'blue';
    else if (item === 'Seleksi') classes = 'green';
    else classes = 'red';

    return classes;
  };

  const getFileListByProject = async (filterParamQuery = null, filterParamData = null) => {
    setIsLoading((prev) => ({ ...prev, list: true }));
    const params = {
      page: pageIndex || 1,
      size: LIST_PAGE_SIZE,
      sort: 'dateModified desc',
      ...filterParamQuery,
      ...filterParamData,
    };

    try {
      const res = await getDocumentListByProject(projectId, params);
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
        [KEY_NAME.STAGE]: el?.stage ? <span className={`badge badge-pill-${getBadgePillClasses(el?.stage)}`}>{el?.stage}</span> : '-',
        [KEY_NAME.WORKFLOW_TYPE]: el?.workflowType || '-',
        [KEY_NAME.FILE_SIZE]: el?.fileSize ? fileSizeFormatter(el?.fileSize) : '-',
        [KEY_NAME.UPLOAD_BY]: el?.uploadBy || '-',
        [KEY_NAME.DATE_MODIFIED]: el?.dateModified ? convertToLocalTime(el?.dateModified, 'DD MMM YYYY HH:MM') : '-',
        [KEY_NAME.FILE_TYPE]: el?.fileExtension,
      }));

      setListData({ totalItems: res.data.data?.totalItems, items: mappedItems });
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading((prev) => ({ ...prev, list: false }));
    }
  };

  const getProjectList = async () => {
    setIsLoading((prev) => ({ ...prev, list: true }));
    const params = {
      page: pageIndex || 1,
      size: PAGE_SIZE,
      sort: 'updatedDate desc',
      ...filterData,
      ...filterQuery,
    };

    // rename obj zona => hierLvl3Desc
    params.hierLvl3Desc = params?.zona || null;
    delete params?.zona;

    try {
      const res = await getList(params);
      if (res.data?.code !== 200) {
        window.alert('Something went wrong.');
        console.log(res);
        return;
      }

      setProjectData(res.data.data);
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

  const getDropdownData = async () => {
    try {
      const res = await getDropdown();
      if (res?.data?.code !== 200) {
        window.alert('Something went wrong.');
        console.log(res);
        return;
      }

      const regionalData = [
        {
          key: '',
          children: 'All Regional',
        },
        ...Object.keys(res.data.data?.hierLvl2).map((e) => ({
          key: res.data.data?.hierLvl2[e],
          children: res.data.data?.hierLvl2[e],
        })),
      ];

      const thresholdData = [
        {
          key: '',
          children: 'All Threshold',
        },
        ...Object.keys(res.data.data?.threshold).map((e) => ({
          key: res.data.data?.threshold[e],
          children: res.data.data?.threshold[e],
        })),
      ];

      const stageData = [
        {
          key: '',
          children: 'All Stage',
        },
        ...Object.keys(res.data.data?.stage).map((e) => ({
          key: res.data.data?.stage[e],
          children: res.data.data?.stage[e],
        })),
      ];

      setDropdownDataFilter({ regional: regionalData, threshold: thresholdData, stage: stageData });
    } catch (e) {
      console.log(e);
    }
  };

  const onPageIndexChange = (e) => {
    setFilterQuery((prev) => ({ ...prev, page: Number(e) + 1 }));
    setPageIndex(e);
  };

  useEffect(() => {
    getDropdownData();
  }, []);

  useEffect(() => {
    if (!Object.keys(paramsData)?.length) return;

    selectedProject.current = {
      projectId: paramsData?.projectData?.projectId,
      projectName: paramsData?.projectData?.projectName,
      projectVersion: paramsData?.projectData?.projectVersion,
    };
  }, [paramsData]);

  useEffect(() => {
    if (projectId) getFileListByProject();
    else getProjectList();
    setSelectedRowIds({});
  }, [projectId]);

  useEffect(() => {
    if (projectId) getFileListByProject();
    else getProjectList();
  }, [filterData]);

  useEffect(() => {
    if (projectId) getFileListByProject();
    else getProjectList();
  }, [filterQuery]);

  return (
    <div className="projects-content">
      <RenderIf isTrue={Boolean(projectId)}>
        <FilesContent
          data={{
            isLoading,
            fileList: listData,
            selectedRowIds,
            sortType,
            sortValue,
            selectedProject: selectedProject.current,
            header: HeaderProject,
          }}
          sourceParent={paramsData?.sourceParent || sourceParent.PROJECTS}
          getList={getFileListByProject}
          setIsLoading={setIsLoading}
          setSort={setSort}
          setSelectedRowIds={setSelectedRowIds}
        />
      </RenderIf>
      <RenderIf isTrue={Boolean(!projectId)}>
        <PaperHeader>
          <PaperTitle>
            <div>Browse Projects</div>
          </PaperTitle>
        </PaperHeader>
        <div className="custom-row">
          <div className="custom-col-12">
            <div className="toolbar-wrapper">
              <div className="search-filter-wrapper">
                <SearchFilter
                  searchBy={searchBy}
                  setSearchBy={(e) => {
                    if (e !== 'RKAP') {
                      setFilterData((prev) => ({ ...prev, revision: null }));
                    }
                    setSearchValue('');
                    setSearchBy(e);

                    if (Object.keys(filterQuery).length) setFilterQuery({});
                  }}
                  options={filterColProject}
                  filterPlaceholder="Select Filter"
                  searchValue={searchValue}
                  setSearchValue={(e) => {
                    const keyOfSearchBy = filterColProject.find((el) => el?.value === searchBy)?.key;
                    setSearchValue(e);
                    if (!searchBy) return;

                    onPageIndexChange(0);
                    setFilterQuery((prev) => ({ ...prev, [keyOfSearchBy]: e, page: 1 }));
                  }}
                  inputPlaceholder="Search"
                />
                <RenderIf isTrue={searchBy === 'RKAP'}>
                  <Dropdown
                    label={dropdownRevisionFilterLabel}
                    size="large"
                    menuItem={dropdownDataRevision}
                    onVisibleChange={(e) => { setDropdownRevisionOpen(e); }}
                    onClick={(e) => {
                      const indexes = e.key.split('-');
                      const index = indexes[indexes.length - 1];
                      if (dropdownDataRevision?.[index]?.key === 'all') {
                        setFilterData((prev) => ({ ...prev, revision: null }));
                        setDropdownRevisionFilterLabel('All RKAP');
                      } else if (dropdownDataRevision?.[index]?.key === 'revisi') {
                        setFilterData((prev) => ({ ...prev, revision: 1 }));
                        setDropdownRevisionFilterLabel('Revisi');
                      } else {
                        setFilterData((prev) => ({ ...prev, revision: 0 }));
                        setDropdownRevisionFilterLabel('Non-Revisi');
                      }
                      onPageIndexChange(0);
                      setDropdownRevisionOpen(false);
                    }}
                    visible={dropdownRevisionOpen}
                  />
                </RenderIf>
              </div>
              <div className="dropdown-group">
                <Dropdown
                  label={dropdownDataFilter?.regional?.find((item) => item?.key === filterData?.hierLvl2Desc)?.children || 'Loading...'}
                  size="large"
                  menuItem={dropdownDataFilter?.regional || []}
                  visible={dropdownRegionalOpen}
                  onVisibleChange={(e) => { setDropdownRegionalOpen(e); }}
                  onClick={(e) => {
                    const indexes = e.key.split('-');
                    const index = indexes[indexes.length - 1];
                    const keyVal = dropdownDataFilter?.regional?.[Number(index)]?.key;

                    setFilterData((prev) => ({ ...prev, hierLvl2Desc: keyVal }));
                    onPageIndexChange(0);
                    setDropdownRegionalOpen(false);
                  }}
                />
                <Dropdown
                  label={dropdownDataFilter?.threshold?.find((item) => item?.key === filterData?.threshold)?.children || 'Loading...'}
                  size="large"
                  menuItem={dropdownDataFilter?.threshold || []}
                  visible={dropdownThresholdOpen}
                  onVisibleChange={(e) => { setDropdownThresholdOpen(e); }}
                  onClick={(e) => {
                    const indexes = e.key.split('-');
                    const index = indexes[indexes.length - 1];
                    const keyVal = dropdownDataFilter?.threshold?.[Number(index)]?.key;

                    setFilterData((prev) => ({ ...prev, threshold: keyVal }));
                    onPageIndexChange(0);
                    setDropdownThresholdOpen(false);
                  }}
                />
                <Dropdown
                  label={dropdownDataFilter?.stage?.find((item) => item?.key === filterData?.stage)?.children || 'Loading...'}
                  size="large"
                  menuItem={dropdownDataFilter?.stage || []}
                  visible={dropdownStageOpen}
                  onVisibleChange={(e) => { setDropdownStageOpen(e); }}
                  onClick={(e) => {
                    const indexes = e.key.split('-');
                    const index = indexes[indexes.length - 1];
                    const keyVal = dropdownDataFilter?.stage?.[Number(index)]?.key;

                    setFilterData((prev) => ({ ...prev, stage: keyVal }));
                    onPageIndexChange(0);
                    setDropdownStageOpen(false);
                  }}
                />
              </div>
            </div>
            <div className="list-wrapper">
              <RenderIf isTrue={Boolean(projectData?.items?.length) && !isLoading?.list}>
                {
                  projectData?.items?.map((item) => (
                    <div
                      className="list-item"
                      key={`list-item-${item?.projectId}`}
                      onClick={() => redirectToList(item)}
                      onKeyDown={() => redirectToList(item)}
                      role="button"
                      tabIndex={0}
                    >
                      <ProjectFileCard data={item} />
                    </div>
                  ))
                }
              </RenderIf>
              <RenderIf isTrue={!isLoading?.list && Boolean(projectData?.totalItems === 0)}>
                <EmptyState text="No data found" />
              </RenderIf>
              <RenderIf isTrue={isLoading?.list}>
                <Icon name="spinner-third" spin size={64} />
              </RenderIf>
            </div>
            <Pagination
              pageIndex={pageIndex}
              pageSize={PAGE_SIZE}
              itemsTotal={projectData?.totalItems}
              setPageIndex={(e) => onPageIndexChange(e)}
            />
          </div>
        </div>
      </RenderIf>
    </div>
  );
};

ProjectsContent.propTypes = {
  paramsData: PropTypes.object,
};

ProjectsContent.defaultProps = {
  paramsData: {},
};

export default ProjectsContent;
