import React from 'react';
import moment from 'moment/moment';
import PropTypes from 'prop-types';
import { Icon } from '@solecode/sole-ui';
import { IconSet } from '../enums/enums';
import KEY_NAME from '../enums/keyName';
import './RecentFileCards.scss';

const FileCard = ({ data, redirectToPreviewPage }) => {
  const IconName = {
    '.docx': IconSet.WORD,
    '.doc': IconSet.WORD,
    '.pdf': IconSet.PDF,
    '.ppt': IconSet.PPT,
    '.pptx': IconSet.PPT,
    '.xlsx': IconSet.XLS,
    '.xls': IconSet.XLS,
    '.xlm': IconSet.XLS,
    '.xlsm': IconSet.XLS,
    '.jpg': IconSet.JPG,
    '.jpeg': IconSet.JPG,
  };

  return (
    <div className="file-card-component" id="recent-file-list">
      {
        data?.map((item) => (
          <div
            className="file-card-item"
            key={`file-card-item-${item?.[KEY_NAME.TRANS_DOC_ID]}`}
            onClick={() => redirectToPreviewPage(item)}
            onKeyDown={() => redirectToPreviewPage(item)}
            role="button"
            tabIndex={0}
          >
            <Icon name={IconName?.[item?.fileExtension]} size="56" type="solid" />
            <div className="details-wrapper">
              <span className="details-title">{item?.[KEY_NAME.FILE_NAME]}</span>
              <span className="details-category">{item?.[KEY_NAME.DOC_CATEGORY]}</span>
              <span className="details-opened-at">{item?.lastOpened ? `Opened ${moment(item?.lastOpened).fromNow()}` : '-'}</span>
            </div>
          </div>
        ))
      }
    </div>
  );
};

FileCard.propTypes = {
  data: PropTypes.array,
  redirectToPreviewPage: PropTypes.func,
};

FileCard.defaultProps = {
  data: [],
  redirectToPreviewPage: () => {},
};

export default FileCard;
