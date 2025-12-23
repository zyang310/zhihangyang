import { useState, useEffect, useCallback, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { Landing } from './components/Landing';
import { HorizontalScroll } from './components/HorizontalScroll';
import { YearSection } from './components/YearSection';
import { YearCard } from './components/YearCard';
import { YearNav } from './components/YearNav';
import { EndSection } from './components/EndSection';
import { ENRICHED_TIMELINE } from './data/zodiacData';

gsap.registerPlugin(ScrollToPlugin);

function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const landingRef = useRef<HTMLDivElement>(null);

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle scroll progress updates
  const handleProgressUpdate = useCallback((progress: number) => {
    const totalSections = ENRICHED_TIMELINE.length + 1; // +1 for end section
    const newIndex = Math.min(
      Math.floor(progress * totalSections),
      totalSections - 1
    );
    setActiveIndex(newIndex);
  }, []);

  // Handle landing scroll click
  const handleScrollClick = useCallback(() => {
    if (isMobile) {
      document.querySelector('.horizontal-scroll-wrapper')?.scrollIntoView({
        behavior: 'smooth',
      });
    } else {
      const landingHeight = landingRef.current?.offsetHeight || window.innerHeight;
      window.scrollTo({
        top: landingHeight,
        behavior: 'smooth',
      });
    }
  }, [isMobile]);

  // Handle navigation dot click
  const handleNavigate = useCallback(
    (index: number) => {
      const sections = document.querySelectorAll('[data-year]');
      const targetSection = sections[index];

      if (!targetSection) return;

      if (isMobile) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        const container = document.querySelector('.horizontal-scroll-container') as HTMLElement;
        if (!container) return;

        const totalWidth = container.scrollWidth - window.innerWidth;
        const sectionPosition = (targetSection as HTMLElement).offsetLeft;
        const scrollPercentage = sectionPosition / container.scrollWidth;
        const scrollTarget = scrollPercentage * totalWidth;
        const landingHeight = landingRef.current?.offsetHeight || window.innerHeight;

        gsap.to(window, {
          scrollTo: {
            y: scrollTarget + landingHeight,
            autoKill: false,
          },
          duration: 1,
          ease: 'power2.inOut',
        });
      }
    },
    [isMobile]
  );

  // Keyboard navigation
  useEffect(() => {
    if (isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const scrollAmount = window.innerHeight * 0.3;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        window.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobile]);

  // Animate landing content on load
  useEffect(() => {
    gsap.from('.landing-content', {
      opacity: 0,
      y: 30,
      duration: 1,
      ease: 'power3.out',
    });

    gsap.from('.zodiac-symbol-anim', {
      scale: 0.5,
      opacity: 0,
      duration: 1.2,
      delay: 0.3,
      ease: 'elastic.out(1, 0.5)',
    });
  }, []);

  const years = ENRICHED_TIMELINE.map((entry) => entry.year);

  return (
    <div className="font-body bg-rice-paper text-ink-black overflow-x-hidden leading-relaxed">
      <div ref={landingRef}>
        <Landing onScrollClick={handleScrollClick} />
      </div>

      <div className="horizontal-scroll-wrapper">
        <HorizontalScroll
          onProgressUpdate={handleProgressUpdate}
          isMobile={isMobile}
        >
          <div className="horizontal-scroll-container flex">
            {ENRICHED_TIMELINE.map((entry, index) => (
              <YearSection
                key={entry.year}
                year={entry.year}
                element={entry.zodiac.element}
                isOdd={index % 2 === 0}
                showDecoration={index < ENRICHED_TIMELINE.length - 1}
              >
                <div className="year-card-wrapper">
                  <YearCard entry={entry} />
                </div>
              </YearSection>
            ))}

            <EndSection />
          </div>
        </HorizontalScroll>
      </div>

      <YearNav
        years={years}
        activeIndex={activeIndex}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default App;
