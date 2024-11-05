import React from 'react';
import PropTypes from 'prop-types';
import UploadDocumentContent from './UploadDocumentContent';
import { PaperHeader, PaperTitle } from '../../../components';
import './UploadDocument.scss';

const UploadDocument = ({ projectId, projectVersion, onFormValidChange, isViewOnly }) => (
  <div className="create-project-upload-document">
    <PaperHeader>
      <PaperTitle>
        Project Initiation Document
      </PaperTitle>
    </PaperHeader>
    <UploadDocumentContent
      projectId={projectId}
      projectVersion={projectVersion}
      onFormValidChange={onFormValidChange}
      isViewOnly={isViewOnly}
    />
  </div>
);

UploadDocument.propTypes = {
  projectId: PropTypes.string,
  projectVersion: PropTypes.any,
  onFormValidChange: PropTypes.func,
  isViewOnly: PropTypes.bool,
};

UploadDocument.defaultProps = {
  projectId: '',
  projectVersion: 1,
  onFormValidChange: () => {},
  isViewOnly: false,
};

export default UploadDocument;
