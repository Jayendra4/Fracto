import { useState, useRef, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import {
  FiShare2,
  FiCopy,
  FiCheck,
  FiCheckCircle,
  FiClock,
} from 'react-icons/fi';
import { HiLocationMarker } from 'react-icons/hi';
import { useLocalUser } from '@/hooks/useLocalUser';
import { useOnboarding } from '@/hooks';
import type { Property } from '.';
import { Link, useNavigate } from 'react-router-dom';

export function PropertyCard({ property }: { property: Property }) {
  const { isApproved, isSubmitted, isUnderReview, isRejected, isDraft } =
    useOnboarding();
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();

  const user = useLocalUser();

  const referralCode = user?.referralCode;

  const isUserKycCompleted = isApproved;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
        setCopied(false);
      }
    };

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isReady = property.status === 'ready';

  const shareUrl = `${window.location.origin}/property-details/${property.id}`;

  const signupUrl = `${window.location.origin}/signup?referral=${referralCode}`;

  const whatsAppShareUrl = (
    imageUrl: string,
    title: string,
    url: string,
    price: string,
    availability: string,
    returns: string,
    description: string,
    location: string
  ) => {
    const message = `Check out this property: ${title}\n\n${imageUrl}\n\nPrice: ${price}\nAvailability: ${availability}\nExpected Returns: ${returns}\nLocation: ${location}\n\n${description}\n\n${url}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  return (
    <div
      className="
        relative h-full rounded-2xl overflow-hidden
        border border-[var(--fg)]/5
        bg-[var(--inner-card)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group
      "
    >
      <div className="relative h-[260px] px-4 pt-4">
        <div className="h-full w-full overflow-hidden rounded-xl">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div
          className={`absolute top-7 right-7 flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium 
            ${isReady ? 'bg-green-600 text-[var(--fg)]' : 'bg-orange-500 text-[var(--fg)]'}`}
        >
          {isReady ? <FiCheckCircle size={14} /> : <FiClock size={14} />}
          <span>{isReady ? 'Ready to Sell' : 'Docs Pending'}</span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2 group">
            <h3 className="font-20 font-semibold text-[var(--fg)] leading-snug line-clamp-1">
              {property.title}
            </h3>

            <div ref={shareRef} className="relative">
              <div className="relative group">
                <button
                  onClick={() => {
                    if (!isUserKycCompleted) return;
                    setShareOpen((p) => !p);
                  }}
                  className={`
                  flex items-center gap-1.5 px-2 py-1 rounded-md transition
                  ${
                    isUserKycCompleted
                      ? 'hover:bg-[var(--fg)]/10 cursor-pointer'
                      : 'opacity-40 cursor-not-allowed'
                  }
                `}
                >
                  <FiShare2 size={16} />
                </button>

                {!isUserKycCompleted && (
                  <div
                    className="
                    absolute right-0 -top-9 z-20
                    whitespace-nowrap px-3 py-1.5 rounded-md
                    bg-black text-yellow text-xs
                    opacity-0 group-hover:opacity-100
                    transition border border-white/10
                  "
                  >
                    {isSubmitted && 'KYC submitted – awaiting approval'}
                    {isUnderReview && 'KYC under review'}
                    {isRejected && 'KYC rejected – resubmission required'}
                    {isDraft && 'Complete KYC to share properties'}
                  </div>
                )}
              </div>

              {!isApproved && (isRejected || isDraft) && (
                <button
                  onClick={() => navigate('/dashboard/kyc')}
                  className="
                  absolute right-0 -top-16
                  px-3 py-1 rounded-md text-xs
                  bg-gradient-to-r from-[#4F86C0] to-[#2A5A8D]
                  text-white hover:opacity-90 transition
                "
                >
                  Go to KYC
                </button>
              )}

              {shareOpen && (
                <>
                  <div
                    className="
                    hidden sm:block
                    absolute right-0 top-9 z-30
                    w-44 rounded-md
                    bg-[var(--inner-card)]
                    border border-[var(--fg)]/10
                    shadow-xl text-sm
                    overflow-hidden
                  "
                  >
                    <button
                      onClick={() => {
                        window.open(
                          whatsAppShareUrl(
                            property.image,
                            property.title,
                            signupUrl,
                            property.price,
                            property.availability,
                            property.returns,
                            property.description,
                            property.location
                          ),
                          '_blank'
                        );
                        setShareOpen(false);
                      }}
                      className="w-full px-3 py-2 flex items-center gap-2 hover:bg-[var(--fg)]/5"
                    >
                      <FaWhatsapp className="text-green-500" />
                      WhatsApp
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                      className="w-full px-3 py-2 flex items-center gap-2 hover:bg-[var(--fg)]/5"
                    >
                      {copied ? <FiCheck /> : <FiCopy />}
                      {copied ? 'Copied!' : 'Copy link'}
                    </button>
                  </div>

                  <div className="sm:hidden fixed inset-0 z-40">
                    <div
                      className="absolute inset-0 bg-black/60"
                      onClick={() => setShareOpen(false)}
                    />

                    <div
                      className="
                      absolute bottom-0 left-0 right-0
                      rounded-t-xl
                      bg-[var(--inner-card)]
                      border-t border-[var(--fg)]/10
                      p-4 space-y-3
                    "
                    >
                      <button
                        onClick={() => {
                          window.open(
                            whatsAppShareUrl(
                              property.image,
                              property.title,
                              signupUrl,
                              property.price,
                              property.availability,
                              property.returns,
                              property.description,
                              property.location
                            ),
                            '_blank'
                          );
                          setShareOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-md hover:bg-[var(--fg)]/5"
                      >
                        <FaWhatsapp className="text-green-500 text-xl" />
                        Share on WhatsApp
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(shareUrl);
                          setCopied(true);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-md hover:bg-[var(--fg)]/5"
                      >
                        {copied ? <FiCheck /> : <FiCopy />}
                        {copied ? 'Link copied' : 'Copy link'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 mt-1 font-14 text-[var(--fg)]/60">
            <HiLocationMarker size={18} className="text-[var(--fg)]/40" />
            {property.location}
          </div>
        </div>

        <div className="space-y-3 font-16">
          <InfoRow label="Availability" value={property.availability} />
          <InfoRow label="Price per fraction" value={property.price} />
          <InfoRow
            label="Expected returns"
            value={property.returns}
            highlight
          />
        </div>
        <Link
          to={`/property-details/${property.id}`}
          className="block w-full mt-2"
        >
          <button
            className="
              relative overflow-hidden w-full font-semibold font-16
              px-6 py-2.5 rounded-xl text-white shadow-md cursor-pointer
              transition-all duration-300 ease-in-out hover:shadow-[0_4px_14px_0_rgba(96,165,250,0.39)] bg-gradient-to-r from-[#4F46E5] to-[#2563EB]
            "
          >
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--fg)]/60">{label}</span>
      <span
        className={`font-medium font-16 ${highlight ? 'text-green-400 text-xs flex flex-row whitespace-nowrap gap-1' : 'text-[var(--fg)]'}`}
      >
        {highlight && (
          <img
            src="/images/dashboard/stats.svg"
            alt="stats"
            className="w-5 h-auto"
          />
        )}
        {value}
      </span>
    </div>
  );
}
