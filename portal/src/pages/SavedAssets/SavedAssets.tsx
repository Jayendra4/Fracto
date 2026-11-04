/* eslint-disable @typescript-eslint/no-explicit-any -- legacy loosely-typed asset handling, matches the pattern in rwa.api.ts */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiHeart } from 'react-icons/fi';
import { useMyFavourites } from '@/api/favourites.api';
import SavedCard from '@/components/Dashboard/Assets/MyAssets/savedCards';

function getMetaNumber(meta: any[], key: string) {
  const m = meta?.find((m: any) => m.metaKey === key)?.metaValue;
  return m ? parseFloat(m) : 0;
}

function getMetaString(meta: any[], key: string) {
  return meta?.find((m: any) => m.metaKey === key)?.metaValue || '';
}

export default function SavedAssets() {
  const { data: favouritesRes } = useMyFavourites();

  const savedAssets = useMemo(() => {
    const resData =
      favouritesRes?.success === true ? favouritesRes.data : undefined;

    const data = Array.isArray(resData?.data)
      ? resData.data
      : Array.isArray(resData)
        ? resData
        : [];

    return data.map((item: any) => {
      const asset = item.asset || item;
      const meta = item.meta || asset?.meta || [];
      const financials = item.financials || asset?.financials || {};
      const priceData = item.price || asset?.price || {};

      return {
        id: asset.id,
        title: asset.assetTitle || asset.title || 'Unknown Asset',
        type: asset.assetSubType || asset.assetType || asset.type || 'Property',
        verified: asset.isVerified || asset.verified,
        location: getMetaString(meta, 'city') || asset.location || 'Overseas',
        investment: asset.investment || 0,
        ownership: asset.ownership || 0,
        yield: Number(
          financials?.yield?.actualYieldPercent ||
            asset.yieldPercentage ||
            getMetaNumber(meta, 'expectedYieldPercentage') ||
            0
        ),
        value:
          getMetaNumber(meta, 'marketValue') ||
          Number(
            priceData?.currentPricePerFraction ||
              financials?.perFraction?.price ||
              0
          ),
        growth: Number(
          financials?.roi?.fiveYearROI ||
            asset.assetAppreciation ||
            getMetaNumber(meta, 'expectedAppreciationPercentage') ||
            0
        ),
        image:
          asset.documents?.find((d: any) => d.documentType === 'ASSET_IMAGE')
            ?.documentUrl ||
          asset.documents?.[0]?.documentUrl ||
          asset.image,
        priceFraction: Number(
          priceData?.currentPricePerFraction ||
            financials?.perFraction?.price ||
            0
        ),
        roi: Number(
          financials?.roi?.fiveYearROI || getMetaNumber(meta, 'roi') || 0
        ),
        savedyield: Number(
          financials?.yield?.actualYieldPercent ||
            asset.yieldPercentage ||
            getMetaNumber(meta, 'expectedYieldPercentage') ||
            0
        ),
        isSoldOut: asset.status === 'Funded' || asset.isSoldOut,
      };
    });
  }, [favouritesRes]);

  return (
    <section className="w-full text-[#0B2545] dark:text-white min-h-screen pt-34 xl:pt-40 pb-20 font-work">
      <div className="max-w-[1600px] mx-auto px-4 md:px-10">
        <div className="pagehead mb-6">
          <h1 className="font-serif font-24 md:font-30 font-semibold text-[#0B2545] dark:text-white">
            Saved Assets ({savedAssets.length})
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-14 mt-1">
            Properties you&apos;ve bookmarked to revisit later.
          </p>
        </div>

        {savedAssets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex flex-col items-center bg-white dark:bg-[#132436]  justify-center text-center p-8 md:p-16 rounded-xl   border border-[#E3E7EE] dark:border-white/10 shadow-sm mb-6 `}
          >
            <div className="w-16 h-16 mb-4 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-gray-400 dark:text-gray-500">
              <FiHeart size={32} />
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-[#0B2545] dark:text-white mb-2">
              No Saved Assets
            </h3>

            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6 font-medium">
              You haven't saved any assets yet. Bookmark a property to find it
              here.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {savedAssets.map((asset: any) => (
              <SavedCard key={asset.id} asset={asset} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
