/* eslint-disable no-alert */
/* eslint-disable react-hooks/exhaustive-deps */
// import React, { useState, useEffect } from 'react';
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { Icon, Button, Checkbox, Table } from '@solecode/sole-ui';
import Collapse from '../../../components/Collapse';
import { Dropdown, SearchFilter, PaperHeader, PaperTitle } from '../../../components';
import useProjectManagementApi from '../../../hooks/api/projectManagement';
import RenderIf from '../../RenderIf';
import { goToTop } from '../../../libs/commonUtils';
import { filterCol, filterColByProject, sourceParent as SP, cascadeFilterKey } from '../enums/enums';
import { camelCase, titleCase } from '../../../libs/stringUtils';
import './FilesContent.scss';
import useDocumentApi from '../../../hooks/api/document';
import StatusPill from './StatusPill';
import DetailGroup from './DetailGroup';
import KEY_NAME from '../enums/keyName';

const PAGE_SIZE = 10;

const FilesContent = ({
  sourceParent,
  data,
  setIsLoading,
  getList,
  setSelectedRowIds,
  setSort,
  isFirstRender,
  setIsFirstRender,
}) => {
  const { state } = useLocation();
  const {
    getDropdown,
    getAvailableStage,
    getAvailableWorkflowType,
    getHierLvl2s,
    getHierLvl3s,
  } = useProjectManagementApi();
  const { getDocumentTypeList, dlDocument } = useDocumentApi();
  const [dropdownFilter, setDropdownFilter] = useState({});
  const [copyOfDropdownFilter, setCopyOfDropdownFilter] = useState({});
  const [searchBy, setSearchBy] =
    useState(sourceParent === SP.FILES ? filterCol[0].value : filterColByProject[0].value);
  const [searchValue, setSearchValue] = useState('');
  const [collapseActiveKey, setCollapseActiveKey] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [filterData, setFilterData] = useState({});
  const [filterQuery, setFilterQuery] = useState({});
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
  const selectedCasscade = useRef([]);

  const constructObj = (obj) => (
    obj.map((el) => {
      const children = el?.[Object.keys(el).join()];
      const tempArr = [];

      const values = Object.keys(children).map((key) => {
        tempArr.push({
          key,
          value: children[key],
        });

        return tempArr;
      });

      return {
        [titleCase(Object.keys(el).join())]: values[0],
      };
    })
  );

  const renameKeys = (item) => {
    let res = titleCase(item);
    if (item === 'hierLvl2') {
      res = 'Regional';
    } else if (item === 'hierLvl3') {
      res = 'Zona';
    } else if (item === 'Document Type') {
      res = 'docType';
    } else if (item === 'workflow') {
      res = 'Workflow Type';
    }

    return res;
  };

  const getDropdownData = async () => {
    try {
      const res = await getDropdown();

      if (res.data?.code !== 200) {
        window.alert('Something went wrong.');
        console.log(res);
        return;
      }

      const res1 = await getDocumentTypeList();

      if (res1.data?.code !== 200) {
        window.alert('Something went wrong.');
        console.log(res1);
        return;
      }

      let docType = [];
      Object.keys(res1.data.data.documents).forEach((key) => {
        docType.push({ key, value: res1.data.data.documents[key] });
      });
      docType = docType.sort((a, b) => (
        a.value.localeCompare(b.value, undefined, { numeric: true, sensitivity: 'base' })
      ))?.map((item) => ({ [item.key]: item.value }));

      const tempArrKeys = Object.keys(res.data.data);
      const mappedTempArr = tempArrKeys.map((el) => {
        let temp = [];
        Object.keys(res.data.data[el]).forEach((key) => {
          temp.push({ key, value: res.data.data[el][key] });
        });
        temp = temp.sort((a, b) => (
          a.value.localeCompare(b.value, undefined, { numeric: true, sensitivity: 'base' })
        ))?.map((item) => ({ [item.key]: item.value }));

        return { [renameKeys(el)]: Object.assign({}, ...temp) };
      });

      mappedTempArr.push({ 'Document Type': Object.assign({}, ...docType) });

      const resObj = {
        Stage: Object.assign({}, ...constructObj(mappedTempArr))?.Stage,
        'Workflow Type': Object.assign({}, ...constructObj(mappedTempArr))?.['Workflow Type'],
        'Document Type': Object.assign({}, ...constructObj(mappedTempArr))?.['Document Type'],
      };

      setDropdownFilter(sourceParent === SP.FILES ? Object.assign({}, ...constructObj(mappedTempArr)) : resObj);
      setCopyOfDropdownFilter(sourceParent === SP.FILES ? Object.assign({}, ...constructObj(mappedTempArr)) : resObj);
    } catch (e) {
      console.log(e);
    }
  };

  const downloadFiles = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, download: true }));
      const idxs = Object.keys(data?.selectedRowIds);
      const transDocIds = idxs?.map((item) => (data?.fileList?.items?.[item]?.transactionDocId));
      const fileName = idxs?.map((item) => {
        const path = data?.fileList?.items?.[item]?.fileName?.props?.children;
        return path?.[path.length - 1]?.props?.children;
      });
      const res = await dlDocument(transDocIds);
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', transDocIds.length === 1 ? fileName : 'documents');
      document.body.appendChild(link);
      link.click();
      setIsLoading((prev) => ({ ...prev, download: false }));
    } catch (e) {
      console.log(e);
    }
  };

  const onPageIndexChange = (e) => {
    if (isFirstRender) setIsFirstRender(false);
    setFilterData((prev) => ({ ...prev, page: Number(e) + 1 }));
    setFilterQuery((prev) => ({ ...prev, page: Number(e) + 1 }));
    setSelectedRowIds({});
    setPageIndex(e);
  };

  const fetchAndReplaceDropdownData = async (key, payload) => {
    try {
      const casscadeKeyPairs = {
        Stage: 'Workflow Type',
        'Workflow Type': 'Stage',
        Regional: 'Zona',
        Zona: 'Regional',
      };

      let res = null;

      if (key === 'Stage') {
        res = await getAvailableWorkflowType({ stage: payload?.map((item) => item) });
        if (Object.keys(filterData).includes('workflowType')) {
          const filterWorkflowType = filterData.workflowType;
          const tempRes = Object.keys(res.data.data);
          const diff = filterWorkflowType.filter((x) => !tempRes.includes(x));

          if (diff.length && tempRes.length) {
            const temp = { ...filterData };
            diff.forEach((el) => {
              const idx = filterWorkflowType?.findIndex((x) => x === el);
              if (idx !== -1) temp.workflowType.splice(idx, 1);
            });
            setFilterData(temp);
          }
        }
      } else if (key === 'Workflow Type') {
        res = await getAvailableStage({ workflowType: payload?.map((item) => item) });
        if (Object.keys(filterData).includes('stage')) {
          const filterStage = filterData.stage;
          const tempRes = Object.keys(res.data.data);
          const diff = filterStage.filter((x) => !tempRes.includes(x));

          if (diff.length && tempRes.length) {
            const temp = { ...filterData };
            diff.forEach((el) => {
              const idx = filterStage?.findIndex((x) => x === el);
              if (idx !== -1) temp.stage.splice(idx, 1);
            });
            setFilterData(temp);
          }
        }
      } else if (key === 'Regional') {
        res = await getHierLvl3s({ hierLvl2s: payload?.map((item) => item) });
        if (Object.keys(filterData).includes('zonas')) {
          const filterZona = filterData.zonas;
          const tempRes = Object.keys(res.data.data);
          const diff = filterZona.filter((x) => !tempRes.includes(x));

          if (diff.length && tempRes.length) {
            const temp = { ...filterData };
            diff.forEach((el) => {
              const idx = filterZona?.findIndex((x) => x === el);
              if (idx !== -1) temp.zonas.splice(idx, 1);
            });
            setFilterData(temp);
          }
        }
      } else if (key === 'Zona') {
        res = await getHierLvl2s({ hierLvl3s: payload?.map((item) => item) });
        if (Object.keys(filterData).includes('regional')) {
          const filterReg = filterData.regional;
          const tempRes = Object.keys(res.data.data);
          const diff = filterReg.filter((x) => !tempRes.includes(x));

          if (diff.length && tempRes.length) {
            const temp = { ...filterData };
            diff.forEach((el) => {
              const idx = filterReg?.findIndex((x) => x === el);
              if (idx !== -1) temp.regional.splice(idx, 1);
            });
            setFilterData(temp);
          }
        }
      } else return;

      if (res.data?.code !== 200) {
        window.alert('Something went wrong.');
        console.log(res);
        return;
      }

      const keys = Object.keys(res.data.data);
      const final = keys?.map((el) => ({ key: el, value: res.data.data?.[el] }))?.sort((a, b) => (
        a.value.localeCompare(b.value, undefined, { numeric: true, sensitivity: 'base' })
      ));

      setDropdownFilter((prev) => ({
        ...prev,
        // [cascadeFilterKey[key]]: keys.length ? final : [...copyOfDropdownFilter[casscadeKeyPairs[key]]],
        [cascadeFilterKey[key]]: payload?.length ? final : [...copyOfDropdownFilter[casscadeKeyPairs[key]]],
      }));
    } catch (e) {
      console.log(e);
    }
  };

  const onCheckboxChange = (e, item, el) => {
    if (isFirstRender) setIsFirstRender(false);

    onPageIndexChange(0);

    const filter = { ...filterData };
    const tempKey = camelCase(renameKeys(item)) === 'zona' ? 'zonas' : camelCase(renameKeys(item));

    if (!Object.keys(filterData).includes(tempKey)) {
      filter[tempKey] = [];
    }

    if (e.target.checked) {
      filter[tempKey].push(el?.key);
    } else {
      const idx = filter[tempKey].indexOf(el?.key);
      if (idx !== -1) filter[tempKey].splice(idx, 1);
    }

    filter.page = 1;
    setFilterData(filter);

    if (tempKey === 'regional') {
      if (selectedCasscade.current.includes('zonas')) return;
      if (!selectedCasscade.current.includes(tempKey)) {
        selectedCasscade.current.push(tempKey);
      }
      if (filter[tempKey].length === 0) {
        const idx = selectedCasscade.current.findIndex((key) => key === tempKey);
        if (idx !== -1) selectedCasscade.current.splice(idx, 1);
        if (filter?.zonas?.length) {
          fetchAndReplaceDropdownData('Zona', filter?.zonas);
        }
      }
    }

    if (tempKey === 'zonas') {
      if (selectedCasscade.current.includes('regional')) return;
      if (!selectedCasscade.current.includes(tempKey)) {
        selectedCasscade.current.push(tempKey);
      }
      if (filter[tempKey].length === 0) {
        const idx = selectedCasscade.current.findIndex((key) => key === tempKey);
        if (idx !== -1) selectedCasscade.current.splice(idx, 1);
        if (filter?.regional?.length) {
          fetchAndReplaceDropdownData('Regional', filter?.regional);
        }
      }
    }

    if (tempKey === 'stage') {
      if (selectedCasscade.current.includes('workflowType')) return;
      if (!selectedCasscade.current.includes(tempKey)) {
        selectedCasscade.current.push(tempKey);
      }
      if (filter[tempKey].length === 0) {
        const idx = selectedCasscade.current.findIndex((key) => key === tempKey);
        console.log(selectedCasscade.current);
        if (idx !== -1) selectedCasscade.current.splice(idx, 1);
        if (filter?.workflowType?.length) {
          fetchAndReplaceDropdownData('Workflow Type', filter?.workflowType);
        }
      }
    }

    if (tempKey === 'workflowType') {
      if (selectedCasscade.current.includes('stage')) return;
      if (!selectedCasscade.current.includes(tempKey)) {
        selectedCasscade.current.push(tempKey);
      }
      if (filter[tempKey].length === 0) {
        console.log(selectedCasscade.current);
        const idx = selectedCasscade.current.findIndex((key) => key === tempKey);
        if (idx !== -1) selectedCasscade.current.splice(idx, 1);
        if (filter?.stage?.length) {
          fetchAndReplaceDropdownData('Stage', filter?.stage);
        }
      }
    }

    fetchAndReplaceDropdownData(item, filter[tempKey]);
  };

  useEffect(() => {
    setSelectedRowIds({});
    if (!Object.values(filterQuery).length || isFirstRender) return;
    getList(filterData, filterQuery);
  }, [filterQuery]);

  useEffect(() => {
    setSelectedRowIds({});
    if (!Object.values(filterData).length || isFirstRender) return;
    getList(filterData, filterQuery);
  }, [filterData]);

  useEffect(() => {
    setSelectedRowIds({});
    if (!data?.sortValue || !data?.sortType) {
      setFilterData((prev) => ({ ...prev, sort: `${KEY_NAME.DATE_MODIFIED} desc` }));
    } else {
      setFilterData((prev) => ({ ...prev, sort: `${data?.sortValue} ${data?.sortType}` }));
    }
  }, [data?.sortValue, data?.sortType]);

  useEffect(() => {
    getDropdownData();
    goToTop();
  }, []);

  return (
    <div className="files-content">
      <PaperHeader>
        <PaperTitle>
          <RenderIf isTrue={[SP.PROJECTS, SP.DETAILS].includes(sourceParent)}>
            <div>
              <span>Browse Projects</span>
              <span>
                {
                  data?.selectedProject?.projectName
                  || state?.projectName
                  || '-'
                }
              </span>
            </div>
          </RenderIf>
          <RenderIf isTrue={sourceParent === SP.FILES}>
            <div>Browse Files</div>
          </RenderIf>
        </PaperTitle>
      </PaperHeader>
      <RenderIf isTrue={Boolean([SP.PROJECTS].includes(sourceParent) && state?.status)}>
        <div className="custom-row">
          <div className="detail-wrapper">
            <StatusPill
              status={state?.status}
              workflowType={state?.workflowType}
            />
            <DetailGroup
              threshold={state?.threshold}
              hierLvl2Desc={state?.regional}
              hierLvl3Desc={state?.zona}
              rkap={state?.rkap}
              revision={state?.revision}
              subCriteria={state?.subCriteria}
            />
          </div>
        </div>
      </RenderIf>
      <div className="custom-row">
        <div className="custom-col-4">
          <div className="filter-wrapper">
            <span className="filter-title">Filter Data</span>
            <div className="collapse-wrapper">
              {
                Object.keys(dropdownFilter)?.map((item) => (
                  <Collapse
                    expandIcon={({ isActive }) => <Icon name={isActive ? 'angle-up' : 'angle-down'} />}
                    expandIconPosition="end"
                    activeKey={collapseActiveKey}
                    data={[
                      {
                        header: item,
                        children: (
                          <div className="children-wrapper">
                            {
                              dropdownFilter[item].map((el) => (
                                <Checkbox
                                  label={el?.value}
                                  onChange={(e) => onCheckboxChange(e, item, el)}
                                  key={`checkbox-${el?.key}`}
                                />
                              ))
                            }
                          </div>
                        ),
                        key: `panel-${item?.toLowerCase()}`,
                      },
                    ]}
                    key={`collapse-${item?.toLowerCase()}`}
                    onChange={(e) => setCollapseActiveKey(e)}
                  />
                ))
              }
            </div>
          </div>
        </div>
        <div className="custom-col-8">
          <div className={['table-wrapper', data?.isLoading?.list ? ' table-loading' : '', !data?.fileList?.items?.length ? ' table-no-data' : ''].join('')}>
            <div className="table-header">
              <div className="search-filter-wrapper">
                <SearchFilter
                  searchBy={searchBy}
                  setSearchBy={(e) => {
                    if (e !== 'RKAP') {
                      setFilterData((prev) => ({ ...prev, revision: [true, false] }));
                    }
                    setSearchValue('');
                    setSearchBy(e);

                    if (Object.keys(filterQuery).length) setFilterQuery({});
                  }}
                  options={sourceParent === SP.FILES ? filterCol : filterColByProject}
                  filterPlaceholder="Select Filter"
                  searchValue={searchValue}
                  setSearchValue={(e) => {
                    if (isFirstRender) setIsFirstRender(false);
                    const optionVar = sourceParent === SP.FILES ? filterCol : filterColByProject;

                    const keyOfSearchBy = optionVar?.find((el) => el?.value === searchBy)?.key;
                    setSearchValue(e);
                    if (!searchBy) return;

                    onPageIndexChange(0);
                    setFilterQuery((prev) => ({ ...prev, [keyOfSearchBy]: ['', null].includes(e) ? [] : [e], page: 1 }));
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
                        setFilterData((prev) => ({ ...prev, revision: [true, false] }));
                        setDropdownRevisionFilterLabel('All RKAP');
                      } else if (dropdownDataRevision?.[index]?.key === 'revisi') {
                        setFilterData((prev) => ({ ...prev, revision: [true] }));
                        setDropdownRevisionFilterLabel('Revisi');
                      } else {
                        setFilterData((prev) => ({ ...prev, revision: [false] }));
                        setDropdownRevisionFilterLabel('Non-Revisi');
                      }
                      onPageIndexChange(0);
                      setDropdownRevisionOpen(false);
                    }}
                    visible={dropdownRevisionOpen}
                  />
                </RenderIf>
              </div>
              <div className="btn-wrapper">
                <RenderIf isTrue={data?.isLoading?.download}>
                  <div className="spinner-wrapper">
                    <Icon name="spinner-third" spin size={24} />
                  </div>
                </RenderIf>
                <Button
                  label={`Download ${Object.keys(data?.selectedRowIds).length ? `(${Object.keys(data?.selectedRowIds).length})` : ''}`}
                  type="primary"
                  size="large"
                  primaryIcon={(
                    <Icon
                      name="arrow-down-to-bracket"
                      type="regular"
                      size={20}
                    />
                  )}
                  disabled={!Object.values(data?.selectedRowIds)?.length || data?.isLoading?.download}
                  onClick={downloadFiles}
                />
              </div>
            </div>
            <Table
              data={data?.fileList?.items || []}
              columns={data?.header}
              selectable
              multiSelect
              showCheckBoxSelection
              selectedRowIds={data?.selectedRowIds}
              onSelectedRowIdsChange={setSelectedRowIds}
              sortValue={data?.sortValue}
              setSortValue={(e) => {
                if (isFirstRender) setIsFirstRender(false);
                setSort('value', e);
              }}
              sortType={data?.sortType}
              setSortType={(e) => {
                if (isFirstRender) setIsFirstRender(false);
                setSort('type', e);
              }}
              showPagination
              pageIndex={pageIndex}
              setPageIndex={(e) => onPageIndexChange(e)}
              pageSize={PAGE_SIZE}
              itemsTotal={data?.fileList?.totalItems ?? 0}
              isLoading={data?.isLoading?.list}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

FilesContent.propTypes = {
  sourceParent: PropTypes.string,
  data: PropTypes.shape({
    isLoading: PropTypes.object,
    fileList: PropTypes.object,
    selectedRowIds: PropTypes.object,
    sortType: PropTypes.string,
    sortValue: PropTypes.string,
    selectedProject: PropTypes.object,
    header: PropTypes.array,
  }),
  setIsLoading: PropTypes.func,
  getList: PropTypes.func,
  setSort: PropTypes.func,
  setSelectedRowIds: PropTypes.func,
  isFirstRender: PropTypes.bool,
  setIsFirstRender: PropTypes.func,
};

FilesContent.defaultProps = {
  sourceParent: SP.FILES,
  data: {
    isLoading: { download: false, list: false },
    fileList: {},
    selectedRowIds: {},
    sortType: 'desc',
    sortValue: KEY_NAME.DATE_MODIFIED,
    selectedProject: {},
    header: [],
  },
  setIsLoading: () => {},
  getList: () => {},
  setSort: () => {},
  setSelectedRowIds: () => {},
  isFirstRender: false,
  setIsFirstRender: () => {},
};

export default FilesContent;
