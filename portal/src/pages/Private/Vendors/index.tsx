import { useState } from 'react';
import { useVendorsList } from '@/api/vendors.api';
import SuggestionModal from '@/components/Vendors/SuggestionModal';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import Loader from '@/components/Loader';

interface Vendor {
  id: number;
  name: string;
  category: string;
  description: string;
  website: string;
  email: string;
  mobile: string;
}

export default function Vendors() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const TAKE = 10;

  const { data: response, isLoading } = useVendorsList();
  const vendors: Vendor[] = response?.success
    ? Array.isArray(response.data?.data)
      ? response.data.data
      : Array.isArray(response.data)
        ? response.data
        : []
    : [];

  const total = vendors.length;
  const currentVendors = vendors.slice(page * TAKE, (page + 1) * TAKE);

  return (
    <section className="font-work relative pb-9 min-h-screen px-4 lg:px-10 bg-[var(--bg)]">
      <div className="max-w-[1600px] mx-auto pt-45 space-y-8">
        <header className="flex sm:flex-row flex-col items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-[var(--fg)]/5 transition text-[var(--fg)]"
            >
              <MdArrowBack size={28} />
            </button>
            <div>
              <h2 className="font-medium font-30 text-[var(--fg)]">
                Vendors List
              </h2>
              <p className="text-gray-500 font-medium font-16">
                Find help and legal services for your asset onboarding.
              </p>
            </div>
          </div>
          <div className="w-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-[#4F46E5] to-[#2563EB] shadow-md hover:shadow-lg hover:brightness-110 text-white px-6 py-2 rounded-lg font-medium text-sm transition-all duration-300 whitespace-nowrap"
            >
              Add a Suggestion
            </button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader />
          </div>
        ) : vendors.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-sm rounded-2xl">
            <div className="text-[var(--fg)]/60 text-lg font-medium">
              No vendors found
            </div>
            <div className="mt-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-[#4F46E5] to-[#2563EB] shadow-md hover:shadow-lg hover:brightness-110 text-white px-6 py-2 rounded-lg font-medium text-sm transition-all duration-300"
              >
                Add a Suggestion
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-sm rounded-2xl p-6">
            <div className="overflow-x-auto">
              <table className="w-full font-16">
                <thead className="text-[var(--fg)]/70 border-b border-[var(--fg)]/10 text-left">
                  <tr>
                    <th className="px-6 py-5">Name</th>
                    <th className="px-6 py-5">Category</th>
                    <th className="px-6 py-5">Description</th>
                    <th className="px-6 py-5">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--fg)]/5">
                  {currentVendors.map((vendor) => (
                    <tr
                      key={vendor.id}
                      className="text-[var(--fg)] hover:bg-[var(--fg)]/5 transition-colors"
                    >
                      <td className="px-6 py-5 font-medium">
                        <div>{vendor.name}</div>
                        {vendor.website && (
                          <a
                            href={vendor.website}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-xs text-blue-400 hover:underline mt-1"
                          >
                            {vendor.website}
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-5">{vendor.category}</td>
                      <td
                        className="px-6 py-5 max-w-xs truncate"
                        title={vendor.description}
                      >
                        {vendor.description ?? '-'}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1 text-sm">
                          {vendor.email && <span>{vendor.email}</span>}
                          {vendor.mobile && <span>{vendor.mobile}</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-[var(--fg)]">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="disabled:opacity-40 hover:text-[var(--primary)] transition"
              >
                ‹ Previous
              </button>

              <span>
                Page {page + 1} of {Math.ceil(total / TAKE) || 1}
              </span>

              <button
                disabled={(page + 1) * TAKE >= total}
                onClick={() => setPage((p) => p + 1)}
                className="disabled:opacity-40 hover:text-[var(--primary)] transition"
              >
                Next ›
              </button>
            </div>
          </div>
        )}

        {isModalOpen && (
          <SuggestionModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </div>
    </section>
  );
}
