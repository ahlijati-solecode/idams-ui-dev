/* eslint-disable react/prop-types */
/* eslint-disable no-alert */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Icon, InputText, SelectSearch, Table } from '@solecode/sole-ui';
import { Modal } from 'antd';
import moment from 'moment';
import EmptyState from '../assets/empty-state.png';
import axiosPrivate from '../libs/axiosPrivate';
import useWorkflowDetailApi from '../hooks/api/workflow/workflow-detail';
import { SERVICE_URL } from '../constants/serviceUrl';

import './AdministrationWorkflowSettings.scss';

const selectValues = [
  {
    label: 'Project Template Name',
    value: 'templateName',
  },
  {
    label: 'Project Category',
    value: 'projectCategory',
  },
  {
    label: 'Project Criteria',
    value: 'projectCriteria',
  },
  {
    label: 'Project Sub-criteria',
    value: 'projectSubCriteria',
  },
  {
    label: 'Threshold',
    value: 'threshold',
  },
  {
    label: 'Capex Value',
    value: 'capexValue',
  },
  {
    label: 'Total Workflow',
    value: 'totalWorkflow',
  },
  {
    label: 'Start Workflow',
    value: 'startWorkflow',
  },
  {
    label: 'End Workflow',
    value: 'endWorkflow',
  },
];

const AdmininstrationWorkflowSettings = () => {
  const [search, setSearch] = useState('');
  const [searchBy, setSearchBy] = useState(selectValues[0].value);
  const [pageIndex, setPageIndex] = useState(0);
  const [totalItem, setTotalItem] = useState(0);
  const [sortType, setSortType] = useState('desc');
  const [sortValue, setSortValue] = useState('updatedDate');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGenerate, setIsLoadingGenerate] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [workFlowSettings, setWorkflowSettings] = useState([]);
  const navigate = useNavigate();

  const { getGenerateWorkflowTemplate } = useWorkflowDetailApi();

  async function getWorkflowSettings() {
    setIsLoading(true);
    const sort = sortValue && sortType ? `${sortValue} ${sortType}` : 'updatedDate desc';
    const searchText = searchBy && search !== '' ? `&${searchBy}=${search}` : '';

    await axiosPrivate.get(
      `${SERVICE_URL}/WorkflowSetting/WorkflowSettingList?size=10&page=${pageIndex + 1}&sort=${sort}${searchText}`,
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
    ).then((response) => {
      setWorkflowSettings(response.data.data.items);
      setTotalItem(response.data.data.totalItems);
    }).catch((err) => {
      console.log(err);
    });

    setIsLoading(false);
  }

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
    getWorkflowSettings();
  }, [fetcher]);

  useEffect(() => {
    triggerFetcher();
  }, [sortType, sortValue]);

  function keyPress(e) {
    setSearch(e.target.value);
  }

  function selectSearchBy(e) {
    setSearchBy(e);
  }

  async function deleteWorkflow() {
    await axiosPrivate.delete(
      `${SERVICE_URL}/WorkflowSetting/?templateId=${selectedWorkflow.templateId}&templateVersion=${selectedWorkflow.templateVersion}`
    ).then(() => {
      getWorkflowSettings();
    }).catch((err) => {
      console.log(err);
    });
    setSelectedWorkflow(null);
    setIsVisible(false);
  }

  function openModal(row) {
    setIsVisible(true);
    setSelectedWorkflow({ templateId: row.original.templateId, templateVersion: row.original.templateVersion });
  }

  function closeModal() {
    setIsVisible(false);
    setSelectedWorkflow(null);
  }

  async function handleGenerateTemplate(data) {
    setIsLoadingGenerate(true);
    try {
      const res = await getGenerateWorkflowTemplate({
        templateId: data.templateId,
        templateVersion: data.templateVersion,
      });

      if (res.code !== 200) {
        window.alert('Something went wrong.');
        return;
      }

      navigate(`/administration/workflow-settings/details?templateId=${res.data.templateId}&templateVersion=${res.data.templateVersion}`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingGenerate(false);
    }
  }

  const threshold = {
    Regional: {
      value: 'Regional',
      color: '#fcc29c',
    },
    SHU: {
      value: 'SHU',
      color: '#f76707',
    },
    Holding: {
      value: 'Holding',
      color: '#883904',
    },
  };

  const tableColumns = [
    {
      Header: 'Project Template Name',
      accessor: 'templateName',
      headerStyle: {
        maxWidth: '33%',
        minWidth: '33%',
        width: '33%',
      },
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { row } }) => (
        <button type="button" onClick={() => handleGenerateTemplate(row.original)} className="truncate link">{row.original.templateName}</button>
      ),
    },
    {
      Header: 'Project Category',
      accessor: 'projectCategory',
      headerStyle: {
        maxWidth: '13%',
        minWidth: '13%',
        width: '13%',
      },
    },
    {
      Header: 'Project Criteria',
      accessor: 'projectCriteria',
      headerStyle: {
        maxWidth: '13%',
        minWidth: '13%',
        width: '13%',
      },
    },
    {
      Header: 'Project Sub Criteria',
      accessor: 'projectSubCriteria',
      headerStyle: {
        maxWidth: '13%',
        minWidth: '13%',
        width: '13%',
      },
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { value } }) => (
        <div>{value || '-'}</div>
      ),
    },
    {
      Header: 'Threshold',
      accessor: 'threshold',
      headerStyle: {
        maxWidth: '33%',
        minWidth: '33%',
        width: '33%',
      },
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { value } }) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {
            value && (
            <>
              <div className="dot" style={{ marginRight: '12px', backgroundColor: threshold[value].color }} />
              {threshold[value].value}
            </>
            )
          }
        </div>
      ),
    },
    {
      Header: 'Capex Value',
      accessor: 'capexValue',
      headerStyle: {
        maxWidth: '13%',
        minWidth: '13%',
        width: '13%',
      },
    },
    {
      Header: 'Total Workflow',
      accessor: 'totalWorkflow',
      headerStyle: {
        maxWidth: '13%',
        minWidth: '13%',
        width: '13%',
      },
    },
    {
      Header: 'Start Workflow',
      accessor: 'startWorkflow',
      headerStyle: {
        maxWidth: '13%',
        minWidth: '13%',
        width: '13%',
      },
    },
    {
      Header: 'End Workflow',
      accessor: 'endWorkflow',
      headerStyle: {
        maxWidth: 'fit-content',
        minWidth: 'fit-content',
        width: 'fit-content',
      },
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { value } }) => <div className="truncate-end-workflow">{value}</div>,
    },
    {
      Header: 'Status',
      accessor: 'status',
      headerStyle: {
        maxWidth: '13%',
        minWidth: '13%',
        width: '13%',
      },
      Cell: ({ cell: { value } }) => (
        <div className={`pills ${value !== 'Active' && 'red-pills'}`}>
          {value}
        </div>
      ),
    },
    {
      Header: 'Date Modified',
      accessor: 'updatedDate',
      headerStyle: {
        maxWidth: '13%',
        minWidth: '13%',
        width: '13%',
      },
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { value } }) => (
        <div>
          {value ? moment.utc(value).clone().local().format('DD MMM YYYY HH:mm') : '-'}
        </div>
      ),
    },
    {
      Header: 'Action',
      accessor: 'templateId',
      disableSort: true,
      hideFilter: true,
      hideSort: true,
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { row } }) => (
        <div className="table-inside-button">
          <Button
            label="Button Title"
            shape="circle"
            onClick={() => openModal(row)}
            primaryIcon={<Icon name="trash-can" type="solid" />}
          />
        </div>
      ),
    },
  ];

  function goToCreateWorkflow() {
    navigate('/administration/workflow-settings/details');
  }

  return (
    <div className="workflow-settings-container">
      <div className="graphic-banner">
        Workflow Setting
      </div>
      <Modal
        className="rounded-confirm-modal"
        centered
        visible={isVisible}
        footer={null}
      >
        <div className="modal-delete">
          <div className="modal-header">
            <Icon name="trash-can" type="regular" size="48" />
            <div style={{ margin: '8px 0px' }}>Delete Confirmation</div>
          </div>
          <div className="modal-content">
            <div style={{ marginBottom: '8px' }}>Are you sure you want to delete this workflow?</div>
            <div className="light-text">This action can’t be undone.</div>
          </div>
          <div style={{ marginTop: '24px' }} className="modal-footer">
            <Button onClick={() => closeModal()} label="Cancel" size="middle" type="secondary" />
            <Button onClick={() => deleteWorkflow()} label="Delete" size="middle" type="danger" />
          </div>
        </div>
      </Modal>
      <Modal
        className="rounded-confirm-modal"
        centered
        visible={isLoadingGenerate}
        footer={null}
        width={150}
      >
        <div className="modal-loading">
          <div className="modal-header">
            <Icon name="loader" type={Icon.Type.SOLID} size={100} spin />
          </div>
        </div>
      </Modal>
      <div className="card">
        <div className="card-header">
          <div className="search-bar">
            <SelectSearch
              value={searchBy}
              onChange={(e) => {
                selectSearchBy(e);

                if (!search) {
                  return;
                }

                triggerFetcher();
              }}
              onSearch={(e) => {
                selectSearchBy(e);

                if (!search) {
                  return;
                }

                triggerFetcher();
              }}
              options={selectValues}
              placeholder="Project Template Name"
            />
            <div className="divider" />
            <InputText
              value={search}
              placeholder="Search"
              onPressEnter={(e) => {
                keyPress(e);
                triggerFetcher();
              }}
              onChange={(e) => {
                const newValue = e.target.value;

                setSearch(newValue);

                if (newValue) {
                  return;
                }

                triggerFetcher();
              }}
              suffix={{
                name: 'magnifying-glass',
                type: 'regular',
              }}
            />
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Button
              label="Create New Workflow"
              onClick={() => goToCreateWorkflow()}
              primaryIcon={<Icon name="plus" type="solid" />}
            />
          </div>
        </div>
        <div className="card-content">
          <div
            style={{
              marginTop: '24px',
              height: isLoading || workFlowSettings.length === 0 ? 'calc(100vh - 32px)' : 'fit-content',
            }}
            className="stick-table"
          >
            <Table
              columns={tableColumns}
              data={workFlowSettings}
              isLoading={isLoading}
              itemsTotal={totalItem}
              pageSizes={[
                10,
              ]}
              pageIndex={pageIndex}
              setPageIndex={(e) => {
                setPageIndex(e);
                triggerFetcher(e);
              }}
              sortType={sortType}
              setSortType={setSortType}
              sortValue={sortValue}
              setSortValue={setSortValue}
              showPagination
              placeholder={(
                <div>
                  <div className="empty-state">
                    <img alt="empty-state" src={EmptyState} />
                    <span className="text">You don&apos;t have any Project Workflow Template yet</span>
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmininstrationWorkflowSettings;
