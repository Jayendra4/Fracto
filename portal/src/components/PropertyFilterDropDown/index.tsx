import { useState, useEffect } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';

interface Filters {
  newlyAdded: boolean;
  subType?: string;
}

interface PropertyFilterDropdownProps {
  open: boolean;
  filters: Filters;
  onApply: (filters: Filters) => void;
  onClose: () => void;
}

const PROPERTY_TYPES = ['Industrial', 'Commercial', 'Retail', 'Residential'];

export default function PropertyFilterDropdown({
  open,
  filters,
  onApply,
}: PropertyFilterDropdownProps) {
  const [propertyTypeOpen, setPropertyTypeOpen] = useState(false);

  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  if (!open) return null;

  const toggleFilter = (key: keyof Omit<Filters, 'subType'>) => {
    const updatedFilters: Filters = {
      ...localFilters,
      [key]: !localFilters[key],
    };

    setLocalFilters(updatedFilters);
    onApply(updatedFilters);
  };

  const togglePropertyType = (type: string) => {
    const updatedFilters: Filters = {
      ...localFilters,
      subType: localFilters.subType === type ? undefined : type,
    };

    setLocalFilters(updatedFilters);
    onApply(updatedFilters);
  };

  const isTypeActive = (type: string) => localFilters.subType === type;

  return (
    <div className="absolute right-0 w-[240px] md:w-[280px] mt-4 bg-[var(--card)] border border-dark-grey/20 rounded-2xl p-4 md:p-5 shadow-2xl z-30 font-work">
      <ul className="space-y-2 text-sm text-[var(--fg)]">
        <li
          onClick={() => toggleFilter('newlyAdded')}
          className="cursor-pointer flex gap-3 items-center font-16 p-2 rounded-lg hover:bg-dark-grey/10 transition-colors"
        >
          {localFilters.newlyAdded ? (
            <FiMinus size={16} />
          ) : (
            <FiPlus size={16} />
          )}
          Newly added
        </li>

        <li>
          <button
            onClick={() => setPropertyTypeOpen((prev) => !prev)}
            className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-dark-grey/10 transition-colors mb-2"
          >
            <span className="flex gap-3 items-center font-16 whitespace-nowrap">
              {propertyTypeOpen ? <FiMinus size={16} /> : <FiPlus size={16} />}
              Property type
            </span>
            <span
              className={`transition-transform duration-300 ${propertyTypeOpen ? 'rotate-180' : ''
                }`}
            >
              <IoIosArrowDown className="w-4 h-4" />
            </span>
          </button>

          {propertyTypeOpen && (
            <ul className="mt-4 ml-4 space-y-2 text-[var(--fg)] ">
              {PROPERTY_TYPES.map((type) => (
                <li
                  key={type}
                  onClick={() => togglePropertyType(type)}
                  className="cursor-pointer flex gap-2 items-center font-15 p-2 rounded-lg hover:bg-dark-grey/10 transition-colors opacity-90 hover:opacity-100"
                >
                  {isTypeActive(type) ? (
                    <FiMinus size={12} />
                  ) : (
                    <FiPlus size={12} />
                  )}
                  {type}
                </li>
              ))}
            </ul>
          )}
        </li>
      </ul>
      <div className="mt-5 pt-4 border-t border-dark-grey/10">
        <button
          className="w-full text-dark-grey hover:text-[var(--fg)] hover:bg-dark-grey/10 font-15 transition-all p-2 rounded-lg text-center"
          onClick={() => {
            const cleared: Filters = {
              newlyAdded: false,
              subType: undefined,
            };

            setLocalFilters(cleared);
            onApply(cleared);
          }}
        >
          Clear filter
        </button>
      </div>
    </div>
  );
}
