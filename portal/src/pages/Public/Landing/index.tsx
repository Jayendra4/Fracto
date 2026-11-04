import { useEffect, type JSX, lazy, Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Loader from '@/components/Loader';
import PropertyCardSkeleton from '@/components/Skeleton/PropertyCardSkeleton';
import BlogCardSkeleton from '@/components/Skeleton/BlogCardSkeleton';
import Hero from '@/components/Landing/HeroSection/Hero';
import BottomCard from '@/components/Landing/HeroSection/BottomCards';

const WhatWeDo = lazy(() => import('@/components/Landing/WhatWeDo'));
const TrustSecurity = lazy(() => import('@/components/Landing/TrustSecurity'));
// const Property = lazy(() => import('@/components/Landing/Property'));
import TestimonialsSection from '@/components/Landing/TestimonialsSection';
const Strengthening = lazy(() => import('@/components/Landing/Strengthening'));
const Blogs = lazy(() => import('@/components/Landing/Blogs'));
const FAQSection = lazy(() => import('@/components/Landing/FAQ'));
const CTA = lazy(() => import('@/components/Landing/CTA'));
const CommunityOfHouse = lazy(() => import('@/components/CommunityOfHouse'));

export default function Landing(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const targetId = location.state?.scrollTo;
    if (targetId) {
      const scroll = () => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          navigate('.', { replace: true, state: null });
          return true;
        }
        return false;
      };

      if (!scroll()) {
        const timer1 = setTimeout(() => {
          if (!scroll()) {
            const timer2 = setTimeout(() => {
              scroll();
            }, 300);
            return () => clearTimeout(timer2);
          }
        }, 100);
        return () => clearTimeout(timer1);
      }
    }
  }, [location.state, navigate]);

  return (
    <section>
      <Hero />
      <BottomCard />
      <Suspense fallback={<Loader isFullPage={false} />}>
        <CommunityOfHouse />
        <WhatWeDo />
        <TrustSecurity />
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-10 bg-[#111113]">
              {[...Array(4)].map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          {/* <Property /> */}
        </Suspense>
        <TestimonialsSection />
        <Strengthening />
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-10 bg-[var(--bg)]">
              {[...Array(4)].map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <Blogs />
        </Suspense>
        <FAQSection />
        <CTA />
      </Suspense>
    </section>
  );
}
