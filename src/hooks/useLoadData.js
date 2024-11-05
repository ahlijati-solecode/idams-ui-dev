import { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';

const useLoadData = (params) => {
  const { getDataFunc, getDataParams, dataKey, reduxAction } = params;

  const dispatch = useDispatch();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const dataParamsRef = useRef(getDataParams);

  const loadData = async () => {
    setIsLoading(true);

    try {
      const response = await getDataFunc(dataParamsRef.current);
      const responseData = dataKey ? response.data[dataKey] : response.data;

      setData(responseData);

      if (reduxAction) {
        dispatch(reduxAction(responseData));
      }
    } catch (err) {
      console.log('useLoadData error', err);

      setError(err);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateGetDataParams = (newGetDataParams) => {
    dataParamsRef.current = newGetDataParams;
  };

  const refreshData = () => {
    loadData();
  };

  return [data, isLoading, error, updateGetDataParams, refreshData];
};

export default useLoadData;
