const capitalizeWord = (value) => {
  if (!value) {
    return '';
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const toTitleCase = (value) => {
  if (!value) {
    return '';
  }

  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(capitalizeWord)
    .join(' ');
};
