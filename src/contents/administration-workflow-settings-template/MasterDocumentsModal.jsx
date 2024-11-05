import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { Button, InputText, SelectSearch, Table, Icon, Alert } from '@solecode/sole-ui';
import moment from 'moment';
import PropTypes from 'prop-types';
import EmptyState from '../../assets/empty-state.png';
import useWorkflowDetailApi from '../../hooks/api/workflow/workflow-detail';
import './DocumentTable.scss';

const selectValues = [
  {
    label: 'Document Description',
    value: 'docDescription',
  },
  {
    label: 'Doc. Type',
    value: 'docType',
  },
  {
    label: 'Date Modified',
    value: 'createdDate',
  },
];

const MasterDocumentModal = ({
  getSequenceDocuments,
  docsData,
  docVersion,
  docGroupParId,
  isAddVisible,
  closeAddModal,
  stage,
}) => {
  const [masterDocumentFilterBy, setMasterDocumentFilterBy] = useState(selectValues[0].value);
  const [masterPageIndex, setMasterPageIndex] = useState(0);
  const [masterTotalItem, setMasterTotalItem] = useState(0);
  const [masterSortType, setMasterSortType] = useState('desc');
  const [masterSortValue, setMasterSortValue] = useState('createdDate');
  const [masterIsLoading, setMasterIsLoading] = useState(false);
  const [masterSearch, setMasterSearch] = useState('');
  const [masterDocuments, setMasterDocuments] = useState([]);
  const [masterSelectedDocuments, setMasterSelectedDocuments] = useState([]);
  const [masterFilterCategory, setMasterfilterCategory] = useState(stage === 'KLanjut' ? 'Kajian Lanjut' : stage);
  const { getMasterDocuments, postSequenceDocumentlist } = useWorkflowDetailApi();

  const [rowIndexs, setRowIndexs] = useState();

  const filterMdDocs = (mdData, listData) => mdData.filter(
    (x) => !listData.map((el) => el.docId).includes(x.docDescriptionId)
  );

  const getAllMasterDocuments = async () => {
    setMasterIsLoading(true);
    setRowIndexs({});
    try {
      const obj = {
        size: 1000,
        page: masterPageIndex + 1,
        sort: masterSortValue && masterSortType ? `${masterSortValue} ${masterSortType}` : 'createdDate desc',
      };
      if (masterSearch) {
        obj[masterDocumentFilterBy] = masterSearch;
      }

      if (masterFilterCategory) obj.docCategory = masterFilterCategory;

      const res = await getMasterDocuments(obj);

      if (res?.status === 'Success') {
        const temp = [...res.data.items];

        setMasterDocuments(filterMdDocs(temp, docsData));
        setMasterTotalItem(res.data.totalItems);
        setMasterIsLoading(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const pillsClass = {
    Inisiasi: 'blue-pills',
    Seleksi: 'green-pills',
    'Kajian Lanjut': 'red-pills',
  };

  const masterTableColumns = [
    {
      Header: 'Document Description',
      accessor: 'docDescription',
      headerStyle: {
        maxWidth: '33%',
        minWidth: '33%',
        width: '33%',
      },
    },
    {
      Header: 'Category',
      accessor: 'docCategory',
      headerStyle: {
        maxWidth: '13%',
        minWidth: '13%',
        width: '13%',
      },
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { value } }) => (
        <div className={`pills ${pillsClass[value]}`}>
          {value}
        </div>
      ),
    },
    {
      Header: 'Doc. Type',
      accessor: 'docType',
      headerStyle: {
        maxWidth: '13%',
        minWidth: '13%',
        width: '13%',
      },
    },
    {
      Header: 'Date Modified',
      accessor: 'createdDate',
      headerStyle: {
        maxWidth: '13%',
        minWidth: '13%',
        width: '3%',
      },
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { value } }) => (
        <div>
          {value ? moment.utc(value).clone().local().format('DD MMM YYYY HH:mm') : '-'}
        </div>
      ),
    },
  ];

  function masterSelectSearchBy(e) {
    setMasterDocumentFilterBy(e);
  }

  function checkDocumentsCategory() {
    if (masterSelectedDocuments.length === 0) return false;
    for (let i = 0; i < masterDocuments.length; i += 1) {
      for (let j = 0; j < masterSelectedDocuments.length; j += 1) {
        // eslint-disable-next-line max-len
        const category = stage === 'KLanjut' ? 'Kajian Lanjut' : stage;
        if (masterDocuments[i].docDescriptionId === masterSelectedDocuments[j] &&
          masterDocuments[i].docCategory !== category) {
          return true;
        }
      }
    }

    return false;
  }

  useEffect(() => {
    if (masterDocuments.length > 0) {
      const docs = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const [key] of Object.entries(rowIndexs)) {
        if (masterDocuments[key]) docs.push(masterDocuments[key].docDescriptionId);
      }

      setMasterSelectedDocuments(docs);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowIndexs]);

  useEffect(() => {
    getAllMasterDocuments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [fetcher, setFetcher] = useState(null);

  const triggerFetcher = (newPageIndex) => {
    setRowIndexs({});
    setMasterPageIndex(newPageIndex || 0);

    setTimeout(() => {
      setFetcher((new Date()).toString());
    }, 1);
  };

  const saveSequenceDocumentList = async () => {
    const data = {
      docGroupParId,
      docVersion,
      docList: masterSelectedDocuments,
    };

    try {
      await postSequenceDocumentlist(data).then((res) => {
        if (res?.data?.status === 'Success') {
          getSequenceDocuments();
          triggerFetcher();
          closeAddModal();
        }
      });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (!fetcher) {
      return;
    }
    getAllMasterDocuments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher]);

  useEffect(() => {
    getAllMasterDocuments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docsData]);

  useEffect(() => {
    triggerFetcher();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masterSortType, masterSortValue, masterFilterCategory]);

  return (
    <Modal
      key={`${docGroupParId}${docVersion}`}
      centered
      visible={isAddVisible}
      footer={[
        <Button
          onClick={() => {
            triggerFetcher();
            closeAddModal();
          }}
          label="Cancel"
          size="middle"
          type="secondary"
        />,
        <Button onClick={() => saveSequenceDocumentList()} label={`Add Selected (${masterSelectedDocuments.length})`} size="middle" type="primary" />,
      ]}
      title="Add Document"
      className="rounded-modal modal-add-document"
      width={848}
    >
      <div>
        <div className="card-header">
          <div className="search-bar">
            <SelectSearch
              value={masterDocumentFilterBy}
              onChange={(e) => {
                masterSelectSearchBy(e);

                if (!masterSearch) {
                  return;
                }

                triggerFetcher();
              }}
              onSearch={(e) => {
                masterSelectSearchBy(e);

                if (!masterSearch) {
                  return;
                }

                triggerFetcher();
              }}
              options={selectValues}
              placeholder="Document Description"
            />
            <div className="divider" />
            <InputText
              value={masterSearch}
              placeholder="Search by"
              onPressEnter={(e) => {
                setMasterSearch(e.target.value);
                triggerFetcher();
              }}
              onChange={(e) => {
                const newValue = e.target.value;

                setMasterSearch(newValue);

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
          <div className="chip-container">
            <Button
              onClick={() => {
                setMasterfilterCategory('');
              }}
              label="All Category"
              size="middle"
              secondaryIcon={masterFilterCategory === '' && (
                <Icon
                  name="check"
                  size={12}
                />
              )}
              type={masterFilterCategory === '' ? 'primary' : 'secondary'}
            />
            <Button
              onClick={() => {
                setMasterfilterCategory('Inisiasi');
              }}
              label="Inisiasi"
              size="middle"
              secondaryIcon={masterFilterCategory === 'Inisiasi' && (
                <Icon
                  name="check"
                  size={12}
                />
              )}
              type={masterFilterCategory === 'Inisiasi' ? 'primary' : 'secondary'}
            />
            <Button
              onClick={() => {
                setMasterfilterCategory('Seleksi');
              }}
              label="Seleksi"
              size="middle"
              secondaryIcon={masterFilterCategory === 'Seleksi' && (
                <Icon
                  name="check"
                  size={12}
                />
              )}
              type={masterFilterCategory === 'Seleksi' ? 'primary' : 'secondary'}
            />
            <Button
              onClick={() => {
                setMasterfilterCategory('Kajian Lanjut');
              }}
              label="Kajian Lanjut"
              size="middle"
              secondaryIcon={masterFilterCategory === 'Kajian Lanjut' && (
                <Icon
                  name="check"
                  size={12}
                />
              )}
              type={masterFilterCategory === 'Kajian Lanjut' ? 'primary' : 'secondary'}
            />
          </div>
        </div>
        <div className="card-content">
          <div style={{ marginTop: '24px', height: masterIsLoading || masterDocuments.length === 0 ? 'calc(60vh - 32px)' : 'fit-content' }}>
            <Table
              columns={masterTableColumns}
              data={masterDocuments}
              isLoading={masterIsLoading}
              itemsTotal={masterTotalItem}
              sortType={masterSortType}
              setSortType={setMasterSortType}
              sortValue={masterSortValue}
              setSortValue={setMasterSortValue}
              selectable
              multiSelect
              selectedRowIds={rowIndexs}
              onSelectedRowIdsChange={setRowIndexs}
              placeholder={(
                <div className="empty-state">
                  <img alt="empty-state" src={EmptyState} />
                  <span className="header-text">There aren&apos;t any document list yet</span>
                </div>
              )}
              showCheckBoxSelection
            />
            {
              checkDocumentsCategory() && (
              <div style={{ marginTop: '48px' }}>
                <Alert
                  closeable={false}
                  description="The selected document is from a different stage than your current stage."
                  message="Are you sure you want to select this document(s)?"
                  showIcon
                  type="warning"
                />
              </div>
              )
            }
          </div>
        </div>
      </div>
    </Modal>
  );
};

MasterDocumentModal.propTypes = {
  isAddVisible: PropTypes.bool.isRequired,
  closeAddModal: PropTypes.func.isRequired,
  docsData: PropTypes.array,
  docGroupParId: PropTypes.string.isRequired,
  getSequenceDocuments: PropTypes.func.isRequired,
  docVersion: PropTypes.number.isRequired,
  stage: PropTypes.string.isRequired,
};

MasterDocumentModal.defaultProps = {
  docsData: [],
};

export default MasterDocumentModal;
