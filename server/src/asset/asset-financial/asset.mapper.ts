import { AssetDocumentDto, AssetMetaDto } from '../dto';

export const mapAssetMeta = (meta?: AssetMetaDto[]) => {
  if (!meta?.length) return undefined;

  const uniqueKeys = new Set<string>();

  return meta.map((m) => {
    const metaKey = m.metaKey?.trim();
    const metaValue = String(m.metaValue ?? '').trim();

    if (!metaKey) {
      throw new Error('metaKey cannot be empty');
    }

    if (uniqueKeys.has(metaKey)) {
      throw new Error(`Duplicate metaKey found: ${metaKey}`);
    }
    uniqueKeys.add(metaKey);

    if (metaKey === 'assetSubType' && !metaValue) {
      throw new Error('assetSubType cannot be empty');
    }

    return {
      metaKey,
      metaValue,
      metaType: m.metaType,
    };
  });
};

export const mapAssetDocuments = (docs?: AssetDocumentDto[]) => {
  if (!docs?.length) return undefined;

  return docs.map((d) => ({
    documentType: d.documentType.trim(),
    documentName: d.documentName?.trim() || null,
    documentUrl: d.documentUrl.trim(),
  }));
};
