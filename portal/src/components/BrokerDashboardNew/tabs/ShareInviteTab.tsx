import { useState } from 'react';
import { FiCopy, FiSearch } from 'react-icons/fi';

export default function ShareInviteTab() {
  const [subTab, setSubTab] = useState<'asset' | 'club'>('asset');
  const [searchQuery, setSearchQuery] = useState('');
  const [generatedAssetLink, setGeneratedAssetLink] = useState('');
  const [generatedClubLink, setGeneratedClubLink] = useState('');

  const generateAssetLink = (assetName: string) => {
    const code = assetName.split(' ')[0].toUpperCase();
    const url = `https://houseoffrac.example/m/RK-${code}-2026`;
    setGeneratedAssetLink(url);
  };

  const generateClubLink = (clubName: string) => {
    const code = clubName.split(' ')[0].toUpperCase();
    const url = `https://houseoffrac.example/c/RK-${code}-2026`;
    setGeneratedClubLink(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-serif font-semibold text-[#0B2545] dark:text-white">
          Share / Invite
        </h1>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Promote an approved asset listing, or invite a contact to a Primary
          Club.
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-gray-100 dark:border-white/5 pb-0 mb-6 gap-6">
        <button
          className={`${
            subTab === 'asset'
              ? 'border-b-2 border-[#1F4FE0] text-[#1F4FE0] dark:text-[#60a5fa] font-bold'
              : 'text-gray-550 hover:text-gray-800 dark:text-gray-400'
          } pb-2 text-xs md:text-sm cursor-pointer`}
          onClick={() => setSubTab('asset')}
        >
          Share an Asset
        </button>
        <button
          className={`${
            subTab === 'club'
              ? 'border-b-2 border-[#1F4FE0] text-[#1F4FE0] dark:text-[#60a5fa] font-bold'
              : 'text-gray-550 hover:text-gray-800 dark:text-gray-400'
          } pb-2 text-xs md:text-sm cursor-pointer`}
          onClick={() => setSubTab('club')}
        >
          Invite to Club
        </button>
      </div>

      {/* SHARE AN ASSET */}
      {subTab === 'asset' && (
        <div className="space-y-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <FiSearch />
            </span>
            <input
              type="text"
              placeholder="Search shareable assets…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs md:text-sm font-normal text-gray-850 dark:text-white focus:outline-none focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0]"
            />
          </div>

          <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-xs md:text-sm text-[#0B2545] dark:text-white flex items-center gap-2">
                  Marina Bay Residency, Dubai
                  <span className="bg-blue-50 dark:bg-blue-900/20 text-[#1F4FE0] dark:text-[#60a5fa] border border-[#1F4FE0]/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Funding Open
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                  Residential · 68% subscribed · Member Preview level only will
                  be shown to your contacts
                </div>
              </div>
              <button
                className="flex items-center gap-2 bg-[#1F4FE0] hover:bg-[#153eb2] text-white text-xs md:text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition cursor-pointer"
                onClick={() => generateAssetLink('Marina Bay Residency')}
              >
                Generate Share Link
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-xs md:text-sm text-[#0B2545] dark:text-white flex items-center gap-2">
                  Sora Heights, Jaipur
                  <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Fully Funded
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                  Residential · Managed · Available for reference/testimonial
                  sharing only, not for new investment
                </div>
              </div>
              <button
                className="flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 text-xs md:text-sm font-semibold px-4 py-2.5 rounded-lg transition cursor-pointer"
                onClick={() => generateAssetLink('Sora Heights')}
              >
                Generate Share Link
              </button>
            </div>
          </div>

          {generatedAssetLink && (
            <div className="bg-white dark:bg-[#132436] p-6 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-4">
              <h3 className="font-serif text-lg font-semibold text-[#0B2545] dark:text-white border-b border-gray-100 dark:border-white/5 pb-2">
                Your Shareable Link
              </h3>
              <div className="flex items-center justify-between gap-4 bg-gray-55 dark:bg-white/5 p-3 rounded-lg border border-gray-200 dark:border-white/10 overflow-x-auto">
                <span className="text-xs md:text-sm font-mono text-gray-700 dark:text-gray-300 break-all select-all">
                  {generatedAssetLink}
                </span>
                <button
                  className="flex items-center gap-1.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-55 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 text-xs md:text-sm font-semibold px-3 py-1.5 rounded-md transition cursor-pointer shrink-0"
                  onClick={() => copyToClipboard(generatedAssetLink)}
                >
                  <FiCopy /> Copy
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Anyone who clicks this link sees only Member Preview level
                information and must complete their own KYC to go further.
                Conversions through this link are automatically attributed to
                you.
              </p>
            </div>
          )}
        </div>
      )}

      {/* INVITE TO CLUB */}
      {subTab === 'club' && (
        <div className="space-y-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <FiSearch />
            </span>
            <input
              type="text"
              placeholder="Search clubs…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs md:text-sm font-normal text-gray-850 dark:text-white focus:outline-none focus:border-[#1F4FE0] focus:ring-1 focus:ring-[#1F4FE0]"
            />
          </div>

          <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-xs md:text-sm text-[#0B2545] dark:text-white flex items-center gap-2">
                  Rajasthan Commercial
                  <span className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    1 asset under review
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                  89 members · Primary Club · Membership requires completed KYC
                </div>
              </div>
              <button
                className="flex items-center gap-2 bg-[#1F4FE0] hover:bg-[#153eb2] text-white text-xs md:text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition cursor-pointer"
                onClick={() => generateClubLink('Rajasthan Commercial')}
              >
                Generate Club Invite Link
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#132436] p-5 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-xs md:text-sm text-[#0B2545] dark:text-white flex items-center gap-2">
                  Dubai Residential
                  <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    142 members
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                  Primary Club · Membership requires completed KYC
                </div>
              </div>
              <button
                className="flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 text-xs md:text-sm font-semibold px-4 py-2.5 rounded-lg transition cursor-pointer"
                onClick={() => generateClubLink('Dubai Residential')}
              >
                Generate Club Invite Link
              </button>
            </div>
          </div>

          {generatedClubLink && (
            <div className="bg-white dark:bg-[#132436] p-6 rounded-xl border border-[#E3E7EE] dark:border-white/10 shadow-sm space-y-4">
              <h3 className="font-serif text-lg font-semibold text-[#0B2545] dark:text-white border-b border-gray-100 dark:border-white/5 pb-2">
                Your Club Invite Link
              </h3>
              <div className="flex items-center justify-between gap-4 bg-gray-55 dark:bg-white/5 p-3 rounded-lg border border-gray-200 dark:border-white/10 overflow-x-auto">
                <span className="text-xs md:text-sm font-mono text-gray-700 dark:text-gray-300 break-all select-all">
                  {generatedClubLink}
                </span>
                <button
                  className="flex items-center gap-1.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-55 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 text-xs md:text-sm font-semibold px-3 py-1.5 rounded-md transition cursor-pointer shrink-0"
                  onClick={() => copyToClipboard(generatedClubLink)}
                >
                  <FiCopy /> Copy
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Your contact lands on the club's discovery page. They must
                complete KYC before requesting membership, and Admin approves
                the membership — you are credited as the referring partner once
                they join.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
