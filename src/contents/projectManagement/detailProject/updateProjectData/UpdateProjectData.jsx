/* eslint-disable react/no-danger */
/* eslint-disable no-alert */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { Button, Icon, InputText } from '@solecode/sole-ui';
import moment from 'moment';
import EconomicIndicatorModal from './EconomicIndicatorModal';
import ProjectInformationModal from './ProjectInformationModal';
import ResourcesModal from './ResourcesModal';
import ScopeOfWorkModal from './ScopeOfWorkModal';
import SetMilestonesModal from './SetMilestonesModal';
import UploadDocumentModal from './UploadDocumentModal';
import UploadDocumentContent from '../../createProject/UploadDocumentContent';
import useMenuHelper from '../../../useMenuHelper';
import useRoleHelper from '../../../common/useRoleHelper';
import UploadExcelModal from '../components/UploadExcelModal';
import { Alert, Collapse, DeleteModal, Dropdown, EmptyState, PaperHeader, PaperTitle, Richtext, ConfirmationModal } from '../../../../components';
import { useLoadData } from '../../../../hooks';
import useUpdateProjectDataApi from '../../../../hooks/api/updateProjectData';
import { getActorName, findCommonElement } from '../../../../libs/commonUtils';
import './UpdateProjectData.scss';

const InputTindakLanjutModal = ({
  open,
  setOpen,
  projectActionId,
  initialData,
  dropdownData,
  onSubmit,
}) => {
  const {
    addNewFollowUp,
    updateFollowUp,
  } = useUpdateProjectDataApi();

  const { aspect, riskLevel } = dropdownData;

  const dropdownAspectItems = !aspect?.length ? [] : aspect.map((e) => ({ key: e.key, children: e.value }));
  const [dropdownAspectOpen, setDropdownAspectOpen] = useState(false);
  const [dropdownAspectSelected, setDropdownAspectSelected] = useState({});

  const dropdownRiskLevelItems =
    !riskLevel?.length
      ? []
      : riskLevel.map((e) => ({ key: e.key, children: e.value }));
  const [dropdownRiskLevelOpen, setDropdownRiskLevelOpen] = useState(false);
  const [dropdownRiskLevelelected, setDropdownRiskLevelSelected] = useState({});

  const [reviewerValue, setReviewerValue] = useState('');
  const [fungsiJabatanValue, setFungsiJabatanValue] = useState('');
  const [hasilReviewValue, setHasilReviewValue] = useState('');
  const [deskripsiResikoValue, setDeskripsiResikoValue] = useState('');
  const [saranValue, setSaranValue] = useState('');
  const [keteranganValue, setKeteranganValue] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!initialData) {
      setDropdownAspectSelected({});
      setDropdownRiskLevelSelected({});
      setReviewerValue('');
      setFungsiJabatanValue('');
      setHasilReviewValue('');
      setDeskripsiResikoValue('');
      setSaranValue('');
      setKeteranganValue('');

      return;
    }

    const {
      followUpAspectParId: aspectValueInit,
      riskLevelParId: riskLevelValueInit,
      reviewerName: reviewerValueInit,
      positionFunction: fungsiJabatanValueInit,
      reviewResult: hasilReviewValueInit,
      riskDescription: deskripsiResikoValueInit,
      recommendation: saranValueInit,
      notes: keteranganValueInit,
    } = initialData;

    setDropdownAspectSelected(dropdownAspectItems.find((e) => e.key === aspectValueInit));
    setDropdownRiskLevelSelected(dropdownRiskLevelItems.find((e) => e.key === riskLevelValueInit));
    setReviewerValue(reviewerValueInit);
    setFungsiJabatanValue(fungsiJabatanValueInit);
    setHasilReviewValue(hasilReviewValueInit);
    setDeskripsiResikoValue(deskripsiResikoValueInit);
    setSaranValue(saranValueInit);
    setKeteranganValue(keteranganValueInit);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  const handleSubmit = async () => {
    setSubmitLoading(true);

    if (!initialData) {
      await addNewFollowUp([{
        projectActionId,
        followUpAspectParId: dropdownAspectSelected.key,
        reviewerName: reviewerValue,
        positionFunction: fungsiJabatanValue,
        reviewResult: hasilReviewValue,
        riskDescription: deskripsiResikoValue,
        riskLevelParId: dropdownRiskLevelelected.key,
        notes: keteranganValue,
        recommendation: saranValue,
      }]);
    } else {
      await updateFollowUp({
        followUpId: initialData.followUpId,
        projectActionId,
        followUpAspectParId: dropdownAspectSelected.key,
        reviewerName: reviewerValue,
        positionFunction: fungsiJabatanValue,
        reviewResult: hasilReviewValue,
        riskDescription: deskripsiResikoValue,
        riskLevelParId: dropdownRiskLevelelected.key,
        notes: keteranganValue,
        recommendation: saranValue,
      });
    }

    setSubmitLoading(false);
    onSubmit(dropdownAspectItems.map((e) => e.key).indexOf(dropdownAspectSelected.key));
  };

  return (
    <Modal
      visible={open}
      onOk={() => { setOpen(false); }}
      onCancel={() => { setOpen(false); }}
      title={<b>Input Tindak Lanjut</b>}
      width={634}
      footer={(
        <div>
          <Button
            label={
              submitLoading ?
                (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Icon name="spinner-third" spin size={24} />
                    Save Tindak Lanjut
                  </span>
                )
                : 'Save Tindak Lanjut'
            }
            size={Button.Size.LARGE}
            disabled={
              !dropdownAspectSelected?.key ||
              !dropdownRiskLevelelected?.key ||
              !reviewerValue ||
              !fungsiJabatanValue ||
              !hasilReviewValue ||
              !deskripsiResikoValue ||
              !saranValue ||
              !keteranganValue ||
              submitLoading
            }
            onClick={handleSubmit}
          />
        </div>
      )}
    >
      <div className="input-tindak-lanjut-modal">
        <div>
          <div className="input-field">
            <div>Aspek</div>
            <Dropdown
              label={dropdownAspectSelected.children ?? 'Select Aspek here..'}
              menuItem={dropdownAspectItems}
              visible={dropdownAspectOpen}
              onVisibleChange={(e) => { setDropdownAspectOpen(e); }}
              onClick={(e) => {
                const indexes = e.key.split('-');
                const index = indexes[indexes.length - 1];

                setDropdownAspectOpen(false);
                setDropdownAspectSelected(dropdownAspectItems[index]);
              }}
            />
          </div>
        </div>
        <div>
          <div className="input-field">
            <div>Reviewer</div>
            <InputText
              placeholder="Type here.."
              value={reviewerValue}
              onChange={(e) => { setReviewerValue(e.target.value); }}
            />
          </div>
          <div className="input-field">
            <div>Fungsi / Jabatan</div>
            <InputText
              placeholder="Type here.."
              value={fungsiJabatanValue}
              onChange={(e) => { setFungsiJabatanValue(e.target.value); }}
            />
          </div>
        </div>
        <div>
          <div className="input-field">
            <div>Hasil Review</div>
            <Richtext
              value={hasilReviewValue}
              onChange={setHasilReviewValue}
            />
          </div>
        </div>
        <div>
          <div className="input-field">
            <div>Deskripsi Resiko</div>
            <Richtext
              value={deskripsiResikoValue}
              onChange={setDeskripsiResikoValue}
            />
          </div>
        </div>
        <div>
          <div className="input-field">
            <div>Saran / Rekomendasi</div>
            <InputText
              placeholder="Type here.."
              value={saranValue}
              onChange={(e) => { setSaranValue(e.target.value); }}
              max={200}
            />
          </div>
        </div>
        <div>
          <div className="input-field">
            <div>Tingkat Resiko</div>
            <Dropdown
              label={dropdownRiskLevelelected.children ?? 'Select Tingkat Resiko here..'}
              menuItem={dropdownRiskLevelItems}
              visible={dropdownRiskLevelOpen}
              onVisibleChange={(e) => { setDropdownRiskLevelOpen(e); }}
              onClick={(e) => {
                const indexes = e.key.split('-');
                const index = indexes[indexes.length - 1];

                setDropdownRiskLevelOpen(false);
                setDropdownRiskLevelSelected(dropdownRiskLevelItems[index]);
              }}
            />
          </div>
        </div>
        <div>
          <div className="input-field">
            <div>Keterangan / Justifikasi</div>
            <InputText
              placeholder="Type here.."
              value={keteranganValue}
              onChange={(e) => { setKeteranganValue(e.target.value); }}
              max={200}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

InputTindakLanjutModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  projectActionId: PropTypes.string.isRequired,
  initialData: PropTypes.object,
  dropdownData: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

InputTindakLanjutModal.defaultProps = {
  initialData: null,
};

const TindakLanjutCardHeader = ({ name, role }) => (
  <div className="tindak-lanjut-card-header">
    <div>
      <Icon name="file-lines" />
    </div>
    <div>
      <div>{name}</div>
      <div>{role}</div>
    </div>
  </div>
);

TindakLanjutCardHeader.propTypes = {
  name: PropTypes.string,
  role: PropTypes.string,
};

TindakLanjutCardHeader.defaultProps = {
  name: '',
  role: '',
};

const TindakLanjutCardExtra = ({ risk, onEdit, onDelete, isReadOnly }) => (
  <div
    className={[
      'tindak-lanjut-card-extra',
      risk,
    ].join(' ')}
  >
    <div>
      <Icon
        name="circle-exclamation"
        type={Icon.Type.SOLID}
      />
      <div>{risk}</div>
    </div>
    {
      !isReadOnly && (
        <>
          <div className="edit-icon">
            <Button
              label=""
              size={Button.Size.SMALL}
              shape={Button.Shape.CIRCLE}
              onClick={onEdit}
              primaryIcon={(
                <Icon
                  name="pencil"
                  type="solid"
                />
              )}
            />
          </div>
          <div className="delete-icon">
            <Button
              label=""
              size={Button.Size.SMALL}
              shape={Button.Shape.CIRCLE}
              onClick={onDelete}
              primaryIcon={(
                <Icon
                  name="trash-can"
                  type="solid"
                />
              )}
            />
          </div>
        </>
      )
    }
  </div>
);

TindakLanjutCardExtra.propTypes = {
  risk: PropTypes.string,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isReadOnly: PropTypes.bool,
};

TindakLanjutCardExtra.defaultProps = {
  risk: '',
  isReadOnly: false,
};

const TindakLanjutCardChildren = ({ hasilReview, deskripsiResiko, saran, keterangan }) => (
  <div className="tindak-lanjut-card-children">
    <div>
      <div>Hasil Review</div>
      <div dangerouslySetInnerHTML={{ __html: hasilReview }} />
    </div>
    <div>
      <div>Deskripsi Resiko</div>
      <div dangerouslySetInnerHTML={{ __html: deskripsiResiko }} />
    </div>
    <div>
      <div>
        <div>Saran / Rekomendasi</div>
        <div>{saran}</div>
      </div>
      <div>
        <div>Keterangan / Justifikasi</div>
        <div>{keterangan}</div>
      </div>
    </div>
  </div>
);

TindakLanjutCardChildren.propTypes = {
  hasilReview: PropTypes.string,
  deskripsiResiko: PropTypes.string,
  saran: PropTypes.string,
  keterangan: PropTypes.string,
};

TindakLanjutCardChildren.defaultProps = {
  hasilReview: '',
  deskripsiResiko: '',
  saran: '',
  keterangan: '',
};

const RevisedAlert = ({ updatedBy, updatedDate }) => (
  <Alert
    showIcon
    icon={{
      name: 'octagon-exclamation',
      size: 40,
      type: 'regular',
    }}
    message="This process need revision!"
    descriptionRight={(
      <div className="details-wrapper">
        <div className="user">
          <Icon
            name="user"
            size={16}
            type="regular"
          />
          <span>
            {updatedBy || '-'}
          </span>
        </div>
        <div className="date">
          <Icon
            name="calendar"
            size={16}
            type="regular"
          />
          <span>
            {updatedDate ? moment(updatedDate).format('DD MMM YYYY HH:mm') : '-' }
          </span>
        </div>
      </div>
    )}
    type="error"
    // closeable={false}
  />
);

RevisedAlert.propTypes = {
  updatedBy: PropTypes.string,
  updatedDate: PropTypes.string,
};

RevisedAlert.defaultProps = {
  updatedBy: PropTypes.string,
  updatedDate: PropTypes.string,
};

const LockedAlert = () => (
  <Alert
    showIcon
    icon={{
      name: 'lock',
      size: 40,
      type: 'regular',
    }}
    message="Will be unlocked after Set Meeting Completed"
    descriptionRight={<></>}
    type="info"
    closeable={false}
  />
);

const WaitingTobeUpdatedAlert = ({ actors, listOfActorName }) => (
  <Alert
    showIcon
    icon={{
      name: 'hourglass-clock',
      size: 40,
      type: 'regular',
    }}
    message={`Waiting to be Updated by ${getActorName(actors, listOfActorName)}`}
    descriptionRight={<></>}
    type="warning"
    closeable={false}
  />
);

WaitingTobeUpdatedAlert.propTypes = {
  actors: PropTypes.array,
  listOfActorName: PropTypes.array,
};

WaitingTobeUpdatedAlert.defaultProps = {
  actors: [],
  listOfActorName: [],
};

const UpdateProjectData = ({
  projectId,
  projectVersion,
  projectActionId,
  projectData,
  refreshProjectDetail,
  status,
  updatedBy,
  updatedDate,
  createdDate,
  actors,
  listOfActorName,
  setProjectVersionHandler,
  userRoles,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    getFollowUpDropdown,
    getFollowUpList,
    deleteFollowUp,
    completeUpdateProjectData,
    downloadFollowUpTemplate,
  } = useUpdateProjectDataApi();

  const [followUpDropdownData] = useLoadData({
    getDataFunc: getFollowUpDropdown,
    dataKey: 'data',
  });

  const [followUpList,,,, refreshFollowUpList] = useLoadData({
    getDataFunc: getFollowUpList,
    getDataParams: { projectActionId },
    dataKey: 'data',
  });

  const { isSuperAdmin } = useRoleHelper();
  const { isCreateProjectAllowed, isEditProjectAllowed } = useMenuHelper();

  const [tindakLanjutCardActiveIndexMap, setTindakLanjutCardActiveIndexMap] = useState({});
  const [inputTindakLanjutModalOpen, setInputTindakLanjutModalOpen] = useState(false);
  const [selectedAspectIndex, setSelectedAspectIndex] = useState(0);
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [keyRefresher, setKeyRefresher] = useState(0);
  const [requiredDocumentsIsValid, setRequiredDocumentsIsValid] = useState(false);

  const [projectInformationModalOpen, setProjectInformationModalOpen] = useState(false);
  const [scopeOfWorkModalOpen, setScopeOfWorkModalOpen] = useState(false);
  const [resourcesModalOpen, setResourcesModalOpen] = useState(false);
  const [economicIndicatorModalOpen, setEconomicIndicatorModalOpen] = useState(false);
  const [uploadDocumentModalOpen, setUploadDocumentModalOpen] = useState(false);
  const [setMilestonesModalOpen, setSetMilestonesModalOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [showConfirmationComplete, setShowConfirmationComplete] = useState(false);
  const [showConfirmationReSched, setShowConfirmationReSched] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const getSelectedFollowUpList = () => {
    if (!followUpList?.length || !followUpDropdownData?.aspect?.length) {
      return [];
    }

    return followUpList.filter((e) => e.followUpAspectParId === followUpDropdownData.aspect[selectedAspectIndex].key);
  };

  const handleScroll = (left) => {
    const el = document.getElementById('input-tindak-lanjut-aspect-list');
    const scrollPosition = el.scrollLeft;
    const offset = 420;

    let newScrollPosition = scrollPosition - offset < 0 ? 0 : scrollPosition - offset;

    if (!left) {
      newScrollPosition = scrollPosition + offset;
    }

    el.scroll(newScrollPosition, 0);
  };

  const getLastUpdatedDate = (key) => {
    const { logSectionUpdatedDate } = projectData;

    const lastUpdatedDate = logSectionUpdatedDate[key];

    const createdDateObj = moment.utc(createdDate);
    const lastUpdatedDateObj = moment.utc(lastUpdatedDate);

    if (lastUpdatedDateObj > createdDateObj) {
      return `Last updated ${moment.utc(lastUpdatedDateObj).clone().local().format('DD MMM YYYY HH:mm')}`;
    }

    return '';
  };

  const disabledComplete = () => (
    !followUpList?.length ||
    !requiredDocumentsIsValid
  );

  const handleComplete = async (complete) => {
    try {
      setIsLoading(true);
      await completeUpdateProjectData({ projectActionId, complete });
      refreshProjectDetail(projectId, projectVersion);

      if (complete) setShowConfirmationComplete(false);
      else setShowConfirmationReSched(false);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const dlTemplate = async () => {
    try {
      const res = await downloadFollowUpTemplate();
      const url = window.URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '[PHE-IDAMS] Template Tindak Lanjut.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (e) {
      console.log(e);
    }
  };

  const isReadOnly = status === 'Completed' || status === 'Revised';
  // const isWaitingToBeUpdated = !isSuperAdmin && (!isCreateProjectAllowed() || !isEditProjectAllowed()) && status === 'In-Progress';
  const isWaitingToBeUpdated = !isSuperAdmin && (!isCreateProjectAllowed() || !isEditProjectAllowed()) && status === 'In-Progress' && !findCommonElement(actors?.map((el) => el?.actor), userRoles);

  if (!projectActionId) {
    return (
      <div>
        <LockedAlert />
      </div>
    );
  }

  if (isWaitingToBeUpdated) {
    return (
      <div>
        <WaitingTobeUpdatedAlert
          actors={actors}
          listOfActorName={listOfActorName}
        />
      </div>
    );
  }

  return (
    <div className="update-project-data">
      {
        status === 'Revised' && (
          <RevisedAlert
            updatedBy={updatedBy}
            updatedDate={updatedDate}
          />
        )
      }
      <div className="paper-card-container">
        <PaperHeader>
          <PaperTitle>
            <div>Input Tindak Lanjut</div>
            <div>
              <div className="nav-icon">
                <Button
                  label=""
                  shape={Button.Shape.CIRCLE}
                  onClick={() => { handleScroll(true); }}
                  primaryIcon={(
                    <Icon
                      name="circle-arrow-left"
                      size={24}
                    />
                  )}
                />
              </div>
              <div className="nav-icon">
                <Button
                  label=""
                  shape={Button.Shape.CIRCLE}
                  onClick={() => { handleScroll(false); }}
                  primaryIcon={(
                    <Icon
                      name="circle-arrow-right"
                      size={24}
                    />
                  )}
                />
              </div>
            </div>
          </PaperTitle>
        </PaperHeader>
        <div className="input-tindak-lanjut">
          {
            followUpDropdownData?.aspect?.length && (
              <div id="input-tindak-lanjut-aspect-list">
                {
                  followUpDropdownData.aspect.map((e, i) => (
                    <Button
                      key={e.key}
                      label={(
                        <div
                          className={[
                            'aspect-button',
                            selectedAspectIndex === i ? 'selected' : '',
                          ].join(' ')}
                          role="button"
                          tabIndex={-1}
                          onClick={() => {
                            setSelectedAspectIndex(i);
                            setTindakLanjutCardActiveIndexMap({});
                          }}
                          onKeyDown={() => {}}
                          title={e.value}
                        >
                          <div>{e.value}</div>
                          <div>
                            {
                              !followUpList?.length
                                ? 0
                                : followUpList.filter((ee) => ee.followUpAspectParId === e.key).length
                            }
                          </div>
                        </div>
                      )}
                      size={Button.Size.LARGE}
                      type={selectedAspectIndex === i ? Button.Type.PRIMARY : Button.Type.SECONDARY}
                    />
                  ))
                }
              </div>
            )
          }
          {
            !isReadOnly ? (
              <div>
                <div>
                  <Icon name="arrow-down-to-bracket" />
                  <span
                    className="link"
                    onClick={dlTemplate}
                    onKeyDown={dlTemplate}
                    role="button"
                    tabIndex={0}
                  >
                    Download Template
                  </span>
                </div>
                <div>
                  <Button
                    label="Upload Excel"
                    size={Button.Size.LARGE}
                    type={Button.Type.SECONDARY}
                    primaryIcon={<Icon name="arrow-up-from-bracket" />}
                    onClick={() => setShowUploadModal(true)}
                  />
                  <Button
                    label="Add Tindak Lanjut"
                    size={Button.Size.LARGE}
                    type={Button.Type.SECONDARY}
                    primaryIcon={<Icon name="arrow-up-from-bracket" />}
                    onClick={() => { setInputTindakLanjutModalOpen(true); }}
                  />
                </div>
                <UploadExcelModal
                  title="Upload Excel Notulensi Rapat"
                  open={showUploadModal}
                  setOpen={setShowUploadModal}
                  onOk={() => window.alert('ok')}
                  onCancel={() => setShowUploadModal(false)}
                  projectActionId={projectActionId}
                  refreshFollowUpList={refreshFollowUpList}
                  projectId={projectId}
                  projectVersion={projectVersion}
                  onSubmit={(aspectId) => {
                    const index = followUpDropdownData.aspect.map((e) => e.key).indexOf(aspectId);

                    if (index === selectedAspectIndex || index < 0) {
                      return;
                    }

                    setSelectedAspectIndex(index);
                    setTindakLanjutCardActiveIndexMap({});
                  }}
                />
              </div>
            ) : (
              <div style={{ display: 'none' }}>
                &nbsp;
              </div>
            )
          }
          {
            getSelectedFollowUpList().length ? (
              <div>
                {
                  getSelectedFollowUpList().map((e, index) => (
                    <Collapse
                      // eslint-disable-next-line react/no-array-index-key
                      key={index}
                      activeKey={tindakLanjutCardActiveIndexMap[index] ? index : -1}
                      expandIcon={({ isActive }) => <Icon name={isActive ? 'angle-up' : 'angle-down'} />}
                      expandIconPosition="end"
                      data={[{
                        key: index,
                        header: (
                          <TindakLanjutCardHeader
                            name={e.reviewerName}
                            role={e.positionFunction}
                          />
                        ),
                        extra: (
                          <TindakLanjutCardExtra
                            risk={e.riskLevel}
                            onEdit={() => {
                              setSelectedFollowUp(e);
                              setInputTindakLanjutModalOpen(true);
                            }}
                            onDelete={() => {
                              setSelectedFollowUp(e);
                              setDeleteModalOpen(true);
                            }}
                            isReadOnly={isReadOnly}
                          />
                        ),
                        children: (
                          <TindakLanjutCardChildren
                            hasilReview={e.reviewResult}
                            deskripsiResiko={e.riskDescription}
                            saran={e.recommendation}
                            keterangan={e.notes}
                          />
                        ),
                      }]}
                      onChange={() => {
                        setTindakLanjutCardActiveIndexMap({
                          ...tindakLanjutCardActiveIndexMap,
                          [index]: !tindakLanjutCardActiveIndexMap[index],
                        });
                      }}
                    />
                  ))
                }
              </div>
            ) : (
              <EmptyState
                text={(
                  <>
                    <div><b>There aren’t any Tindak Lanjut yet</b></div>
                    <div>Start input Tindak Lanjut</div>
                  </>
                )}
              />
            )
          }
        </div>
      </div>
      <UploadDocumentContent
        key={keyRefresher}
        projectId={projectId}
        projectVersion={projectVersion}
        projectActionId={projectActionId}
        onFormValidChange={(e) => {
          setRequiredDocumentsIsValid(e);
        }}
        isViewOnly={isReadOnly}
      />
      <div className="paper-card-container">
        <PaperHeader>
          <PaperTitle>
            <div>Update Project Information</div>
          </PaperTitle>
        </PaperHeader>
        <div className="update-project-information">
          <Button
            label={(
              <div>
                <div>Update Project Information</div>
                <div>{getLastUpdatedDate('UpdateProjectInformation')}</div>
              </div>
            )}
            size={Button.Size.LARGE}
            type={Button.Type.SECONDARY}
            onClick={() => { setProjectInformationModalOpen(true); }}
          />
          <Button
            label={(
              <div>
                <div>Update Scope of Work</div>
                <div>{getLastUpdatedDate('UpdateScopeOfWork')}</div>
              </div>
            )}
            size={Button.Size.LARGE}
            type={Button.Type.SECONDARY}
            onClick={() => { setScopeOfWorkModalOpen(true); }}
          />
          <Button
            label={(
              <div>
                <div>Update Resources</div>
                <div>{getLastUpdatedDate('UpdateResources')}</div>
              </div>
            )}
            size={Button.Size.LARGE}
            type={Button.Type.SECONDARY}
            onClick={() => { setResourcesModalOpen(true); }}
          />
          <Button
            label={(
              <div>
                <div>Update Economic Indicator</div>
                <div>{getLastUpdatedDate('UpdateEconomicIndicator')}</div>
              </div>
            )}
            size={Button.Size.LARGE}
            type={Button.Type.SECONDARY}
            onClick={() => { setEconomicIndicatorModalOpen(true); }}
          />
          <Button
            label={(
              <div>
                <div>Update Initiation Document</div>
                <div>{getLastUpdatedDate('UpdateInitiationDocument')}</div>
              </div>
            )}
            size={Button.Size.LARGE}
            type={Button.Type.SECONDARY}
            onClick={() => { setUploadDocumentModalOpen(true); }}
          />
          <Button
            label={(
              <div>
                <div>Update Milestone</div>
                <div>{getLastUpdatedDate('UpdateMilestone')}</div>
              </div>
            )}
            size={Button.Size.LARGE}
            type={Button.Type.SECONDARY}
            onClick={() => { setSetMilestonesModalOpen(true); }}
          />
        </div>
      </div>
      {
        !isReadOnly && (
          <div>
            <Button
              label="Re-schedule Meeting"
              size={Button.Size.LARGE}
              type={Button.Type.SECONDARY}
              primaryIcon={<Icon name="clock" />}
              onClick={() => setShowConfirmationReSched(true)}
            />
            <Button
              label="Complete"
              size={Button.Size.LARGE}
              onClick={() => setShowConfirmationComplete(true)}
              disabled={disabledComplete()}
            />
          </div>
        )
      }
      <ConfirmationModal
        open={showConfirmationComplete}
        setOpen={setShowConfirmationComplete}
        title="Completion Confirmation"
        message1="Are you sure you want to complete this process?"
        message2="This action can’t be undone."
        icon={{ name: 'square-check' }}
        buttonOkLabel="Yes, I’m sure"
        onOk={() => handleComplete(true)}
        isLoading={isLoading}
      />

      <ConfirmationModal
        open={showConfirmationReSched}
        setOpen={setShowConfirmationReSched}
        title="Re-schedule Confirmation"
        message1="Are you sure you want to re-schedule this process?"
        message2="This action can’t be undone."
        icon={{ name: 'square-check' }}
        buttonOkLabel="Yes, I’m sure"
        onOk={() => handleComplete(false)}
        isLoading={isLoading}
      />

      <InputTindakLanjutModal
        open={inputTindakLanjutModalOpen}
        setOpen={(e) => {
          setInputTindakLanjutModalOpen(e);

          if (!e) {
            setSelectedFollowUp(null);
          }
        }}
        projectActionId={projectActionId}
        initialData={selectedFollowUp}
        dropdownData={followUpDropdownData ?? {}}
        onSubmit={(index) => {
          setInputTindakLanjutModalOpen(false);
          setSelectedFollowUp(null);
          refreshFollowUpList();

          if (index === selectedAspectIndex) {
            return;
          }

          setSelectedAspectIndex(index);
          setTindakLanjutCardActiveIndexMap({});
        }}
      />
      <DeleteModal
        open={deleteModalOpen}
        setOpen={(e) => {
          setDeleteModalOpen(e);

          if (!e) {
            setSelectedFollowUp(null);
          }
        }}
        onDelete={async () => {
          if (!selectedFollowUp) {
            setDeleteModalOpen(false);
            return;
          }
          setIsLoading(true);
          await deleteFollowUp({ followUpId: selectedFollowUp.followUpId, projectActionId });
          refreshFollowUpList();
          setSelectedFollowUp(null);
          setIsLoading(false);
          setDeleteModalOpen(false);
        }}
        message1="Are you sure you want to delete this?"
        message2="This action can’t be undone."
        isLoading={isLoading}
      />
      <ProjectInformationModal
        open={projectInformationModalOpen}
        setOpen={setProjectInformationModalOpen}
        onSubmit={(response) => {
          setProjectInformationModalOpen(false);
          refreshProjectDetail(response?.projectId || projectId, response?.projectVersion || projectVersion);
        }}
        projectData={projectData}
        isReadOnly={isReadOnly}
        setProjectVersionHandler={setProjectVersionHandler}
        status={status}
        setProjectVersionParams={(res) => setSearchParams({ projectId: searchParams.get('projectId'), projectVersion: res })}
      />
      <ScopeOfWorkModal
        open={scopeOfWorkModalOpen}
        setOpen={setScopeOfWorkModalOpen}
        onSubmit={(response) => {
          setScopeOfWorkModalOpen(false);
          refreshProjectDetail(response?.projectId || projectId, response?.projectVersion || projectVersion);
        }}
        projectData={projectData}
        isReadOnly={isReadOnly}
        setProjectVersionHandler={setProjectVersionHandler}
        setProjectVersionParams={(res) => setSearchParams({ projectId: searchParams.get('projectId'), projectVersion: res })}
      />
      <ResourcesModal
        open={resourcesModalOpen}
        setOpen={setResourcesModalOpen}
        onSubmit={(response) => {
          setResourcesModalOpen(false);
          refreshProjectDetail(response?.projectId || projectId, response?.projectVersion || projectVersion);
        }}
        projectData={projectData}
        isReadOnly={isReadOnly}
        setProjectVersionHandler={setProjectVersionHandler}
        setProjectVersionParams={(res) => setSearchParams({ projectId: searchParams.get('projectId'), projectVersion: res })}
      />
      <EconomicIndicatorModal
        open={economicIndicatorModalOpen}
        setOpen={setEconomicIndicatorModalOpen}
        onSubmit={(response) => {
          setEconomicIndicatorModalOpen(false);
          refreshProjectDetail(response?.projectId || projectId, response?.projectVersion || projectVersion);
        }}
        projectData={projectData}
        isReadOnly={isReadOnly}
        setProjectVersionHandler={setProjectVersionHandler}
        setProjectVersionParams={(res) => setSearchParams({ projectId: searchParams.get('projectId'), projectVersion: res })}
      />
      <UploadDocumentModal
        open={uploadDocumentModalOpen}
        setOpen={(e) => {
          setUploadDocumentModalOpen(e);
          setKeyRefresher(keyRefresher + 1);
          refreshProjectDetail(projectId, projectVersion);
        }}
        projectId={projectId}
        projectVersion={projectVersion}
        onSubmit={(response) => {
          setUploadDocumentModalOpen(false);
          setKeyRefresher(keyRefresher + 1);
          refreshProjectDetail(response?.projectId, response?.projectVersion);
        }}
        isReadOnly={isReadOnly}
        setProjectVersionParams={(res) => setSearchParams({ projectId: searchParams.get('projectId'), projectVersion: res })}
      />
      <SetMilestonesModal
        open={setMilestonesModalOpen}
        setOpen={setSetMilestonesModalOpen}
        projectId={projectId}
        projectVersion={projectVersion}
        projectData={projectData}
        onSubmit={(response) => {
          setSetMilestonesModalOpen(false);
          refreshProjectDetail(response?.projectId || projectId, response?.projectVersion || projectVersion);
        }}
        isReadOnly={isReadOnly}
        setProjectVersionParams={(res) => setSearchParams({ projectId: searchParams.get('projectId'), projectVersion: res })}
      />
    </div>
  );
};

UpdateProjectData.propTypes = {
  projectId: PropTypes.string,
  projectVersion: PropTypes.any,
  projectActionId: PropTypes.string,
  projectData: PropTypes.object,
  refreshProjectDetail: PropTypes.func,
  status: PropTypes.string,
  updatedBy: PropTypes.string,
  updatedDate: PropTypes.string,
  createdDate: PropTypes.string,
  actors: PropTypes.array,
  listOfActorName: PropTypes.array,
  setProjectVersionHandler: PropTypes.func,
  userRoles: PropTypes.array,
};

UpdateProjectData.defaultProps = {
  projectId: '',
  projectVersion: 1,
  projectActionId: '',
  projectData: {},
  refreshProjectDetail: () => {},
  status: '',
  updatedBy: PropTypes.string,
  updatedDate: PropTypes.string,
  createdDate: PropTypes.string,
  actors: [],
  listOfActorName: [],
  setProjectVersionHandler: () => {},
  userRoles: [],
};

export default UpdateProjectData;
