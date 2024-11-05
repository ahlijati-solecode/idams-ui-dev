import React, { useState, useEffect } from 'react';
import useProjectManagementApi from '../hooks/api/projectManagement';
import ComboBox from '../components/ComboBox';
import {
  HeaderBanner, Paper, PaperHeader, PaperTitle,
} from '../components';
import './DashboardReport.scss';
import DashboardCard from './dashboardReport/DashboardCard';

const DashboardReport = () => {
  const [filterRegional, setFilterRegional] = useState([]);
  const [filterRkap, setFilterRkap] = useState([]);
  const [filterThreshold, setFilterThreshold] = useState([]);

  const [regionalData, setRegionalData] = useState([]);
  const [rkapData, setRkapData] = useState([]);
  const [thresholdData, setThresholdData] = useState([]);

  const { getDropdown, getDashboardReport } = useProjectManagementApi();

  const [stages, setStages] = useState([]);

  const getDropdownData = async () => {
    try {
      const res = await getDropdown();
      if (res?.data?.code !== 200) {
        // eslint-disable-next-line no-alert
        window.alert('Something went wrong.');
        console.log(res);
        return;
      }

      const regional = [
        ...Object.keys(res.data.data?.hierLvl2).map((e) => ({
          value: res.data.data?.hierLvl2[e],
          label: res.data.data?.hierLvl2[e],
        })),
      ];

      const threshold = [
        ...Object.keys(res.data.data?.threshold).map((e) => ({
          value: res.data.data?.threshold[e],
          label: res.data.data?.threshold[e],
        })),
      ];

      setRegionalData(regional);
      setThresholdData(threshold);
    } catch (e) {
      console.log(e);
    }
  };

  const getDashboard = async () => {
    try {
      const mappingRegional = [];
      const mappingRkap = [];
      const mappingThreshold = [];

      for (let i = 0; i < filterRegional.length; i += 1) {
        mappingRegional.push(filterRegional[i].value);
      }
      for (let i = 0; i < filterRkap.length; i += 1) {
        mappingRkap.push(filterRkap[i].value);
      }
      for (let i = 0; i < filterThreshold.length; i += 1) {
        mappingThreshold.push(filterThreshold[i].value);
      }

      const res = await getDashboardReport(
        mappingRegional.join(','),
        mappingRkap.join(';'),
        mappingThreshold.join(','),
      );

      if (res?.data?.code === 200) {
        const rkap = [];
        for (let i = 0; i < res.data.data.rkapDropdown.length; i += 1) {
          const obj = {
            value: res.data.data.rkapDropdown[i],
            label: res.data.data.rkapDropdown[i],
          };

          rkap.push(obj);

          const obj2 = {
            value: `${res.data.data.rkapDropdown[i]},1`,
            label: `${res.data.data.rkapDropdown[i]} Revisi`,
          };

          rkap.push(obj2);
        }

        setRkapData(rkap);
      }

      const arrStage = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, value] of Object.entries(res.data.data.stage)) {
        if (Object.keys(value).length) {
          arrStage.push({
            title: key,
            charts: value,
          });
        }
      }

      setStages(arrStage);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getDropdownData();
    getDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getDashboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRegional, filterRkap, filterThreshold]);

  return (
    <div className="dashboard-report">
      <HeaderBanner
        title="Dashboard Reporting"
        type="primary"
      />
      <div className="card-container">
        <div className="card">
          <div className="pills orange-pills">
            Stage
          </div>
          <div className="line orange-line" />
          <div className="paragraph">
            All projects based on stages which includes information related to projects, &nbsp;
            resources, capex, wells, and workovers.
          </div>
        </div>

        <div className="disabled-card">
          <div className="pills blue-pills">
            FID In-Progress
          </div>
          <div className="line blue-line" />
          <div className="paragraph">
            Provide information related to project distribution,
            variance, project list, and FID In Progress list.
          </div>
        </div>

        <div className="disabled-card">
          <div className="pills light-green-pills">
            Approval
          </div>
          <div className="line light-green-line" />
          <div className="paragraph">
            Projects that have received FID Approval, DG-2 Approval,
            & POD Approval. Or still expecting FID Approval & POD Approval.
          </div>
        </div>
        <div className="disabled-card">
          <div className="pills dark-green-pills">
            Realized Meeting
          </div>
          <div className="line dark-green-line" />
          <div className="paragraph">
            List of Realized Meetings and Upcoming Meetings on each workflow.
          </div>
        </div>
      </div>
      <div className="paper-container">
        <Paper>
          <PaperHeader>
            <div className="paper-head">
              <PaperTitle>
                Stage
              </PaperTitle>
              <div className="paper-subtitle">
                All projects based on stages which includes information related to projects,
                resources, capex, wells, and workovers.
              </div>
            </div>
          </PaperHeader>
          <div className="filter-container">
            <ComboBox
              options={regionalData}
              showSearch={false}
              placeholder="Select Regional"
              onChange={(e) => {
                setFilterRegional(e);
              }}
              value={filterRegional}
            />

            <ComboBox
              options={rkapData}
              showSearch={false}
              placeholder="Select RKAP"
              onChange={(e) => {
                setFilterRkap(e);
              }}
              value={filterRkap}
            />

            <ComboBox
              options={thresholdData}
              showSearch={false}
              placeholder="Select Threshold"
              onChange={(e) => {
                setFilterThreshold(e);
              }}
              value={filterThreshold}
            />
          </div>
          <div className="graph-container">
            {
              stages.map((stage) => (
                <DashboardCard key={stage.title} title={stage.title} charts={stage.charts} />
              ))
            }
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default DashboardReport;
