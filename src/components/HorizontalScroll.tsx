import { useRef, useEffect, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HorizontalScrollProps {
  children: ReactNode;
  isMobile: boolean;
}

export function HorizontalScroll({ children, isMobile }: HorizontalScrollProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMobile || !containerRef.current || !wrapperRef.current) return;

    const container = containerRef.current;
    const totalWidth = container.scrollWidth - window.innerWidth;

    const scrollTween = gsap.to(container, {
      x: -totalWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: 'top top',
        end: () => '+=' + totalWidth,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });

    // Animate cards as they come into view
    const sections = container.querySelectorAll('[data-year]');
    sections.forEach((section) => {
      const card = section.querySelector('.year-card-wrapper');
      if (card) {
        gsap.fromTo(
          card,
          { opacity: 0, y: 50, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            scrollTrigger: {
              trigger: section,
              containerAnimation: scrollTween,
              start: 'left 80%',
              end: 'left 30%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [isMobile]);

  // Mobile: use vertical scroll with intersection observer
  useEffect(() => {
    if (!isMobile || !containerRef.current) return;

    const sections = containerRef.current.querySelectorAll('[data-year]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const card = entry.target.querySelector('.year-card-wrapper') as HTMLElement;
            if (card) {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    sections.forEach((section) => {
      const card = section.querySelector('.year-card-wrapper') as HTMLElement;
      if (card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      }
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, [isMobile]);

  const mobileClasses = isMobile ? 'flex-col w-full' : 'w-fit';

  return (
    <div ref={wrapperRef} className={isMobile ? 'overflow-y-auto overflow-x-hidden' : 'overflow-hidden'}>
      <div
        ref={containerRef}
        className={'flex will-change-transform ' + mobileClasses}
      >
        {children}
      </div>
    </div>
  );
}
