import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Doughnut } from 'react-chartjs-2';
import { Tooltip as SoleTooltip } from '@solecode/sole-ui';
import PropTypes from 'prop-types';
import EmptyChart from '../../assets/empty-chart.svg';
import '../DashboardReport.scss';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const currencyFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const bgColors = {
  Inisiasi: [
    '#08365C',
    '#1D5E96',
    '#1F7DCE',
    '#57ACF6',
    '#A3C9EA',
  ],
  Seleksi: [
    '#36540D',
    '#5C8F13',
    '#73B617',
    '#88D121',
    '#AEE368',
  ],
  'Kajian Lanjut': [
    '#5A0D16',
    '#8C040E',
    '#CD1821',
    '#ED5D5E',
    '#FF9795',
  ],
  Completed: [
    '#262626',
    '#434343',
    '#595959',
    '#8c8c8c',
    '#bfbfbf',
  ],
  Approved: [
    '#262626',
    '#434343',
    '#595959',
    '#8c8c8c',
    '#bfbfbf',
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: true,
  elements: {
    arc: {
      borderWidth: 0,
    },
  },
  plugins: {
    legend: {
      position: 'none',
      labels: {
        usePointStyle: true,
      },
    },
    datalabels: {
      formatter(value) {
        return Number(value.toFixed(2)).toLocaleString();
      },
      color: 'white',
      labels: {
        title: {
          font: {
            weight: 'bold',
            size: 14,
          },
        },

      },
    },
  },
  cutout: '25%',
};

const Chart = ({ title, labels, values, stage }) => {
  const [data, setData] = useState({
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: bgColors[stage],
      },
    ],
  });

  const units = {
    Project: 'Projects',
    Gas: 'BSCF',
    Workover: 'Workover',
    Capex: 'MM$',
    Resources: 'MMBOE',
    Oil: 'MMBO',
    Wells: 'Wells',
  };

  const chartRef = useRef();
  useEffect(() => {
    if (chartRef.current) {
      if (labels && values) {
        setData({
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: bgColors[stage],
            },
          ],
        });
      }

      chartRef.current.render();
      chartRef.current.update();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, labels]);
  return (
    <div className="border-card">
      <div className="border-card-header">
        {
          title === 'Resources' && (stage === 'Kajian Lanjut' || stage === 'Completed') ?
            'Reserves'
            :
            title
        }
      </div>
      <div className="border-card-content">
        <div style={{ display: 'flex', width: '100%' }}>
          <div style={{ width: '200px' }}>
            {
              values.length > 0 ?
                (
                  <Doughnut
                    ref={chartRef}
                    data={data}
                    options={options}
                    redraw
                  />
                )
                : (
                  <div>
                    <img src={EmptyChart} alt="error 404" />
                  </div>
                )
              }
          </div>
          <div className="total">
            <span className="count">
              {
                title === 'Capex' ?
                  (
                    Number(values.reduce((accumulator, value) => accumulator + value, 0)) / 1000000).toFixed(2)
                    .toLocaleString()
                  :
                  Number(values.reduce((accumulator, value) => accumulator + value, 0).toFixed(2)).toLocaleString()
              }
            </span>
            <span>{units[title]}</span>
          </div>
        </div>
        <div className="legend-container">
          {
            labels.length > 0 ?
              labels.map((label, index) => (
                <SoleTooltip
                  title={currencyFormatter.format(values[index])}
                >
                  <div className="legend">
                    <div className="color" style={{ backgroundColor: bgColors[stage][index] }} />
                    <div className="text">
                      {label}
                    </div>
                  </div>
                </SoleTooltip>
              ))
              :
              ['Regional 1', 'Regional 5'].map((label, index) => (
                <SoleTooltip
                  title={currencyFormatter.format(values[index])}
                >
                  <div className="legend">
                    <div className="color" style={{ backgroundColor: bgColors[stage][index] }} />
                    <div className="text">
                      {label}
                    </div>
                  </div>
                </SoleTooltip>
              ))
          }
        </div>
      </div>
    </div>
  );
};

Chart.propTypes = {
  title: PropTypes.string.isRequired,
  labels: PropTypes.array.isRequired,
  values: PropTypes.array.isRequired,
  stage: PropTypes.string.isRequired,
};

export default Chart;
