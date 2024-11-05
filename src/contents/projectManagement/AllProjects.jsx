import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, Checkbox, Icon, Table } from '@solecode/sole-ui';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import useMenuHelper from '../useMenuHelper';
import useRoleHelper from '../common/useRoleHelper';
import {
  ContentHeader, DeleteModal, Dropdown, EmptyState, Paper, PaperHeader,
  PaperTitle, Popover, SearchFilter, TableHeader, TableWrapper,
} from '../../components';
import { useLoadData } from '../../hooks';
import useHomeApi from '../../hooks/api/home';
import useProjectManagementApi from '../../hooks/api/projectManagement';
import currencyFormatter from '../../libs/currencyFormatter';
import './AllProjects.scss';

const COLUMNS = [
  { key: 'projectName', value: 'Project Title', readonly: true, default: true },
  { key: 'status', value: 'Status', default: true },
  { key: 'fidcode', value: 'FID Number', default: true },
  { key: 'hierLvl2Desc', value: 'Regional', readonly: true, default: true },
  { key: 'hierLvl3Desc', value: 'Zona', readonly: true, default: true },
  { key: 'hierLvl4', value: 'Block & Field' },
  { key: 'threshold', value: 'Threshold', default: true },
  { key: 'drillingCost', value: 'Drilling Cost' },
  { key: 'facilitiesCost', value: 'Facility Cost' },
  { key: 'capex', value: 'CAPEX', default: true },
  { key: 'estFIDApproved', value: 'Est. FID' },
  { key: 'rkap', value: 'RKAP', default: true },
  { key: 'stage', value: 'Stage', default: true },
  { key: 'workflowType', value: 'Workflow', default: true },
  { key: 'projectOnStream', value: 'Project on Stream' },
  { key: 'netPresentValue', value: 'Net Present Value' },
  { key: 'internalRateOfReturn', value: 'Internal Rate of Return' },
  { key: 'profitabilityIndex', value: 'Profitability Index' },
  { key: 'oil', value: 'Oil' },
  { key: 'gas', value: 'Gas' },
  { key: 'oilEquivalent', value: 'Oil Equivalent' },
  { key: 'initiationDate', value: 'Initiation Date' },
  { key: 'endDate', value: 'End Date' },
  { key: 'workflowActionName', value: 'Outstanding Task', default: true },
  { key: 'updatedDate', value: 'Date Modified', default: true },
  { key: 'pvIn', value: 'PV In' },
  { key: 'pvOut', value: 'PV Out' },
  { key: 'benefitCostRatio', value: 'Benefit Cost Ratio' },
];

const getSearchOptions = (hierNameData) => COLUMNS.filter((e) => e.key !== 'updatedDate').map((e) => {
  const { key, value } = e;

  let label = value;

  switch (key) {
    case 'hierLvl2Desc': label = hierNameData?.hierLvl2; break;
    case 'hierLvl3Desc': label = hierNameData?.hierLvl3; break;
    case 'hierLvl4': label = hierNameData?.hierLvl4; break;
    default: break;
  }

  return {
    label,
    value: key,
  };
});

const getDefaultSelectedColumnsId = () => {
  const indexes = [];

  COLUMNS.forEach((e, i) => {
    if (!e.default) {
      return;
    }

    indexes.push(i);
  });

  return indexes;
};

const ChartCard = ({ type, title, count }) => (
  <div className={['chart-card', type].join(' ')}>
    <div>&nbsp;</div>
    <div>
      <div>{title}</div>
      <div>{count}</div>
      <div>Projects</div>
    </div>
  </div>
);

ChartCard.propTypes = {
  type: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
};

const CustomTableView = ({
  initSelectedIndexes,
  onApply,
  hierNameData,
}) => {
  const { hierLvl2, hierLvl3, hierLvl4 } = hierNameData;
  const [selectedIndexes, setSelectedIndexes] = useState(initSelectedIndexes);

  const handleCheckChange = (index, value) => {
    const newSelectedIndexes = [...selectedIndexes];

    if (value && !newSelectedIndexes.includes(index)) {
      newSelectedIndexes.push(index);
    } else if (!value && newSelectedIndexes.includes(index)) {
      newSelectedIndexes.splice(newSelectedIndexes.indexOf(index), 1);
    }

    setSelectedIndexes(newSelectedIndexes);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIndexes(COLUMNS.map((ee, index) => index));

      return;
    }

    setSelectedIndexes([0, 1, 2]);
  };

  const handleClickDefault = () => {
    setSelectedIndexes(getDefaultSelectedColumnsId());
  };

  return (
    <div className="custom-table-view">
      <div>
        <div>
          {
            COLUMNS.filter((e, index) => index < 8).map((e, index) => {
              const { value, readonly, key } = e;
              const arrIndex = index;

              let label = value;

              switch (key) {
                case 'hierLvl2Desc': label = hierLvl2; break;
                case 'hierLvl3Desc': label = hierLvl3; break;
                case 'hierLvl4': label = hierLvl4; break;
                default: break;
              }

              return (
                <div key={`custom-table-view-item-${arrIndex}`}>
                  <Checkbox
                    label={label ?? value}
                    checked={selectedIndexes.includes(arrIndex)}
                    disabled={readonly}
                    onChange={(event) => { handleCheckChange(arrIndex, event.target.checked); }}
                  />
                </div>
              );
            })
          }
        </div>
        <div>
          {
            COLUMNS.filter((e, index) => index >= 8 && index < 16).map((e, index) => {
              const { value, readonly } = e;
              const arrIndex = index + 8;

              return (
                <div key={`custom-table-view-item-${arrIndex}`}>
                  <Checkbox
                    label={value}
                    checked={selectedIndexes.includes(arrIndex)}
                    disabled={readonly}
                    onChange={(event) => { handleCheckChange(arrIndex, event.target.checked); }}
                  />
                </div>
              );
            })
          }
        </div>
        <div>
          {
            COLUMNS.filter((e, index) => index >= 16 && index < 24).map((e, index) => {
              const { value, readonly } = e;
              const arrIndex = index + 16;

              return (
                <div key={`custom-table-view-item-${arrIndex}`}>
                  <Checkbox
                    label={value}
                    checked={selectedIndexes.includes(arrIndex)}
                    disabled={readonly}
                    onChange={(event) => { handleCheckChange(arrIndex, event.target.checked); }}
                  />
                </div>
              );
            })
          }
        </div>
        <div>
          {
            COLUMNS.filter((e, index) => index >= 24).map((e, index) => {
              const { value, readonly } = e;
              const arrIndex = index + 24;

              return (
                <div key={`custom-table-view-item-${arrIndex}`}>
                  <Checkbox
                    label={value}
                    checked={selectedIndexes.includes(arrIndex)}
                    disabled={readonly}
                    onChange={(event) => { handleCheckChange(arrIndex, event.target.checked); }}
                  />
                </div>
              );
            })
          }
        </div>
      </div>
      <div>
        <div>
          <div>
            <Checkbox
              label="Select All"
              checked={selectedIndexes.length === COLUMNS.length}
              onChange={handleSelectAll}
            />
          </div>
          {
            selectedIndexes.length < 5 && (
              <Alert
                message="Please select at least 5 items."
                type={Alert.Type.WARNING}
                showIcon
                closeable={false}
              />
            )
          }
        </div>
        <div>
          <Button
            label="Default"
            size={Button.Size.LARGE}
            type={Button.Type.SECONDARY}
            onClick={handleClickDefault}
          />
          <Button
            disabled={selectedIndexes.length < 5}
            label="Apply Selection"
            size={Button.Size.LARGE}
            onClick={() => { onApply(selectedIndexes); }}
          />
        </div>
      </div>
    </div>
  );
};

CustomTableView.propTypes = {
  initSelectedIndexes: PropTypes.array,
  onApply: PropTypes.func,
  hierNameData: PropTypes.object,
};

CustomTableView.defaultProps = {
  initSelectedIndexes: [],
  onApply: () => {},
  hierNameData: {},
};

const AllProjects = () => {
  const {
    getHierName,
  } = useHomeApi();
  const {
    getBanner, getDropdown, getList,
    getTableSetting, saveTableSetting,
    deleteMultipleProject,
  } = useProjectManagementApi();
  const navigate = useNavigate();

  const [hierNameData] = useLoadData({
    getDataFunc: getHierName,
    dataKey: 'data',
  });

  const [bannerData] = useLoadData({
    getDataFunc: getBanner,
    dataKey: 'data',
  });

  const { isCreateProjectAllowed, isOpenDraftProjectAllowed, setSelectedMenuKeys } = useMenuHelper();
  const { isSuperAdmin } = useRoleHelper();

  const [searchBy, setSearchBy] = useState(getSearchOptions(hierNameData)[0].value);
  const [searchValue, setSearchValue] = useState('');

  const [dropdownRkapItems, setDropdownRkapItems] = useState([]);
  const [dropdownRkapOpen, setDropdownRkapOpen] = useState(false);
  const [dropdownRkapSelected, setDropdownRkapSelected] = useState({});

  const [dropdownRegionalItems, setDropdownRegionalItems] = useState([]);
  const [dropdownRegionalOpen, setDropdownRegionalOpen] = useState(false);
  const [dropdownRegionalSelected, setDropdownRegionalSelected] = useState({});

  const [dropdownThresholdItems, setDropdownThresholdItems] = useState([]);
  const [dropdownThresholdOpen, setDropdownThresholdOpen] = useState(false);
  const [dropdownThresholdSelected, setDropdownThresholdSelected] = useState({});

  const [dropdownStageItems, setDropdownStageItems] = useState([]);
  const [dropdownStageOpen, setDropdownStageOpen] = useState(false);
  const [dropdownStageSelected, setDropdownStageSelected] = useState({});

  const [dropdownWorkflowItems, setDropdownWorkflowItems] = useState([]);
  const [dropdownWorkflowOpen, setDropdownWorkflowOpen] = useState(false);
  const [dropdownWorkflowSelected, setDropdownWorkflowSelected] = useState({});

  const [dropdownData] = useLoadData({
    getDataFunc: getDropdown,
    dataKey: 'data',
  });

  useEffect(() => {
    if (!dropdownData) {
      return;
    }

    const { hierLvl2, threshold, stage, workflow } = dropdownData;

    setDropdownRkapItems([
      { key: 'All RKAP', children: 'All RKAP' },
      { key: 'Revisi', children: 'Revisi' },
      { key: 'Non-Revisi', children: 'Non-Revisi' },
    ]);
    setDropdownRkapSelected({ key: 'All RKAP', children: 'All RKAP' });

    const dropdownDataRegional = [
      { key: 'all', children: 'All Regional' },
      ...Object.keys(hierLvl2).map((e) => ({ key: e, children: hierLvl2[e] })),
    ];
    setDropdownRegionalItems(dropdownDataRegional);
    setDropdownRegionalSelected(dropdownDataRegional[0]);

    const dropdownDataThreshold = [
      { key: 'all', children: 'All Threshold' },
      ...Object.keys(threshold).map((e) => ({ key: e, children: threshold[e] })),
    ];
    // console.log(dropdownDataThreshold);
    setDropdownThresholdItems(dropdownDataThreshold);
    setDropdownThresholdSelected(dropdownDataThreshold[0]);

    const dropdownDataStage = [
      { key: 'all', children: 'All Stage' },
      ...Object.keys(stage).map((e) => ({ key: e, children: stage[e] })),
    ];
    setDropdownStageItems(dropdownDataStage);
    setDropdownStageSelected(dropdownDataStage[0]);

    const dropdownDataWorkflow = [
      { key: 'all', children: 'All Workflow' },
      ...Object.keys(workflow).map((e) => ({ key: e, children: workflow[e] })),
    ];
    setDropdownWorkflowItems(dropdownDataWorkflow);
    setDropdownWorkflowSelected(dropdownDataWorkflow[0]);
  }, [dropdownData]);

  const [tableSettingData] = useLoadData({
    getDataFunc: getTableSetting,
    dataKey: 'data',
  });

  const [customTableViewContentVisible, setCustomTableViewContentVisible] = useState(false);
  const [customTableViewContentKey, setCustomTableViewContentKey] = useState(1);
  const [customTableViewSelectedIndexes, setCustomTableViewSelectedIndexes] = useState(getDefaultSelectedColumnsId());

  useEffect(() => {
    if (!tableSettingData) {
      return;
    }

    try {
      const parsedTableSettingData = JSON.parse(tableSettingData);

      const readOnlyIndexes = [];

      COLUMNS.forEach((e, i) => {
        if (!e.readonly) {
          return;
        }

        readOnlyIndexes.push(i);
      });

      readOnlyIndexes.forEach((e) => {
        if (parsedTableSettingData.indexOf(e) !== -1) {
          return;
        }

        parsedTableSettingData.push(e);
      });

      setCustomTableViewSelectedIndexes(parsedTableSettingData);
    } catch (err) {
      console.log(`error parse table setting data, value: tableSettingData, error: ${err}`);

      setCustomTableViewSelectedIndexes(Array(24).fill('').map((e, index) => index));
    }
  }, [tableSettingData]);

  const [selectedRowIds, setSelectedRowIds] = useState({});
  const [sortValue, setSortValue] = useState('updatedDate');
  const [sortType, setSortType] = useState('desc');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [fetcher, setFetcher] = useState(null);

  const triggerFetcher = (newPageIndex) => {
    setSelectedRowIds({});
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
      hierLvl2Desc: dropdownRegionalSelected.children === 'All Regional' ? null : dropdownRegionalSelected.children,
      threshold: dropdownThresholdSelected.children === 'All Threshold' ? null : dropdownThresholdSelected.children,
      stage: dropdownStageSelected.children === 'All Stage' ? null : dropdownStageSelected.children,
      workflowType: dropdownWorkflowSelected.children === 'All Workflow' ? null : dropdownWorkflowSelected.children,
    };

    if (searchBy && searchValue) {
      newGetDataParams[searchBy] = searchValue;

      if (searchBy === 'rkap') {
        let revision = null;

        if (dropdownRkapSelected.children === 'Revisi') {
          revision = 1;
        } else if (dropdownRkapSelected.children === 'Non-Revisi') {
          revision = 0;
        }

        newGetDataParams.revision = revision;
      } else if (searchBy === 'fidcode') {
        delete newGetDataParams[searchBy];
        newGetDataParams.fidcodelike = searchValue;
      }
    }

    updateGetDataParams(newGetDataParams);

    if (!sortValue || !sortType) {
      setSortValue('updatedDate');
      setSortType('desc');
    }

    refreshData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher]);

  const [toDeleteIndexes, setToDeleteIndexes] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const deleteButtonDisabled = () => {
    if (!Object.keys(selectedRowIds).length) {
      return true;
    }

    const selectedData = Object.keys(selectedRowIds).map((e) => listData.items[e]);

    if (!isCreateProjectAllowed() && !isSuperAdmin) {
      return true;
    }

    if (isSuperAdmin) {
      return selectedData.find((e) => e.status === 'Draft');
    }

    if (isCreateProjectAllowed()) {
      return selectedData.find((e) => e.status !== 'Draft');
    }

    return false;
  };

  const deleteButtonVisible = () => isCreateProjectAllowed() || isSuperAdmin;

  const dataColumns =
    COLUMNS
      .filter((e, index) => customTableViewSelectedIndexes.includes(index))
      .map((e) => {
        if (e.key === 'hierLvl2Desc') {
          return {
            Header: hierNameData?.hierLvl2 ?? e.value,
            accessor: e.key,
          };
        }

        if (e.key === 'hierLvl3Desc') {
          return {
            Header: hierNameData?.hierLvl3 ?? e.value,
            accessor: e.key,
          };
        }

        if (e.key === 'hierLvl4') {
          return {
            Header: hierNameData?.hierLvl4 ?? e.value,
            accessor: e.key,
            headerStyle: {
              width: '340px',
              maxWidth: '340px',
            },
            // eslint-disable-next-line react/prop-types
            Cell: ({ value }) => (
              <div
                style={{
                  maxWidth: 330,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={value}
              >
                {value}
              </div>
            ),
          };
        }

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
            Cell: ({ value, row }) => {
              // eslint-disable-next-line react/prop-types
              const { projectId, projectVersion, status } = row.original;

              const search = `?projectId=${projectId}&projectVersion=${projectVersion}`;
              let pathname = '';

              if (isCreateProjectAllowed()) {
                pathname =
                  ['Draft', 'Rejected'].includes(status)
                    ? '/project-management/create-project'
                    : '/project-management/detail-project';
              } else {
                pathname =
                  status === 'Draft'
                    ? ''
                    : '/project-management/detail-project';
              }

              if (!pathname && status === 'Draft' && isOpenDraftProjectAllowed()) {
                pathname = '/project-management/create-project';
              }

              if (!pathname) {
                return (
                  <div>{value}</div>
                );
              }

              return (
                <div
                  style={{
                    color: '#1a79cb',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    width: cellWidth,
                    minWidth: cellWidth,
                    maxWidth: cellWidth,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  role="button"
                  tabIndex={-1}
                  onClick={() => { navigate({ pathname, search }); }}
                  onKeyDown={() => {}}
                  title={value}
                >
                  {value}
                </div>
              );
            },
          };
        }

        if (
          e.key === 'estFIDApproved' ||
          e.key === 'initiationDate' ||
          e.key === 'endDate' ||
          e.key === 'projectOnStream' ||
          e.key === 'updatedDate'
        ) {
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

        if (e.key === 'status') {
          return {
            Header: e.value,
            accessor: e.key,
            // eslint-disable-next-line react/prop-types
            Cell: ({ value }) => {
              if (!value) {
                return <></>;
              }

              let color;

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
                    border: `1px solid ${color}`,
                    color,
                  }}
                >
                  {value}
                </div>
              );
            },
          };
        }

        if (
          e.key === 'capex' ||
          e.key === 'drillingCost' ||
          e.key === 'facilitiesCost'
        ) {
          return {
            Header: e.value,
            accessor: e.key,
            // eslint-disable-next-line react/prop-types
            Cell: ({ value }) => (
              <div>
                {`$ ${value ? currencyFormatter.format(value) : 0}`}
              </div>
            ),
          };
        }

        if (
          e.key === 'netPresentValue' ||
          e.key === 'internalRateOfReturn' ||
          e.key === 'profitabilityIndex' ||
          e.key === 'oil' ||
          e.key === 'gas' ||
          e.key === 'oilEquivalent' ||
          e.key === 'pvIn' ||
          e.key === 'pvOut' ||
          e.key === 'benefitCostRatio'
        ) {
          return {
            Header: e.value,
            accessor: e.key,
            // eslint-disable-next-line react/prop-types
            Cell: ({ value }) => (
              <div>
                {`${value !== null || value !== undefined ? currencyFormatter.format(value) : 0}`}
              </div>
            ),
          };
        }

        if (e.key === 'rkap') {
          return {
            Header: e.value,
            accessor: e.key,
            // eslint-disable-next-line react/prop-types
            Cell: ({ value, row }) => {
              // eslint-disable-next-line react/prop-types
              const { revision } = row.original;

              return (
                <div>
                  {`RKAP ${value}${revision ? ' Revisi' : ''}`}
                </div>
              );
            },
          };
        }

        if (e.key === 'fidcode') {
          return {
            Header: e.value,
            accessor: e.key,
            // eslint-disable-next-line react/prop-types
            // eslint-disable-next-line react/prop-types
            Cell: ({ value }) => (
              <div>
                {value || '-'}
              </div>
            ),
          };
        }

        return {
          Header: e.value,
          accessor: e.key,
        };
      });

  if (deleteButtonVisible()) {
    dataColumns.push({
      Header: 'Action',
      accessor: 'action',
      // eslint-disable-next-line react/prop-types
      Cell: ({ row }) => {
        // eslint-disable-next-line react/prop-types
        const { status } = row.original;

        let disabled = false;

        if (isSuperAdmin) {
          disabled = status === 'Draft';
        } else if (isCreateProjectAllowed()) {
          disabled = status !== 'Draft';
        }

        if (disabled) {
          return (
            <></>
          );
        }

        return (
          <div className="trash-can-icon">
            <Button
              label=""
              shape={Button.Shape.CIRCLE}
              onClick={(e) => {
                e.stopPropagation();

                // eslint-disable-next-line react/prop-types
                setToDeleteIndexes([row.index]);
                setDeleteModalOpen(true);
              }}
              primaryIcon={(
                <Icon
                  name="trash-can"
                  type="solid"
                />
              )}
            />
          </div>
        );
      },
    });
  }

  return (
    <div className="all-projects">
      <ContentHeader title="All Projects" />
      <div className="paper-container">
        <Paper>
          <div className="chart-container">
            <ChartCard
              type="total-project"
              title="Total Project"
              count={bannerData?.length > 0 ? bannerData[0].allProject ?? 0 : 0}
            />
            <ChartCard
              type="inisiasi"
              title="Inisiasi"
              count={bannerData?.length > 0 ? bannerData[0].inisiasiProject ?? 0 : 0}
            />
            <ChartCard
              type="seleksi"
              title="Seleksi"
              count={bannerData?.length > 0 ? bannerData[0].seleksiProject ?? 0 : 0}
            />
            <ChartCard
              type="kajian-lanjut"
              title="Kajian Lanjut"
              count={bannerData?.length > 0 ? bannerData[0].kLanjutProject ?? 0 : 0}
            />
            <ChartCard
              type="fid-approved"
              title="FID Approved"
              count={bannerData?.length > 0 ? bannerData[0].fidApproved ?? 0 : 0}
            />
          </div>
        </Paper>
        <Paper>
          <PaperHeader>
            <PaperTitle>
              Project List
            </PaperTitle>
          </PaperHeader>
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
              options={getSearchOptions(hierNameData)}
              filterPlaceholder="Select Filter"
              searchValue={searchValue}
              setSearchValue={(e) => {
                setSearchValue(e);
                triggerFetcher();
              }}
              inputPlaceholder="Search"
            />
            {
              searchBy === 'rkap' && (
                <Dropdown
                  label={dropdownRkapSelected.children}
                  menuItem={dropdownRkapItems}
                  visible={dropdownRkapOpen}
                  onVisibleChange={(e) => { setDropdownRkapOpen(e); }}
                  onClick={(e) => {
                    const indexes = e.key.split('-');
                    const index = indexes[indexes.length - 1];

                    setDropdownRkapOpen(false);
                    setDropdownRkapSelected(dropdownRkapItems[index]);
                    triggerFetcher();
                  }}
                />
              )
            }
            <Dropdown
              label={dropdownRegionalSelected.children}
              menuItem={dropdownRegionalItems}
              visible={dropdownRegionalOpen}
              onVisibleChange={(e) => { setDropdownRegionalOpen(e); }}
              onClick={(e) => {
                const indexes = e.key.split('-');
                const index = indexes[indexes.length - 1];

                setDropdownRegionalOpen(false);
                setDropdownRegionalSelected(dropdownRegionalItems[index]);
                triggerFetcher();
              }}
            />
            <Dropdown
              label={dropdownThresholdSelected.children}
              menuItem={dropdownThresholdItems}
              visible={dropdownThresholdOpen}
              onVisibleChange={(e) => { setDropdownThresholdOpen(e); }}
              onClick={(e) => {
                const indexes = e.key.split('-');
                const index = indexes[indexes.length - 1];

                setDropdownThresholdOpen(false);
                setDropdownThresholdSelected(dropdownThresholdItems[index]);
                triggerFetcher();
              }}
            />
            <Dropdown
              label={dropdownStageSelected.children}
              menuItem={dropdownStageItems}
              visible={dropdownStageOpen}
              onVisibleChange={(e) => { setDropdownStageOpen(e); }}
              onClick={(e) => {
                const indexes = e.key.split('-');
                const index = indexes[indexes.length - 1];

                setDropdownStageOpen(false);
                setDropdownStageSelected(dropdownStageItems[index]);
                triggerFetcher();
              }}
            />
            <Dropdown
              label={dropdownWorkflowSelected.children}
              menuItem={dropdownWorkflowItems}
              visible={dropdownWorkflowOpen}
              onVisibleChange={(e) => { setDropdownWorkflowOpen(e); }}
              onClick={(e) => {
                const indexes = e.key.split('-');
                const index = indexes[indexes.length - 1];

                setDropdownWorkflowOpen(false);
                setDropdownWorkflowSelected(dropdownWorkflowItems[index]);
                triggerFetcher();
              }}
            />
          </div>
          <div className="all-projects-table">
            <TableWrapper>
              <TableHeader>
                <div>
                  <Popover
                    key={customTableViewContentKey}
                    content={(
                      <CustomTableView
                        initSelectedIndexes={customTableViewSelectedIndexes}
                        onApply={(value) => {
                          setCustomTableViewSelectedIndexes(value);
                          setCustomTableViewContentVisible(false);
                          saveTableSetting(JSON.stringify(value));
                        }}
                        hierNameData={hierNameData}
                      />
                    )}
                    visible={customTableViewContentVisible}
                    onVisibleChange={(e) => {
                      setCustomTableViewContentVisible(e);

                      if (e) {
                        return;
                      }

                      setCustomTableViewContentKey(customTableViewContentKey + 1);
                    }}
                  >
                    <Button
                      label="Custom Table View"
                      size={Button.Size.LARGE}
                      type={Button.Type.SECONDARY}
                      secondaryIcon={<Icon name="angle-down" />}
                    />
                  </Popover>
                </div>
                <div>
                  {
                    deleteButtonVisible() && (
                      <Button
                        label={`Delete Selected (${Object.keys(selectedRowIds).length})`}
                        size={Button.Size.LARGE}
                        danger
                        disabled={deleteButtonDisabled()}
                        onClick={() => {
                          const toDeleteIdxs =
                            Object.keys(selectedRowIds)
                              .filter((e) => selectedRowIds[e])
                              .map((e) => e);

                          setToDeleteIndexes(toDeleteIdxs);
                          setDeleteModalOpen(true);
                        }}
                      />
                    )
                  }
                  {
                    isCreateProjectAllowed() && (
                      <Button
                        label="Create New Project"
                        size={Button.Size.LARGE}
                        onClick={() => {
                          setSelectedMenuKeys(['create-project']);
                          navigate('/project-management/create-project');
                        }}
                      />
                    )
                  }
                </div>
              </TableHeader>
              <div
                className="all-projects-table-wrapper"
                style={{
                  height: listData?.items?.length
                    ? ((listData.items.length) * 58) + 58 + 58 + 30
                    : 400,
                }}
              >
                <Table
                  data={listData?.items ?? []}
                  columns={dataColumns}
                  selectable
                  multiSelect
                  showCheckBoxSelection
                  selectedRowIds={selectedRowIds}
                  onSelectedRowIdsChange={setSelectedRowIds}
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
                  showPagination={listData?.items?.length > 0}
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
                      <EmptyState text="You don’t have any project yet." />
                    </div>
                  )}
                />
              </div>
            </TableWrapper>
          </div>
        </Paper>
      </div>
      <DeleteModal
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
        onDelete={async () => {
          if (!toDeleteIndexes.length) {
            setDeleteModalOpen(false);

            return;
          }

          const selectedData = toDeleteIndexes.map((e) => {
            const { projectId, projectVersion } = listData?.items[e];

            return {
              ProjectId: projectId,
              ProjectVersion: projectVersion,
            };
          });

          if (!selectedData.length) {
            setDeleteModalOpen(false);

            return;
          }

          await deleteMultipleProject({ Projects: selectedData });

          setDeleteModalOpen(false);

          const goToPrevPage = selectedData.length === listData.items.length && pageIndex;

          triggerFetcher(goToPrevPage ? pageIndex - 1 : pageIndex);
        }}
        message1={
          toDeleteIndexes.length > 1
            ? `Are you sure you want to delete this (${toDeleteIndexes.length}) selected rows?`
            : 'Are you sure you want to delete this row?'
        }
        message2="This action can’t be undone."
      />
    </div>
  );
};

export default AllProjects;
