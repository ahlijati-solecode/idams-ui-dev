import './ScopeOfWorkForm.scss';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Card, Button, Icon, SelectSearch } from '@solecode/sole-ui';
import { Input } from 'antd';
import RenderIf from '../../../RenderIf';

import KEY_NAME from '../constants/keyName';
import useProjectManagementApi from '../../../../hooks/api/projectManagement';

const ScopeOfWorkContent = ({
  form,
  onChangeForm,
  isViewOnly,
}) => {
  // const [form, setForm] = useState(DEFAULT_SCOPE_OF_WORK_FORM_DATA);
  const [dropdownList, setDropdownList] = useState();
  const [fieldOptions, setFieldOptions] = useState();
  const [compressorTypeOptions, setCompressorTypeOptions] = useState();

  // platform
  const [platformCount, setPlatformCount] = useState();
  const [platformLegCount, setPlatformLegCount] = useState();

  // pipeline
  const [fieldService, setFieldService] = useState();
  const [pipelineCount, setPipelineCount] = useState();
  const [pipelineLenght, setPipelineLenght] = useState();

  // compressor
  const [compressorType, setCompressorType] = useState();
  const [compressorCount, setCompressorCount] = useState();
  const [compressorCapacity, setCompressorCapacity] = useState();
  const [compressorCapacityUoM, setCompressorCapacityUoM] = useState();
  const [compressorDischargePressure, setCompressorDischargePressure] = useState();

  // equipment
  const [equipmentName, setEquipmentName] = useState();
  const [equipmentCount, setEquipmentCount] = useState();

  const {
    getScopeOfWorkDropdownList,
  } = useProjectManagementApi();

  const constructDropdown = (list) => list?.map((i) => ({ label: i.value, value: i.key }));
  const isInvalidAddedData = (data) => Object.values(data).some((value) => [null, '', undefined, []].includes(value));

  const getPayloadData = (e, key) => {
    const payload = { ...form };
    const value = [...e];
    if (key === KEY_NAME.PLATFORM && !isInvalidAddedData({ platformCount, platformLegCount })) {
      value.push({ platformCount, platformLegCount });
      payload[key] = value;
    } else if (key === KEY_NAME.PIPELINE && !isInvalidAddedData({ fieldService, pipelineCount, pipelineLenght })) {
      value.push({ fieldService, pipelineCount, pipelineLenght });
      payload[key] = value;
    } else if (key === KEY_NAME.COMPRESSOR && !isInvalidAddedData({
      compressorType,
      compressorCount,
      compressorCapacity,
      compressorCapacityUoM,
      compressorDischargePressure,
    })) {
      value.push({
        compressorType,
        compressorCount,
        compressorCapacity,
        compressorCapacityUoM,
        compressorDischargePressure,
      });
      payload[key] = value;
    } else if (key === KEY_NAME.EQUIPMENT && !isInvalidAddedData({ equipmentName, equipmentCount })) {
      value.push({ equipmentName, equipmentCount });
      payload[key] = value;
    }
    return payload[key];
  };

  const onDeleteFormData = (index, key) => {
    const payload = { ...form };
    payload[key] = form[key].filter((_, idx) => idx !== index);

    onChangeForm(payload[key], key);
  };

  const getScopeOfWorkDropdownListAction = async () => {
    try {
      const res = await getScopeOfWorkDropdownList();

      if (res?.status === 'Success') {
        setDropdownList(res.data);
        setFieldOptions(constructDropdown(res.data.fieldService));
        setCompressorTypeOptions(constructDropdown(res.data.compressorType));
        setCompressorCapacityUoM(res.data.compressorType[0].unit);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getFieldLabel = (value) => fieldOptions?.filter((i) => i.value === value)[0]?.label;

  useEffect(() => {
    getScopeOfWorkDropdownListAction();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line react/prop-types
  const EmptyForm = ({ nameField }) => (
    <div className="empty-form">
      You haven’t add any
      {' '}
      {nameField}
      {' '}
      yet.
    </div>
  );

  return (
    <>
      <Card body={(
        <div className="form-well">
          <div className="form-field">
            <div className="form-label">Jumlah Well Drill (Producer + New Drill)</div>
            <Input
              placeholder="Input Jumlah Well Drill (Producer + New Drill)"
              size="large"
              type="text"
              min={0}
              suffix={<div>Well</div>}
              value={form[KEY_NAME.WELL_DRILL_PRODUCER_COUNT] !== null ? Number(form[KEY_NAME.WELL_DRILL_PRODUCER_COUNT]).toLocaleString('en-US') : null}
              onChange={(e) => onChangeForm(e.target.value.replace(/[^0-9]/g, ''), KEY_NAME.WELL_DRILL_PRODUCER_COUNT)}
              disabled={isViewOnly}
            />
          </div>

          <div className="form-field">
            <div className="form-label">Jumlah Well Work Over (Producer)</div>
            <Input
              placeholder="Input Jumlah Well Work Over (Producer)"
              size="large"
              type="text"
              min={0}
              suffix={<div>Well</div>}
              value={form[KEY_NAME.WELL_WORK_OVER_PRODUCER_COUNT] !== null ? Number(form[KEY_NAME.WELL_WORK_OVER_PRODUCER_COUNT]).toLocaleString('en-US') : null}
              onChange={(e) => onChangeForm(e.target.value.replace(/[^0-9]/g, ''), KEY_NAME.WELL_WORK_OVER_PRODUCER_COUNT)}
              disabled={isViewOnly}
            />
          </div>

          <div className="form-field">
            <div className="form-label">Jumlah Well Drill (Injector)</div>
            <Input
              placeholder="Input Jumlah Well Drill (Injector)"
              size="large"
              type="text"
              min={0}
              suffix={<div>Well</div>}
              value={form[KEY_NAME.WELL_DRILL_INJECTOR_COUNT] !== null ? Number(form[KEY_NAME.WELL_DRILL_INJECTOR_COUNT]).toLocaleString('en-US') : null}
              onChange={(e) => onChangeForm(e.target.value.replace(/[^0-9]/g, ''), KEY_NAME.WELL_DRILL_INJECTOR_COUNT)}
              disabled={isViewOnly}
            />
          </div>

          <div className="form-field">
            <div className="form-label">Jumlah Well Work Over (Injector)</div>
            <Input
              placeholder="Input Jumlah Well Work Over (Injector)"
              size="large"
              type="text"
              min={0}
              suffix={<div>Well</div>}
              value={form[KEY_NAME.WELL_WORK_OVER_INJECTOR_COUNT] !== null ? Number(form[KEY_NAME.WELL_WORK_OVER_INJECTOR_COUNT]).toLocaleString('en-US') : null}
              onChange={(e) => onChangeForm(e.target.value.replace(/[^0-9]/g, ''), KEY_NAME.WELL_WORK_OVER_INJECTOR_COUNT)}
              disabled={isViewOnly}
            />
          </div>
        </div>
      )}
      />

      <Card body={(
        <div className="form form-platform">
          <div className="row">
            <div className="form-header">
              Jumlah Platform Baru
            </div>
            <div className="form-header">
              Jumlah Platform Leg
            </div>
            <div className="form-header-action" />
          </div>

          <div className="row">
            <div className="form-field">
              <Input
                placeholder="Input Jumlah Platform Baru"
                size="large"
                type="text"
                min={0}
                suffix={<div>Unit</div>}
                value={platformCount ? Number(platformCount).toLocaleString('en-US') : null}
                onChange={(e) => setPlatformCount(e.target.value.replace(/[^0-9]/g, ''))}
                disabled={isViewOnly}
              />
            </div>

            <div className="form-field">
              <Input
                placeholder="Input Jumlah Platform Leg"
                size="large"
                type="text"
                min={0}
                suffix={<div>Leg</div>}
                value={platformLegCount ? Number(platformLegCount).toLocaleString('en-US') : null}
                onChange={(e) => setPlatformLegCount(e.target.value.replace(/[^0-9]/g, ''))}
                disabled={isViewOnly}
              />
            </div>

            <RenderIf isTrue={!isViewOnly}>
              <div className="form-field-action">
                <Button
                  label="Add"
                  type="secondary"
                  size="large"
                  onClick={() => {
                    onChangeForm(
                      getPayloadData(form[KEY_NAME.PLATFORM], KEY_NAME.PLATFORM),
                      KEY_NAME.PLATFORM
                    );
                    setPlatformLegCount();
                    setPlatformCount();
                  }}
                />
              </div>
            </RenderIf>
          </div>

          <RenderIf isTrue={form[KEY_NAME.PLATFORM]?.length === 0}>
            <EmptyForm nameField="platform" />
          </RenderIf>

          {form[KEY_NAME.PLATFORM]?.map((platform, indexPlatform) => (
            // eslint-disable-next-line react/no-array-index-key
            <div className="row" key={`platform-item-${indexPlatform}`}>
              <div className="item">
                {Number(platform.platformCount).toLocaleString('en-US')}
                {' '}
                Units
              </div>
              <div className="item">
                {Number(platform.platformLegCount).toLocaleString('en-US')}
                {' '}
                Legs
              </div>
              <RenderIf isTrue={!isViewOnly}>
                <div className="item-action">
                  <Button
                    label="Delete Platform"
                    shape="circle"
                    primaryIcon={<Icon name="trash-can" type="solid" />}
                    onClick={() => onDeleteFormData(indexPlatform, KEY_NAME.PLATFORM)}
                  />
                </div>
              </RenderIf>
            </div>
          ))}
        </div>
      )}
      />

      <Card body={(
        <div className="form form-pipeline">
          <div className="row">
            <div className="form-header">
              Field Service
            </div>
            <div className="form-header">
              Jumlah Pipeline
            </div>
            <div className="form-header">
              Total Panjang Pipeline
            </div>
            <div className="form-header-action" />
          </div>

          <div className="row">
            <div className="form-field">
              <SelectSearch
                options={fieldOptions}
                placeholder="Select Field Service"
                size="large"
                value={fieldService}
                onChange={(e) => setFieldService(e)}
                disabled={isViewOnly}
              />
            </div>

            <div className="form-field">
              <Input
                placeholder="Input Jumlah Pipeline"
                size="large"
                type="text"
                min={0}
                suffix={<div>Unit</div>}
                value={pipelineCount ? Number(pipelineCount).toLocaleString('en-US') : null}
                onChange={(e) => setPipelineCount(e.target.value.replace(/[^0-9]/g, ''))}
                disabled={isViewOnly}
              />
            </div>

            <div className="form-field">
              <Input
                placeholder="Input Total Panjang Pipeline"
                size="large"
                type="text"
                min={0}
                suffix={<div>km</div>}
                value={pipelineLenght ? Number(pipelineLenght).toLocaleString('en-US') : null}
                onChange={(e) => setPipelineLenght(e.target.value.replace(/[^0-9]/g, ''))}
                disabled={isViewOnly}
              />
            </div>

            <RenderIf isTrue={!isViewOnly}>
              <div className="form-field-action">
                <Button
                  label="Add"
                  type="secondary"
                  size="large"
                  onClick={() => {
                    onChangeForm(
                      getPayloadData(form[KEY_NAME.PIPELINE], KEY_NAME.PIPELINE),
                      KEY_NAME.PIPELINE
                    );
                    setPipelineLenght();
                    setPipelineCount();
                    setFieldService();
                  }}
                />
              </div>
            </RenderIf>
          </div>

          <RenderIf isTrue={form[KEY_NAME.PIPELINE]?.length === 0}>
            <EmptyForm nameField="pipeline" />
          </RenderIf>

          {form[KEY_NAME.PIPELINE]?.map((pipeline, indexPipeline) => (
            // eslint-disable-next-line react/no-array-index-key
            <div className="row" key={`pipeline-item-${indexPipeline}`}>
              <div className="item">
                {getFieldLabel(pipeline.fieldService)}
              </div>
              <div className="item">
                {Number(pipeline.pipelineCount).toLocaleString('en-US')}
                {' '}
                Units
              </div>
              <div className="item">
                {Number(pipeline.pipelineLenght).toLocaleString('en-US')}
                {' '}
                km
              </div>
              <RenderIf isTrue={!isViewOnly}>
                <div className="item-action">
                  <Button
                    label="Delete Pipeline"
                    shape="circle"
                    primaryIcon={<Icon name="trash-can" type="solid" />}
                    onClick={() => onDeleteFormData(indexPipeline, KEY_NAME.PIPELINE)}
                  />
                </div>
              </RenderIf>
            </div>
          ))}
        </div>
      )}
      />

      <Card body={(
        <div className="form form-compressor">
          <div className="row">
            <div className="form-header">
              Tipe Compressor
            </div>
            <div className="form-header">
              Jumlah Compressor
            </div>
            <div className="form-header">
              Kapasitas Compressor
            </div>
            <div className="form-header">
              Discharge Pressure
            </div>
            <div className="form-header-action" />
          </div>

          <div className="row">
            <div className="form-field">
              <SelectSearch
                options={compressorTypeOptions}
                placeholder="Select Tipe Compressor"
                size="large"
                value={compressorType}
                onChange={(e) => {
                  setCompressorType(e);
                  setCompressorCapacityUoM(dropdownList.compressorType.filter((i) => i.key === e)[0].unit);
                }}
                disabled={isViewOnly}
              />
            </div>

            <div className="form-field">
              <Input
                placeholder="Input Jumlah Compressor"
                size="large"
                type="text"
                min={0}
                suffix={<div>Unit</div>}
                value={compressorCount ? Number(compressorCount).toLocaleString('en-US') : null}
                onChange={(e) => setCompressorCount(e.target.value.replace(/[^0-9]/g, ''))}
                disabled={isViewOnly}
              />
            </div>

            <div className="form-field">
              <Input
                placeholder="Input Kapasitas Compressor"
                size="large"
                type="text"
                min={0}
                suffix={<div>{compressorCapacityUoM}</div>}
                value={compressorCapacity ? Number(compressorCapacity).toLocaleString('en-US') : null}
                onChange={(e) => setCompressorCapacity(e.target.value.replace(/[^0-9]/g, ''))}
                disabled={isViewOnly}
              />
            </div>

            <div className="form-field">
              <Input
                placeholder="Input Discharge Pressure"
                size="large"
                type="text"
                min={0}
                suffix={<div>psig</div>}
                value={compressorDischargePressure ? Number(compressorDischargePressure).toLocaleString('en-US') : null}
                onChange={(e) => setCompressorDischargePressure(e.target.value.replace(/[^0-9]/g, ''))}
                disabled={isViewOnly}
              />
            </div>

            <RenderIf isTrue={!isViewOnly}>
              <div className="form-field-action">
                <Button
                  label="Add"
                  type="secondary"
                  size="large"
                  onClick={() => {
                    onChangeForm(
                      getPayloadData(form[KEY_NAME.COMPRESSOR], KEY_NAME.COMPRESSOR),
                      KEY_NAME.COMPRESSOR
                    );
                    setCompressorDischargePressure();
                    setCompressorCapacity();
                    setCompressorCount();
                    setCompressorCapacityUoM();
                    setCompressorType();
                  }}
                />
              </div>
            </RenderIf>
          </div>

          <RenderIf isTrue={form[KEY_NAME.COMPRESSOR]?.length === 0}>
            <EmptyForm nameField="compressor" />
          </RenderIf>

          {form[KEY_NAME.COMPRESSOR]?.map((compressor, indexCompressor) => (
            // eslint-disable-next-line react/no-array-index-key
            <div className="row" key={`compressor-item-${indexCompressor}`}>
              <div className="item">
                {compressor.compressorType}
              </div>
              <div className="item">
                {Number(compressor.compressorCount).toLocaleString('en-US')}
                {' '}
                Units
              </div>
              <div className="item">
                {Number(compressor.compressorCapacity).toLocaleString('en-US')}
                {' '}
                {compressor.compressorCapacityUoM}
              </div>
              <div className="item">
                {Number(compressor.compressorDischargePressure).toLocaleString('en-US')}
                {' '}
                psig
              </div>
              <RenderIf isTrue={!isViewOnly}>
                <div className="item-action">
                  <Button
                    label="Delete Compressor"
                    shape="circle"
                    primaryIcon={<Icon name="trash-can" type="solid" />}
                    onClick={() => onDeleteFormData(indexCompressor, KEY_NAME.COMPRESSOR)}
                  />
                </div>
              </RenderIf>
            </div>
          ))}
        </div>
      )}
      />

      <Card body={(
        <div className="form form-platform">
          <div className="row">
            <div className="form-header">
              Other Equipments
            </div>
            <div className="form-header">
              Jumlah
            </div>
            <div className="form-header-action" />
          </div>

          <div className="row">
            <div className="form-field-equipment">
              <Input
                placeholder="Input Other Equipments"
                size="large"
                type="text"
                min={0}
                maxLength={200}
                value={equipmentName}
                onChange={(e) => setEquipmentName(e.target.value)}
                disabled={isViewOnly}
              />
            </div>

            <div className="form-field-equipment">
              <Input
                placeholder="Input Jumlah"
                size="large"
                type="text"
                min={0}
                value={equipmentCount ? Number(equipmentCount).toLocaleString('en-US') : null}
                onChange={(e) => setEquipmentCount(e.target.value.replace(/[^0-9]/g, ''))}
                disabled={isViewOnly}
              />
            </div>

            <RenderIf isTrue={!isViewOnly}>
              <div className="form-field-action">
                <Button
                  label="Add"
                  type="secondary"
                  size="large"
                  onClick={() => {
                    onChangeForm(
                      getPayloadData(form[KEY_NAME.EQUIPMENT], KEY_NAME.EQUIPMENT),
                      KEY_NAME.EQUIPMENT
                    );
                    setEquipmentCount();
                    setEquipmentName();
                  }}
                />
              </div>
            </RenderIf>
          </div>

          <RenderIf isTrue={form[KEY_NAME.EQUIPMENT]?.length === 0}>
            <EmptyForm nameField="other equipments" />
          </RenderIf>

          {form[KEY_NAME.EQUIPMENT]?.map((equipment, indexEquipment) => (
            // eslint-disable-next-line react/no-array-index-key
            <div className="row" key={`equipment-item-${indexEquipment}`}>
              <div className="item">
                {equipment.equipmentName}
              </div>
              <div className="item">
                {Number(equipment.equipmentCount).toLocaleString('en-US')}
              </div>
              <RenderIf isTrue={!isViewOnly}>
                <div className="item-action">
                  <Button
                    label="Delete Equipment"
                    shape="circle"
                    primaryIcon={<Icon name="trash-can" type="solid" />}
                    onClick={() => onDeleteFormData(indexEquipment, KEY_NAME.EQUIPMENT)}
                  />
                </div>
              </RenderIf>
            </div>
          ))}
        </div>
      )}
      />
    </>
  );
};

ScopeOfWorkContent.propTypes = {
  form: PropTypes.object,
  onChangeForm: PropTypes.func,
  isViewOnly: PropTypes.bool,
};

ScopeOfWorkContent.defaultProps = {
  form: {},
  onChangeForm: () => {},
  isViewOnly: false,
};

export default ScopeOfWorkContent;
