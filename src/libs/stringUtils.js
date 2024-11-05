export const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);
export const truncateString = (string, maxLength) => string?.length > maxLength ? `${string.slice(0, maxLength)}...` : string;
export const titleCase = (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
export const pascalCase = (str) => (str.match(/[a-zA-Z0-9]+/g) || []).map((w) => `${w.charAt(0).toUpperCase()}${w.slice(1)}`).join('');
export const camelCase = (str) => str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase()).replace(/\s+/g, '');

export default {
  capitalizeFirstLetter,
  truncateString,
  titleCase,
  pascalCase,
};
