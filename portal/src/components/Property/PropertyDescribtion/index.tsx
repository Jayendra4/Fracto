import { useState } from 'react';

interface MetaItem {
  metaKey: string;
  metaValue: string;
}

interface PropertyDescribtionProps {
  meta?: MetaItem[];
}

export default function PropertyDescribtion({
  meta = [],
}: PropertyDescribtionProps) {
  const [showMore, setShowMore] = useState(false);

  const getMeta = (key: string) =>
    meta.find((m) => m.metaKey === key)?.metaValue ?? '';

  const shortDescription = getMeta('shortDescription');
  const detailedDescription = getMeta('detailedDescription');

  return (
    <div className="font-work mx-auto space-y-4 text-[#0B2545] dark:text-white">
      <div className="md:hidden space-y-4">
        <h2 className="font-serif font-medium font-32">Property Description</h2>
      </div>

      <p className="font-16 font-light text-justify overflow-hidden opacity-90">
        {shortDescription}
      </p>

      <div
        className={`grid transition-all duration-500 ease-in-out ${showMore ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <p className="font-16 font-light text-justify pt-2 opacity-90">
            {detailedDescription}
          </p>
        </div>
      </div>

      {detailedDescription && (
        <button
          onClick={() => setShowMore(!showMore)}
          className="text-yellow hover:text-yellow/80 font-16 font-medium underline flex items-center transition-colors mt-2"
        >
          {showMore ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );
}
