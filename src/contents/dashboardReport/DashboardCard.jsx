import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Chart from './Chart';
import '../DashboardReport.scss';

const DashboardCard = ({ title, charts }) => {
  const [chartList, setChartList] = useState([]);

  useEffect(() => {
    const arrChart = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(charts)) {
      const labels = [];
      const values = [];

      // eslint-disable-next-line no-restricted-syntax
      for (const [key2, value2] of Object.entries(value)) {
        labels.push(key2);
        values.push(value2);
      }
      arrChart.push({
        title: key,
        labels,
        values,
      });

      setChartList(arrChart);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charts]);

  return (
    <div className="border-card">
      <div className="card-header">
        {
          title === 'Completed' ?
            'FID Approved'
            :
            title
        }
      </div>
      <div className="graphs">
        {
          chartList.map((a) => (
            <Chart key={a.title} title={a.title} labels={a.labels} values={a.values} stage={title} />
          ))
        }
      </div>
    </div>
  );
};

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  charts: PropTypes.object.isRequired,
};

export default DashboardCard;
