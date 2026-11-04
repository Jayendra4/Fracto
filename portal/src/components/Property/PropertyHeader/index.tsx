import { FiMapPin } from 'react-icons/fi';

interface AssetMeta {
  metaKey: string;
  metaValue: string;
}

interface Asset {
  assetTitle?: string;
  meta?: AssetMeta[];
  newStatus?: string;
  status?: string;
  isSoldOut?: boolean;
  spvCreated?: boolean;
  rwaRequest?: {
    fractionalizationStatus?: string;
  };
}

interface PropertyHeaderProps {
  asset?: Asset;
}

export default function PropertyHeader({ asset }: PropertyHeaderProps) {
  const getMeta = (key: string) =>
    asset?.meta?.find((m) => m.metaKey === key)?.metaValue ?? '';

  const city = getMeta('city');
  const state = getMeta('state');
  const builtupArea = getMeta('builtupArea');
  const yearOfConstruction = getMeta('yearOfConstruction');
  const landArea = getMeta('landArea');
  const mapUrl = getMeta('mapUrl');

  return (
    <>
      <div className="lg:w-full text-[#0B2545] dark:text-white font-work space-y-2">
        <div className="flex space-y-6 flex-col ">
          <div className="flex flex-wrap gap-3">
            {asset?.newStatus == 'Reviewed' && (
              <span className="rounded-full border border-green lg:px-3 px-2 py-1 lg:text-[16px] text-[12px] bg-green/16 text-green">
                Verified by Trustee
              </span>
            )}
            {asset?.status == 'Available' &&
              asset?.spvCreated &&
              asset?.rwaRequest?.fractionalizationStatus == 'Completed' && (
                <span className="rounded-full border border-yellow lg:px-3 px-2 py-1 lg:text-[16px] text-[12px] bg-yellow/16 text-yellow">
                  Open for Investment
                </span>
              )}

            {asset?.isSoldOut && (
              <span className="rounded-full border border-red lg:px-3 px-2 py-1 lg:text-[16px] text-[12px] bg-red/16 text-red">
                Funded
              </span>
            )}
            {/* <span className="rounded-full border border-red lg:px-3 px-2 py-1 lg:text-[16px] text-[12px] bg-red/16 text-red">
              Fully tokenized
            </span> */}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-14 font-medium text-gray-500 dark:text-gray-400">
              {city && state ? `${city}, ${state}` : 'HOF'}
            </h2>
            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#E3E7EE] dark:border-white/10 text-[#1F4FE0] hover:bg-[#1F4FE0]/10 font-12 font-semibold transition"
              >
                <FiMapPin size={13} />
                Google Location
              </a>
            )}
          </div>
        </div>

        <h1 className="font-serif font-30 md:font-48 font-semibold tracking-tight leading-tight w-full line-clamp-2">
          {asset?.assetTitle ?? ''}
        </h1>

        <div className="flex flex-wrap gap-2 font-14 text-gray-500 dark:text-gray-400">
          {yearOfConstruction && <span>Built {yearOfConstruction}</span>}
          {builtupArea && (
            <>
              <span>•</span>
              <span>Builtup Area: {builtupArea} Sq.Meter</span>
            </>
          )}

          {landArea && (
            <>
              <span>•</span>
              <span>Land Area: {landArea} Sq.Meter</span>
            </>
          )}
        </div>

        <div className="space-y-4 md:block hidden mt-12">
          <h2 className="font-serif font-medium font-32 ">
            Property Description
          </h2>
        </div>
      </div>
    </>
  );
}
