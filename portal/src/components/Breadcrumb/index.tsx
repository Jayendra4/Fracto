// import { HiArrowLongLeft } from 'react-icons/hi2';
// import { IoIosArrowForward } from 'react-icons/io';
// import { useNavigate } from 'react-router-dom';

interface BreadcrumProps {
  title?: string;
}

export const Breadcrumb = ({ title }: BreadcrumProps) => {
  // const navigate = useNavigate();

  // const handleback = () => {
  //   navigate('/properties');
  // };

  return (
    <div className="max-w-[1600px] ">
      <div className="col-span-3 ">
        <nav className="font-24 text-[#0B2545] dark:text-white">
          {/* <div className=" flex justify-start items-start top-6 z-50">
            <button
              onClick={handleback}
              className="flex items-center gap-2 font-new-20 pr-3 py-2 bg-transparent border border-transparent rounded-md text-[#F5F5F5] cursor-pointer"
            >
              <HiArrowLongLeft size={24} />
              <span className="font-20">Back</span>
            </button>
          </div> */}

          <div className="flex items-center gap-2 ">
            {/* <button
              className="hover:text-[var(--fg)]  cursor-pointer font-20 whitespace-nowrap"
              onClick={handleback}
            >
              Property page
            </button> */}

            {/* <span className="text-[var(--fg)] ">
              <IoIosArrowForward />
            </span> */}

            <span className="text-[#0B2545] dark:text-white font-regular font-18 line-clamp-1">
              {title || ''}
            </span>
          </div>
        </nav>
      </div>
    </div>
  );
};
