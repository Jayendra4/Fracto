import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { motion } from 'framer-motion';
import { HiArrowLongRight } from 'react-icons/hi2';

export function RoleCard({
  title,
  description,
  url,
  delay = 0,
}: {
  title: string;
  description: string;
  url: string;
  delay?: number;
}) {
  const { isAuthenticated } = useSelector(
    (state: RootState) => state.authLogin
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: delay }}
      className="group relative h-full"
    >
      <div className="h-full bg-white rounded-[1.5rem] p-6 lg:p-8 flex flex-col border border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgba(79, 70, 229,0.15)] transition-all duration-500 hover:-translate-y-1.5 overflow-hidden">
        <div className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-[#4F46E5]/5 flex items-center justify-center group-hover:bg-[#4F46E5]/10 transition-colors">
          <div className="w-2 h-2 rounded-full bg-[#4F46E5] animate-pulse" />
        </div>

        <div className="flex-1">
          <h3 className="text-xl lg:text-xl font-bold text-[#0A192F] mb-3 text-left group-hover:text-[#4F46E5] transition-colors leading-tight drop-shadow-sm">
            {title}
          </h3>

          <p className="text-sm lg:text-sm text-[#0A192F]/70 leading-relaxed text-left font-semibold max-w-[280px]">
            {description}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {!isAuthenticated ? (
            <Link
              to={{
                pathname: '/login',
                search: `?step=1&role=${
                  title.toLowerCase().includes('partner')
                    ? 'broker'
                    : title.toLowerCase().includes('asset')
                      ? 'asset-owner'
                      : 'investor'
                }`,
              }}
              className="px-5 py-2 bg-[#0A192F] text-white rounded-lg font-bold text-sm hover:bg-[#4F46E5] transition-all active:scale-95 shadow-xl shadow-black/10 text-center whitespace-nowrap"
            >
              Sign In
            </Link>
          ) : null}

          <Link
            to={url}
            className="inline-flex items-center justify-center gap-2 text-[#4F46E5] font-bold text-sm border-2 border-[#4F46E5]/20 bg-[#4F46E5]/5 px-5 py-2 rounded-lg hover:bg-[#4F46E5] hover:text-white hover:border-[#4F46E5] transition-all group/link whitespace-nowrap"
          >
            Know More
            <HiArrowLongRight
              className="transition-transform group-hover/link:translate-x-1"
              size={18}
            />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
