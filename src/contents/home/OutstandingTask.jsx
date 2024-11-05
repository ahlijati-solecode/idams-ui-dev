import React, { useState, useEffect } from 'react';
import moment from 'moment/moment';
import { useNavigate } from 'react-router-dom';
import { Icon, Table } from '@solecode/sole-ui';
import useMenuHelper from '../useMenuHelper';
import { EmptyState, Paper, PaperDivider, PaperHeader, PaperTitle, SearchFilter } from '../../components';
import { useLoadData } from '../../hooks';
import useOutstandingTaskList from '../../hooks/api/outstandingTaskList';
import './OutstandingTask.scss';

const COLUMNS = [
  { key: 'projectName', value: 'Project Title', readonly: true },
  { key: 'hierLvl2Desc', value: 'Regional & Zona', readonly: true },
  { key: 'stage', value: 'Stage', readonly: true },
  { key: 'threshold', value: 'Threshold', readonly: true },
  { key: 'workflowType', value: 'Workflow' },
  { key: 'updatedDate', value: 'Date Modified' },
  { key: 'requiredAction', value: 'Required Action' },
];

const SEARCH_OPTIONS = [
  { value: 'projectName', label: 'Project Title' },
  { value: 'hierLvl2Desc', label: 'Regional' },
  { value: 'hierLvl3Desc', label: 'Zona' },
  { value: 'stage', label: 'Stage' },
  { value: 'threshold', label: 'Threshold' },
  { value: 'workflowType', label: 'Workflow' },
  { value: 'workflowActionName', label: 'Required Action' },
];

const OutstandingTask = () => {
  const { getList } = useOutstandingTaskList();
  const navigate = useNavigate();
  const { setSelectedMenuKeys } = useMenuHelper();

  const [sortValue, setSortValue] = useState('updatedDate');
  const [sortType, setSortType] = useState('desc');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [searchBy, setSearchBy] = useState(SEARCH_OPTIONS[0].value);
  const [searchValue, setSearchValue] = useState('');

  const [fetcher, setFetcher] = useState(null);

  const triggerFetcher = (newPageIndex) => {
    setPageIndex(newPageIndex || 0);

    setTimeout(() => {
      setFetcher((new Date()).toString());
    }, 1);
  };

  const pageSizes = [10, 20, 50, 100];

  const getDataParams = {
    page: pageIndex + 1,
    size: pageSize,
    sort: `${sortValue} ${sortType}`,
  };

  const [listData, listDataIsLoading,, updateGetDataParams, refreshData] = useLoadData({
    getDataFunc: getList,
    getDataParams,
    dataKey: 'data',
  });

  useEffect(() => {
    if (!fetcher) {
      return;
    }

    const newGetDataParams = {
      page: pageIndex + 1,
      size: pageSize,
      sort: sortValue && sortType ? `${sortValue} ${sortType}` : 'updatedDate desc',
    };

    if (searchBy && searchValue) {
      newGetDataParams[searchBy] = searchValue;
    }

    updateGetDataParams(newGetDataParams);

    if (!sortValue || !sortType) {
      setSortValue('updatedDate');
      setSortType('desc');
    }

    refreshData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher]);

  const getActivityColor = ({ original }) => {
    let color = '';

    switch (true) {
      case original.workflowActionType === 'Upload' && original.documentGroupParId === 'ReqChecklistDoc':
        color = '#f76707';
        break;
      case original.workflowActionType === 'Upload':
        color = '#d6336c';
        break;
      case original.workflowActionType === 'UploadUpdateData':
        color = '#d6336c';
        break;
      case original.workflowActionType === 'Approval':
        color = '#1a79cb';
        break;
      case original.workflowActionType === 'Meeting':
        color = '#5f3dc5';
        break;
      case original.workflowActionType === 'UpdateData':
        color = '#37b24d';
        break;
      default:
        color = '#FFD53D';
        break;
    }

    return color;
  };

  const dataColumns =
    COLUMNS
      .map((e) => {
        if (e.key === 'projectName') {
          const cellWidth = 200;

          return {
            Header: e.value,
            accessor: e.key,
            headerStyle: {
              width: cellWidth,
              minWidth: cellWidth,
              maxWidth: cellWidth,
            },
            // eslint-disable-next-line react/prop-types
            Cell: ({ value }) => (
              <div
                title={value}
                style={{
                  width: cellWidth,
                  minWidth: cellWidth,
                  maxWidth: cellWidth,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {value}
              </div>
            ),
          };
        }

        if (e.key === 'hierLvl2Desc') {
          return {
            Header: e.value,
            accessor: e.key,
            // eslint-disable-next-line react/prop-types
            Cell: ({ row }) => {
              // eslint-disable-next-line react/prop-types
              const { hierLvl2Desc, hierLvl3Desc } = row.original;

              return (
                <div>
                  {`${hierLvl2Desc} - ${hierLvl3Desc}`}
                </div>
              );
            },
          };
        }

        if (e.key === 'stage') {
          return {
            Header: e.value,
            accessor: e.key,
            // eslint-disable-next-line react/prop-types
            Cell: ({ value }) => {
              let bgColor;

              switch (value) {
                case 'Inisiasi':
                  bgColor = '#3c6db2';
                  break;
                case 'Seleksi':
                  bgColor = '#a6c608';
                  break;
                case 'Kajian Lanjut':
                default:
                  bgColor = '#ba313b';
                  break;
              }

              return (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 130,
                    height: 28,
                    padding: '3px 12px',
                    borderRadius: 50,
                    backgroundColor: bgColor,
                    color: '#fff',
                  }}
                >
                  {value}
                </div>
              );
            },
          };
        }

        if (e.key === 'threshold') {
          return {
            Header: e.value,
            accessor: e.key,
            // eslint-disable-next-line react/prop-types
            Cell: ({ value }) => {
              let bgColor;

              switch (value) {
                case 'Regional':
                  bgColor = '#fcc29c';
                  break;
                case 'SHU':
                  bgColor = '#f76707';
                  break;
                case 'Holding':
                default:
                  bgColor = '#883904';
                  break;
              }

              return (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      width: 12,
                      height: 12,
                      marginRight: 12,
                      borderRadius: '50%',
                      backgroundColor: bgColor,
                    }}
                  >
                    &nbsp;
                  </div>
                  <div>
                    {value}
                  </div>
                </div>
              );
            },
          };
        }

        if (e.key === 'updatedDate') {
          return {
            Header: e.value,
            accessor: e.key,
            // eslint-disable-next-line react/prop-types
            Cell: ({ value }) => (
              <div>
                {value ? moment.utc(value).clone().local().format('DD MMM YYYY HH:mm') : '-'}
              </div>
            ),
          };
        }

        if (e.key === 'requiredAction') {
          return {
            Header: e.value,
            accessor: e.key,
            disableSort: true,
            // eslint-disable-next-line react/prop-types
            Cell: ({ row }) => {
              // eslint-disable-next-line react/prop-types
              const { projectId, projectVersion, workflowActionName } = row.original;

              const bgColor = getActivityColor(row);
              const pathname = '/project-management/detail-project';
              const search = `?projectId=${projectId}&projectVersion=${projectVersion}`;

              return (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: 'fit-content',
                    padding: '3px 12px',
                    borderRadius: 50,
                    boxShadow: '0 2px 4px 0 rgba(89, 89, 89, 0.2)',
                    border: 'solid 1px rgba(38, 38, 38, 0.1)',
                    cursor: 'pointer',
                  }}
                  role="button"
                  tabIndex={-1}
                  onClick={() => {
                    setSelectedMenuKeys(['all-projects']);
                    navigate({ pathname, search });
                  }}
                  onKeyDown={() => {}}
                >
                  <div
                    style={{
                      display: 'flex',
                      width: 10,
                      height: 10,
                      marginRight: 10,
                      borderRadius: '50%',
                      backgroundColor: bgColor,
                    }}
                  >
                    &nbsp;
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                    }}
                  >
                    {workflowActionName}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      marginLeft: 10,
                    }}
                  >
                    <Icon
                      name="arrow-right"
                      size={12}
                    />
                  </div>
                </div>
              );
            },
          };
        }

        return {
          Header: e.value,
          accessor: e.key,
        };
      });

  return (
    <div className="outstanding-task-list">
      <Paper>
        <PaperHeader>
          <PaperTitle>
            <div>Outstanding Task</div>
            <div className="filter-container">
              <SearchFilter
                searchBy={searchBy}
                setSearchBy={(e) => {
                  setSearchBy(e);

                  if (!searchValue) {
                    return;
                  }

                  triggerFetcher();
                }}
                options={SEARCH_OPTIONS}
                filterPlaceholder="Select Filter"
                searchValue={searchValue}
                setSearchValue={(e) => {
                  setSearchValue(e);
                  triggerFetcher();
                }}
                inputPlaceholder="Search"
              />
            </div>
          </PaperTitle>
        </PaperHeader>
        <PaperDivider />
        <div
          className="outstanding-task-list-table"
          style={{
            height: listData?.items?.length
              ? ((listData.items.length) * 50) + 50 + 48 + 15
              : 400,
          }}
        >
          <Table
            data={listData?.items ?? []}
            columns={dataColumns}
            sortValue={sortValue}
            setSortValue={(e) => {
              setSortValue(e);
              triggerFetcher();
            }}
            sortType={sortType}
            setSortType={(e) => {
              setSortType(e);
              triggerFetcher();
            }}
            showPagination
            pageIndex={pageIndex}
            setPageIndex={(e) => {
              setPageIndex(e);
              triggerFetcher(e);
            }}
            pageSize={pageSize}
            setPageSize={(e) => {
              setPageSize(e);
              triggerFetcher();
            }}
            pageSizes={pageSizes}
            itemsTotal={listData?.totalItems ?? 0}
            isLoading={listDataIsLoading}
            placeholder={(
              <div>
                <EmptyState text="You don’t have any outstanding task yet." />
              </div>
            )}
          />
        </div>
      </Paper>
    </div>
  );
};

export default OutstandingTask;
