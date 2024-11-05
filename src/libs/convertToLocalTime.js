import moment from 'moment';

const convertToLocalTime = (value, format = 'DD MMM YYYY HH:mm') => moment.utc(value).clone().local().format(format);

export default convertToLocalTime;
