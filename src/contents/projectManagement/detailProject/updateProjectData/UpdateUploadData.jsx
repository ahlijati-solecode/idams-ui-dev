/* eslint-disable no-alert */

import React, { useState } from 'react';
import moment from 'moment/moment';
import { useSearchParams } from 'react-router-dom';
import { Alert, Button, Icon } from '@solecode/sole-ui';
import PropTypes from 'prop-types';
import UploadDocumentContent from '../../createProject/UploadDocumentContent';
import EconomicIndicatorModal from './EconomicIndicatorModal';
import ProjectInformationModal from './ProjectInformationModal';
import ResourcesModal from './ResourcesModal';
import ScopeOfWorkModal from './ScopeOfWorkModal';
import SetMilestonesModal from './SetMilestonesModal';
import UploadDocumentModal from './UploadDocumentModal';
import { PaperHeader, PaperTitle, ConfirmationModal } from '../../../../components';
import useProjectManagementApi from '../../../../hooks/api/projectManagement';
import RenderIf from '../../../RenderIf';
import { getActorName } from '../../../../libs/commonUtils';
import './UpdateUploadData.scss';

const UpdateUploadData = ({
  projectId,
  projectVersion,
  projectActionId,
  projectData,
  refreshProjectDetail,
  status,
  createdDate,
  isAllowed,
  actors,
  listOfActorName,
  setProjectVersionHandler,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    completeUpload,
  } = useProjectManagementApi();
  const [projectInformationModalOpen, setProjectInformationModalOpen] = useState(false);
  const [scopeOfWorkModalOpen, setScopeOfWorkModalOpen] = useState(false);
  const [resourcesModalOpen, setResourcesModalOpen] = useState(false);
  const [economicIndicatorModalOpen, setEconomicIndicatorModalOpen] = useState(false);
  const [uploadDocumentModalOpen, setUploadDocumentModalOpen] = useState(false);
  const [setMilestonesModalOpen, setSetMilestonesModalOpen] = useState(false);
  const [keyRefresher, setKeyRefresher] = useState(0);
  const [requiredDocumentsIsValid, setRequiredDocumentsIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState({ completeBtn: false });
  const [showConfirmationComplete, setShowConfirmationComplete] = useState(false);

  const isReadOnly = status === 'Completed' || status === 'Revised';

  const getLastUpdatedDate = (key) => {
    const { logSectionUpdatedDate } = projectData;

    const lastUpdatedDate = logSectionUpdatedDate[key];

    const createdDateObj = moment.utc(createdDate);
    const lastUpdatedDateObj = moment.utc(lastUpdatedDate);

    if (lastUpdatedDateObj > createdDateObj) {
      return `Last updated ${moment.utc(lastUpdatedDateObj).clone().local().format('DD MMM YYYY, HH:mm')}`;
    }

    return '';
  };

  const complete = async (id) => {
    try {
      setIsLoading((prev) => ({ ...prev, completeBtn: true }));
      const res = await completeUpload({ projectActionId: id });
      if (res.data?.code !== 200) {
        window.alert('Something went wrong.');
        console.log(res);
        return;
      }

      await refreshProjectDetail(projectId, projectVersion);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading((prev) => ({ ...prev, completeBtn: false }));
      setShowConfirmationComplete(false);
    }
  };

  return (
    <div className="update-upload-data">
      <RenderIf isTrue={isAllowed || (status === 'Completed')}>
        <UploadDocumentContent
          key={keyRefresher}
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
                  <div>Update Economic Indicator</div>
                  <div>{getLastUpdatedDate('UpdateEconomicIndicator')}</div>
                </div>
              )}
              size={Button.Size.LARGE}
              type={Button.Type.SECONDARY}
              onClick={() => { setEconomicIndicatorModalOpen(true); }}
            />
          </div>
        </div>

        <RenderIf isTrue={!isReadOnly}>
          <div className="btn-action">
            <Button
              primaryIcon={<Icon name="check" type="check" />}
              label="Complete"
              size="large"
              disabled={!requiredDocumentsIsValid}
              onClick={() => setShowConfirmationComplete(true)}
            />
          </div>
        </RenderIf>

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

        <ConfirmationModal
          open={showConfirmationComplete}
          setOpen={setShowConfirmationComplete}
          title="Completion Confirmation"
          message1="Are you sure you want to complete this process?"
          message2="This action can’t be undone."
          icon={{ name: 'square-check' }}
          buttonOkLabel="Yes, I’m sure"
          isLoading={isLoading?.completeBtn}
          onOk={() => complete(projectActionId)}
        />
      </RenderIf>
      <RenderIf isTrue={!isAllowed && status === 'In-Progress'}>
        <Alert
          showIcon
          icon={{ name: 'hourglass-clock', size: 40 }}
          message={`Waiting to be updated by ${getActorName(actors, listOfActorName)}`}
          type="warning"
          closeable={false}
        />
      </RenderIf>
    </div>
  );
};

UpdateUploadData.propTypes = {
  projectId: PropTypes.string,
  projectVersion: PropTypes.any,
  projectActionId: PropTypes.string,
  projectData: PropTypes.object,
  refreshProjectDetail: PropTypes.func,
  status: PropTypes.string,
  createdDate: PropTypes.string,
  isAllowed: PropTypes.bool,
  actors: PropTypes.array,
  listOfActorName: PropTypes.array,
  setProjectVersionHandler: PropTypes.func,
};

UpdateUploadData.defaultProps = {
  projectId: '',
  projectVersion: 1,
  projectActionId: '',
  projectData: {},
  refreshProjectDetail: () => {},
  status: '',
  createdDate: '',
  isAllowed: false,
  actors: [],
  listOfActorName: [],
  setProjectVersionHandler: () => {},
};

export default UpdateUploadData;
