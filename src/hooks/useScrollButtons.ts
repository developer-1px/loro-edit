import { useState, useEffect, useCallback, type RefObject } from 'react';
import { useEvent } from 'react-use';

interface UseScrollButtonsOptions {
  threshold?: number;
}

export const useScrollButtons = (
  scrollRef: RefObject<HTMLElement>,
  options: UseScrollButtonsOptions = {}
) => {
  const { threshold = 1 } = options;
  
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > threshold);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - threshold);
  }, [scrollRef, threshold]);

  const scrollLeft = useCallback(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  }, [scrollRef]);

  const scrollRight = useCallback(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  }, [scrollRef]);

  const scrollToStart = useCallback(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
  }, [scrollRef]);

  const scrollToEnd = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollWidth, clientWidth } = scrollRef.current;
    scrollRef.current.scrollTo({ left: scrollWidth - clientWidth, behavior: 'smooth' });
  }, [scrollRef]);

  // Use react-use's useEvent for better performance
  useEvent('scroll', checkScrollButtons, scrollRef.current, { passive: true });

  // Initial check and resize handling
  useEffect(() => {
    checkScrollButtons();
  }, [checkScrollButtons]);

  useEvent('resize', checkScrollButtons);

  return {
    canScrollLeft,
    canScrollRight,
    scrollLeft,
    scrollRight,
    scrollToStart,
    scrollToEnd,
    checkScrollButtons,
  };
};