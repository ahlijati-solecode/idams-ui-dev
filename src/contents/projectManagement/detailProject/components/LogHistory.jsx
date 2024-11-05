/* eslint-disable no-alert */
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import moment from 'moment';
import { Table } from '@solecode/sole-ui';
import { SearchFilter } from '../../../../components';
import './LogHistory.scss';

import EmptyState from '../../../../assets/empty-state.png';

import useProjectManagementApi from '../../../../hooks/api/projectManagement';
import { DEFAULT_LOG_HISTORY_FILTER_OPTIONS } from '../constants/enums';

const LogHistory = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const [logHistories, setLogHistories] = useState([]);
  // filter
  const [searchBy, setSearchBy] = useState(DEFAULT_LOG_HISTORY_FILTER_OPTIONS[0].value);
  const [searchValue, setSearchValue] = useState();

  // table
  const [isLoading, setIsLoading] = useState(false);
  const [totalItem, setTotalItem] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [sortType, setSortType] = useState('desc');
  const [sortValue, setSortValue] = useState('dateModified');

  const { getLogHistory } = useProjectManagementApi();

  const getActivityColor = ({ original }) => {
    let color = '';

    switch (true) {
      case original.workflowActionType === 'Upload' && original.documentGroupParId === 'ReqChecklistDoc':
        color = '#f76707';
        break;
      case ['Upload', 'UploadFID', 'UploadUpdateData'].includes(original.workflowActionType):
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

  const getLastStatusColor = (value) => {
    let color = '';

    switch (value) {
      case 'Rejected':
        color = '#d25705';
        break;
      case 'Completed':
        color = '#51810f';
        break;
      case 'In-Progress':
        color = '#1667ad';
        break;
      case 'Draft':
      default:
        color = '#c678d9';
        break;
    }

    return color;
  };

  const tableColumns = [
    {
      Header: 'User',
      accessor: 'empName',
    },
    {
      Header: 'Workflow',
      accessor: 'workflowName',
    },
    {
      Header: 'Action',
      accessor: 'action',
    },
    {
      Header: 'Activity Description',
      accessor: 'activityDescription',
      // eslint-disable-next-line react/prop-types
      Cell: ({ row, value }) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              width: 12,
              height: 12,
              marginRight: 12,
              borderRadius: '50%',
              backgroundColor: getActivityColor(row),
            }}
          >
              &nbsp;
          </div>
          <div>
            {value}
          </div>
        </div>
      ),
    },
    {
      Header: 'Last Status',
      accessor: 'lastStatus',
      // eslint-disable-next-line react/prop-types
      Cell: ({ value }) => {
        if (!value) {
          return <></>;
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
              border: `1px solid ${getLastStatusColor(value)}`,
              color: getLastStatusColor(value),
            }}
          >
            {value}
          </div>
        );
      },
    },
    {
      Header: 'Date Modified',
      accessor: 'dateModified',
      headerStyle: {
        maxWidth: 185,
        minWidth: 185,
        width: 185,
      },
      // eslint-disable-next-line react/prop-types
      Cell: ({ value }) => (
        <div>
          {value ? moment.utc(value).clone().local().format('DD MMM YYYY HH:mm') : '-'}
        </div>
      ),
    },
  ];

  const getLogHistoryAction = async () => {
    setIsLoading(true);
    try {
      const sort = sortType ? `${sortValue} ${sortType}` : null;
      const payload = {
        projectId,
        page: pageIndex + 1,
        size: 10,
        sort,
      };

      if (searchBy && searchValue) {
        payload[searchBy] = searchValue;
      }

      const res = await getLogHistory(payload);

      if (res.code !== 200) {
        window.alert('Something went wrong.');
        return;
      }

      setLogHistories(res.data?.items);
      setTotalItem(res.data?.totalItems);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getLabelOptions = () => DEFAULT_LOG_HISTORY_FILTER_OPTIONS.filter((i) => i.value === searchBy)[0].label;

  const [fetcher, setFetcher] = useState(null);

  const triggerFetcher = (newPageIndex) => {
    setPageIndex(newPageIndex || 0);

    setTimeout(() => {
      setFetcher((new Date()).toString());
    }, 1);
  };

  useEffect(() => {
    if (!fetcher) {
      return;
    }

    getLogHistoryAction();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher]);

  useEffect(() => {
    getLogHistoryAction();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="log-history-page">
      <div className="log-filter">
        <SearchFilter
          searchBy={searchBy}
          setSearchBy={(e) => {
            setSearchBy(e);

            if (!searchValue) {
              return;
            }

            triggerFetcher();
          }}
          options={DEFAULT_LOG_HISTORY_FILTER_OPTIONS}
          filterPlaceholder="Select Filter"
          searchValue={searchValue}
          setSearchValue={(e) => {
            setSearchValue(e);
            triggerFetcher();
          }}
          inputPlaceholder={searchBy ? `Search by ${getLabelOptions()}` : 'Search'}
        />
      </div>

      <div className="log-table" style={{ height: isLoading || logHistories.length === 0 ? '400px' : 'fit-content' }}>
        <Table
          columns={tableColumns}
          data={logHistories}
          isLoading={isLoading}
          itemsTotal={totalItem}
          pageSizes={[10]}
          pageIndex={pageIndex}
          setPageIndex={(e) => {
            setPageIndex(e);
            triggerFetcher(e);
          }}
          sortType={sortType}
          setSortType={(e) => {
            setSortType(e);
            triggerFetcher();
          }}
          sortValue={sortValue}
          setSortValue={(e) => {
            setSortValue(e);
            triggerFetcher();
          }}
          showPagination
          placeholder={(
            <div>
              <div className="empty-state">
                <img alt="empty-state" src={EmptyState} />
                <span className="text">You don&apos;t have any Log History yet</span>
              </div>
            </div>
              )}
        />
      </div>
    </div>
  );
};

export default LogHistory;
