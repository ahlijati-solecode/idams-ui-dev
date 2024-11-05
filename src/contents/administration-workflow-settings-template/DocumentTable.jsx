import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon, InputText, SelectSearch, Table } from '@solecode/sole-ui';
import { Modal } from 'antd';
import moment from 'moment';
import EmptyState from '../../assets/empty-state.png';
import MasterDocumentModal from './MasterDocumentsModal';
import useWorkflowDetailApi from '../../hooks/api/workflow/workflow-detail';
import './DocumentTable.scss';

const selectValues = [
  {
    label: 'Document Description',
    value: 'docDescription',
  },
  {
    label: 'Category',
    value: 'docCategory',
  },
  {
    label: 'Doc. Type',
    value: 'docType',
  },
  {
    label: 'Date Modified',
    value: 'modifiedDate',
  },
];

const DocumentTable = ({ documentGroup, stage }) => {
  const [documentFilterBy, setDocumentFilterBy] = useState(selectValues[0].value);
  const [pageIndex, setPageIndex] = useState(0);
  const [totalItem, setTotalItem] = useState(0);
  const [sortType, setSortType] = useState('desc');
  const [sortValue, setSortValue] = useState('modifiedDate');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSingleVisible, setSingleIsVisible] = useState(false);
  const [isAddVisible, setIsAddVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [rowIndexs, setRowIndexs] = useState({});
  const [singleDocumentBeDeleted, setSingleDocumentBeDeleted] = useState('');
  const { getSequenceDocumentList, deleteDocumentChecklist } = useWorkflowDetailApi();

  const getSequenceDocuments = async () => {
    setIsLoading(true);
    try {
      const obj = {
        size: 10,
        page: pageIndex,
        sort: sortValue && sortType ? `${sortValue} ${sortType}` : 'docDescription asc',
        DocGroupParId: documentGroup.docGroupParId,
        DocGroupVersion: documentGroup.docVersion,
      };
      obj[documentFilterBy] = search;

      const res = await getSequenceDocumentList(obj);
      if (res?.status === 'Success') {
        setTotalItem(res.data.totalItems);
        setDocuments(res.data.items);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const [fetcher, setFetcher] = useState(null);

  const triggerFetcher = (newPageIndex) => {
    setRowIndexs({});
    setPageIndex(newPageIndex || 0);

    setTimeout(() => {
      setFetcher((new Date()).toString());
    }, 1);
  };

  useEffect(() => {
    if (!fetcher) {
      return;
    }
    getSequenceDocuments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher]);

  useEffect(() => {
    triggerFetcher();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortType, sortValue]);

  const removeDocumentChecklist = async () => {
    setIsLoading(true);
    try {
      const obj = {
        docGroupParId: documentGroup.docGroupParId,
        docVersion: documentGroup.docVersion,
        docList: selectedDocuments,
      };

      const res = await deleteDocumentChecklist(obj);
      if (res?.data?.status === 'Success') {
        triggerFetcher();
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const removeOneDocumentChecklist = async () => {
    setIsLoading(true);
    try {
      const obj = {
        docGroupParId: documentGroup.docGroupParId,
        docVersion: documentGroup.docVersion,
        docList: [singleDocumentBeDeleted],
      };
      obj[documentFilterBy] = search;

      const res = await deleteDocumentChecklist(obj);
      if (res?.data?.status === 'Success') {
        triggerFetcher();
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  function openModal() {
    setIsVisible(true);
  }

  function openSingleModal(e) {
    setSingleDocumentBeDeleted(e.original.docId);
    setSingleIsVisible(true);
  }

  const pillsClass = {
    Inisiasi: 'blue-pills',
    Seleksi: 'green-pills',
    'Kajian Lanjut': 'red-pills',
  };

  const tableColumns = [
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
        maxWidth: '23%',
        minWidth: '23%',
        width: '23%',
      },
    },
    {
      Header: 'Date Modified',
      accessor: 'modifiedDate',
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
            onClick={(e) => {
              e.stopPropagation();
              openSingleModal(row);
            }}
            primaryIcon={<Icon name="trash-can" type="solid" />}
          />
        </div>
      ),
    },
  ];

  function selectSearchBy(e) {
    setDocumentFilterBy(e);
  }

  function keyPress(e) {
    setSearch(e.target.value);
  }

  function closeAddModal() {
    setIsAddVisible(false);
  }

  function openAddDocument() {
    setIsAddVisible(true);
  }

  function closeModal() {
    setIsVisible(false);
  }

  function deleteDocuments() {
    removeDocumentChecklist();
    closeModal();
  }

  function closeSingleModal() {
    setSingleIsVisible(false);
  }

  function deleteDocument() {
    removeOneDocumentChecklist();
    closeSingleModal();
  }

  useEffect(() => {
    if (documents.length > 0) {
      const docs = [];

      // eslint-disable-next-line no-restricted-syntax
      for (const [key] of Object.entries(rowIndexs)) {
        if (documents[key]) docs.push(documents[key].docId);
      }

      setSelectedDocuments(docs);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowIndexs]);

  // useEffect(() => {
  //   console.log('documentGroup', documentGroup);
  //   console.log('stage', stage);
  // }, []);

  const ModalMultipleDelete = () => (
    <Modal
      className="rounded-modal"
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
          <div style={{ marginBottom: '8px' }}>
            Are you sure you want to delete this (
            {selectedDocuments.length}
            ) selected file(s)?
          </div>
          <div className="light-text">This action can’t be undone.</div>
        </div>
        <div style={{ marginTop: '24px' }} className="modal-footer">
          <Button onClick={() => closeModal()} label="Cancel" size="middle" type="secondary" />
          <Button onClick={() => deleteDocuments()} label="Delete" size="middle" type="danger" />
        </div>
      </div>
    </Modal>
  );

  const ModalSingleDelete = () => (
    <Modal
      className="rounded-modal"
      centered
      visible={isSingleVisible}
      footer={null}
    >
      <div className="modal-delete">
        <div className="modal-header">
          <Icon name="trash-can" type="regular" size="48" />
          <div style={{ margin: '8px 0px' }}>Delete Confirmation</div>
        </div>
        <div className="modal-content">
          <div style={{ marginBottom: '8px' }}>
            Are you sure you want to delete this document?
          </div>
          <div className="light-text">This action can’t be undone.</div>
        </div>
        <div style={{ marginTop: '24px' }} className="modal-footer">
          <Button onClick={() => closeSingleModal()} label="Cancel" size="middle" type="secondary" />
          <Button onClick={() => deleteDocument()} label="Delete" size="middle" type="danger" />
        </div>
      </div>
    </Modal>
  );

  return (
    <div className="administration-document-table">
      <ModalMultipleDelete key={`multipleDelete${documentGroup.docGroup}`} />
      <ModalSingleDelete key={`singleDelete${documentGroup.docGroup}`} />
      <MasterDocumentModal
        key={`masterDocument${documentGroup.docGroup}`}
        getSequenceDocuments={getSequenceDocuments}
        docVersion={documentGroup.docVersion}
        docGroupParId={documentGroup.docGroupParId}
        docsData={documents}
        isAddVisible={isAddVisible}
        closeAddModal={closeAddModal}
        stage={stage}
      />
      <div className="workflow-setting-form">
        <h2 className="form-title">{documentGroup.docGroup}</h2>
      </div>
      <div className="card-header">
        <div className="search-bar">
          <SelectSearch
            value={documentFilterBy}
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
            placeholder="Document Description"
          />
          <div className="divider" />
          <InputText
            value={search}
            placeholder="Search by"
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
        <div style={{ display: 'flex', gap: '16px', marginLeft: 'auto' }}>
          <Button
            label={`Delete Selected (${selectedDocuments.length})`}
            onClick={() => openModal()}
            danger
            disabled={selectedDocuments.length === 0}
          />
          <Button
            label="Add Document"
            onClick={() => openAddDocument()}
            primaryIcon={<Icon name="plus" type="solid" />}
          />
        </div>
      </div>
      <div style={{ marginTop: '24px', height: isLoading || documents.length === 0 ? 'calc(60vh - 32px)' : 'fit-content' }}>
        <Table
          columns={tableColumns}
          data={documents}
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
          selectable
          multiSelect
          autoResetSelectedRows
          selectedRowIds={rowIndexs}
          onSelectedRowIdsChange={setRowIndexs}
          showCheckBoxSelection
          placeholder={(
            <div>
              <div className="empty-state">
                <img alt="empty-state" src={EmptyState} />
                <span className="header-text">There aren&apos;t any document list yet</span>
                <span className="text">Start add new document list.</span>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
};

DocumentTable.propTypes = {
  documentGroup: PropTypes.object,
  stage: PropTypes.string.isRequired,
};

DocumentTable.defaultProps = {
  documentGroup: {},
};

export default DocumentTable;
