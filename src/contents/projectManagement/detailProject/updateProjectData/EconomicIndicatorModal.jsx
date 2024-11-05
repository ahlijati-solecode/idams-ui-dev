/* eslint-disable no-alert */
/* eslint-disable max-len */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import { Button, Icon } from '@solecode/sole-ui';
import { ConfirmationModal } from '../../../../components';
import EconomicIndicatorContent from '../../createProject/components/EconomicIndicatorContent';
import { DEFAULT_ECONOMIC_INDICATOR_FORM_DATA } from '../../createProject/constants/formData';
import KEY_NAME from '../../createProject/constants/keyName';
import useProjectManagementApi from '../../../../hooks/api/projectManagement';
import '../../createProject/components/EconomicIndicatorForm.scss';

const EconomicIndicatorModal = ({
  open,
  setOpen,
  onSubmit,
  projectData,
  isReadOnly,
  setProjectVersionHandler,
  setProjectVersionParams,
}) => {
  const {
    updateEconomicIndicator,
    getLatestVersion,
  } = useProjectManagementApi();

  const [MM_DOLLAR] = useState(1000000);

  const { projectId, projectVersion, projectCategory } = projectData;

  const [economicIndicatorForm, setEconomicIndicatorForm] = useState(DEFAULT_ECONOMIC_INDICATOR_FORM_DATA);

  const [isLoading, setIsLoading] = useState({
    form: false,
    submit: false,
    refresh: false,
  });

  const [refreshModal, setRefreshModal] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const form = { ...economicIndicatorForm };
    form[KEY_NAME.NET_PRESENT_VALUE] = projectData.netPresentValue ? String(Number(projectData.netPresentValue) / MM_DOLLAR) : null;
    form[KEY_NAME.PROFITABILITY_INDEX] = projectData.profitabilityIndex;
    form[KEY_NAME.INTERNAL_RATE_OF_RETURN] = projectData.internalRateOfReturn;
    form[KEY_NAME.DISCOUNTED_PAY_OUT_TIME] = projectData.discountedPayOutTime;
    form[KEY_NAME.PV_IN] = projectData?.pvin ? String(Number(projectData.pvin) / MM_DOLLAR) : null;
    form[KEY_NAME.PV_OUT] = projectData?.pvout ? String(Number(projectData.pvout) / MM_DOLLAR) : null;
    form[KEY_NAME.BENEFIT_COST_RATIO] = projectData.benefitCostRatio;

    setEconomicIndicatorForm(form);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onChangeFormData = (e, key) => {
    const payload = { ...economicIndicatorForm };
    payload[key] = e;

    setEconomicIndicatorForm(payload);
  };

  const onChangeFloatData = (e, key) => {
    const payload = { ...economicIndicatorForm };
    payload[key] = e;

    setEconomicIndicatorForm(payload);
  };

  const disableSubmit = () => {
    let result = false;
    if (projectCategory === 'BusDev') {
      result = !economicIndicatorForm[KEY_NAME.NET_PRESENT_VALUE]
      || !economicIndicatorForm[KEY_NAME.PROFITABILITY_INDEX]
      || !economicIndicatorForm[KEY_NAME.INTERNAL_RATE_OF_RETURN]
      || !economicIndicatorForm[KEY_NAME.DISCOUNTED_PAY_OUT_TIME]
      || Object.values(isLoading).includes(true);
    } else {
      result = !economicIndicatorForm[KEY_NAME.PV_IN]
      || !economicIndicatorForm[KEY_NAME.PV_OUT]
      || !economicIndicatorForm[KEY_NAME.BENEFIT_COST_RATIO]
      || Object.values(isLoading).includes(true);
    }

    return result;
  };

  const handleSubmit = async () => {
    const payload = economicIndicatorForm;
    payload.projectId = projectId;
    payload.projectVersion = projectVersion;
    payload.section = 'UpdateEconomicIndicator';

    if (projectCategory === 'BusDev') {
      payload.netPresentValue = typeof payload.netPresentValue === 'string' ? Number(payload.netPresentValue?.replace(/[^0-9.-]+/g, '')) : payload.netPresentValue;
    } else {
      payload.pvin = typeof payload.pvin === 'string' ? Number(payload.pvin?.replace(/[^0-9.-]+/g, '')) * MM_DOLLAR : payload.pvin;
      payload.pvout = typeof payload.pvout === 'string' ? Number(payload.pvout?.replace(/[^0-9.-]+/g, '')) * MM_DOLLAR : payload.pvout;
    }

    try {
      setIsLoading((prev) => ({ ...prev, submit: true }));
      const res = await updateEconomicIndicator(payload);

      if (res.data?.code !== 200) {
        if (res.response.data.message.includes('inactive template')) {
          setRefreshModal(true);
          return;
        }

        console.log(res.response);
        return;
      }

      if (res.data?.code === 200) {
        setProjectVersionHandler(res.data.data);
        onSubmit(res.data.data);
      }
    } catch (error) {
      window.alert('Something went wrong.');
      console.log(error);
    } finally {
      setIsLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  return (
    <Modal
      visible={open}
      onOk={() => { setOpen(false); }}
      onCancel={() => { setOpen(false); }}
      title={<b>Update Economic Indicator</b>}
      width={1000}
      footer={isReadOnly ? null : (
        <div>
          <Button
            label="Save & Update"
            size={Button.Size.LARGE}
            onClick={handleSubmit}
            primaryIcon={isLoading.submit ? <Icon name="spinner-third" spin size={24} /> : <Icon name="floppy-disk" />}
            disabled={disableSubmit()}
          />
        </div>
      )}
    >
      <div className="economic-indicator-form form modal">
        <div className="form-title modal">
          <div className="project-category">{projectCategory === 'BusDev' ? 'Business Development' : 'Non Business Development'}</div>
        </div>
        <EconomicIndicatorContent
          projectCategory={projectCategory}
          economicIndicatorForm={economicIndicatorForm}
          onChangeFormData={onChangeFormData}
          onChangeFloatData={onChangeFloatData}
          isViewOnly={isReadOnly}
        />
      </div>
      <ConfirmationModal
        icon={{ name: 'refresh', type: 'solid' }}
        open={refreshModal}
        setOpen={setRefreshModal}
        title="Error"
        message1="Economic Indicator has been updated by another person."
        buttonOkLabel="Refresh"
        buttonOkPrimaryIcon={<Icon name="refresh" type="solid" />}
        isSingleButton
        isLoading={isLoading?.refresh}
        onOk={async () => {
          try {
            setIsLoading((prev) => ({ ...prev, refresh: true }));
            const res = await getLatestVersion(projectData?.projectId);

            if (res.data?.code !== 200) {
              window.alert('Something went wrong.');
              console.log(res.response);
              return;
            }

            setProjectVersionParams(res.data.data);
            setRefreshModal(false);
            window.location.reload();
          } catch (e) {
            console.log(e);
          } finally {
            setIsLoading((prev) => ({ ...prev, refresh: false }));
          }
        }}
      />
    </Modal>
  );
};

EconomicIndicatorModal.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  onSubmit: PropTypes.func,
  setProjectVersionHandler: PropTypes.func,
  projectData: PropTypes.object,
  isReadOnly: PropTypes.bool,
  setProjectVersionParams: PropTypes.func,
};

EconomicIndicatorModal.defaultProps = {
  open: false,
  setOpen: () => {},
  onSubmit: () => {},
  projectData: {},
  isReadOnly: false,
  setProjectVersionHandler: () => {},
  setProjectVersionParams: () => {},
};

export default EconomicIndicatorModal;
