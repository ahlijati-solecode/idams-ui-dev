import axiosPrivate from '../../../libs/axiosPrivate';

const useOutstandingTaskList = () => {
  const generateGetListQuery = (params) => {
    const queries =
      Object.keys(params)
        .filter((e) => params[e])
        .map((e) => ({ key: e, value: params[e] }));

    return queries.length === 0 ? '' : `?${queries.map((e) => `${e.key}=${e.value}`).join('&')}`;
  };

  const getList = async (params) => axiosPrivate.get(`/outstandingTaskList/list${generateGetListQuery(params)}`);

  return {
    getList,
  };
};

export default useOutstandingTaskList;
