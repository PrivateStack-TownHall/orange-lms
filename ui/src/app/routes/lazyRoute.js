export const lazyRoute = (importer) => async () => {
  const module = await importer();

  return { Component: module.default };
};
