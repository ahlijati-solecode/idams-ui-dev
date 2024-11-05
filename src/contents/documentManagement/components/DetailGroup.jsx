import React from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import './DetailGroup.scss';
import RenderIf from '../../RenderIf';

const DetailGroup = ({
  threshold,
  hierLvl2Desc,
  hierLvl3Desc,
  rkap,
  revision,
  subCriteria = null,
}) => {
  const location = useLocation();
  const PATHNAME = 'detail-project';

  return (
    <div className="detail-group">
      <div className="threshold">
        <div className={['dot', threshold ? `dot-${threshold?.toLowerCase()}` : ''].join(' ')} />
        <span>{threshold || '-'}</span>
      </div>
      <div className="divider" />
      <div className="zona-regional">
        {`${hierLvl3Desc || '-'} · ${hierLvl2Desc || '-'}`}
      </div>
      <div className="divider" />
      <div className="rkap">
        {rkap ? `RKAP ${rkap}` : ''}
        {revision ? ' Revisi' : ''}
      </div>
      <RenderIf isTrue={!location.pathname.includes(PATHNAME)}>
        <div className="divider" />
        <div className="sub-criteria">
          {subCriteria || '-'}
        </div>
      </RenderIf>
    </div>
  );
};

DetailGroup.propTypes = {
  threshold: PropTypes.string,
  hierLvl2Desc: PropTypes.string,
  hierLvl3Desc: PropTypes.string,
  rkap: PropTypes.number,
  revision: PropTypes.bool,
  subCriteria: PropTypes.string,
};

DetailGroup.defaultProps = {
  threshold: null,
  hierLvl2Desc: null,
  hierLvl3Desc: null,
  rkap: null,
  revision: false,
  subCriteria: null,
};

export default DetailGroup;
