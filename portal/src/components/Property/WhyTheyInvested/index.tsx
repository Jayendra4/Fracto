interface InterestItem {
  icon: string;
  description: string;
  title: string;
}

interface WhyTheyInvestedProps {
  intrestData?: InterestItem[];
}

// Single entry goes full-width; 2, 3 and 4 keep the original layout.
const GRID_COLS_BY_COUNT: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2',
  4: 'grid-cols-1 sm:grid-cols-2',
};

export default function WhyTheyInvested({
  intrestData = [],
}: WhyTheyInvestedProps) {
  const count = Math.min(intrestData.length, 4);

  return (
    <>
      {intrestData.length > 0 && (
        <div className="font-work space-y-4 text-[#0B2545] dark:text-white">
          <div className="font-serif font-32 font-semibold ">
            Why they invested on this property{' '}
          </div>

          <div
            className={`grid gap-4 sm:gap-5 ${GRID_COLS_BY_COUNT[count] ?? GRID_COLS_BY_COUNT[4]}`}
          >
            {intrestData.slice(0, 4).map((item, index) => (
              <div
                key={index}
                className="space-y-3 bg-white dark:bg-[#132436] border border-[#E3E7EE] dark:border-white/10 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  className="w-12 h-12 md:w-16 md:h-16"
                  src={item.icon}
                  alt={item.title}
                />

                <h2 className="font-22 font-serif font-semibold">
                  {item.title}
                </h2>

                <p className="text-gray-500 dark:text-gray-400 font-14 font-light text-justify">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
