import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/redux/store';
import { setStepperOpen, setStepperHeight } from '@/redux/slices/uiSlice';

export function useCollapsibleHeader() {
  const dispatch = useDispatch();
  const ref = useRef<HTMLDivElement | null>(null);

  const isOpen = useSelector((state: RootState) => state.ui.isStepperOpen);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(([entry]) => {
      dispatch(setStepperHeight(entry.contentRect.height));
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [dispatch]);

  useEffect(() => {
    const onScroll = () => {
      // const y = window.scrollY;

      // if (y === 0) {
      //   dispatch(setStepperOpen(true));
      //   return;
      // }
      if (isOpen) {
        dispatch(setStepperOpen(false));
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [dispatch, isOpen]);
  const toggle = () => {
    dispatch(setStepperOpen(!isOpen));
  };

  return {
    ref,
    isOpen,
    toggle,
  };
}
