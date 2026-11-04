export const getMetaValue = (meta: any[] | undefined, key: string): string | undefined => {
  return meta?.find((m) => m.metaKey === key)?.metaValue;
};
