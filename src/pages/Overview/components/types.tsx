export type ItemProps = {
  data?: API.Plan;
  pack?: API.AssetPack;
  getProvider?: (id?: number | string) => API.Provider | undefined;
};
