import { ReactNode } from 'react';
import { Element } from '../data/zodiacData';

interface YearSectionProps {
  year: number;
  element: Element;
  children: ReactNode;
  isOdd: boolean;
  showDecoration?: boolean;
}

export function YearSection({ year, element, children, isOdd, showDecoration = true }: YearSectionProps) {
  const bgClass = isOdd
    ? 'bg-gradient-to-br from-rice-paper to-[#FFF8DC]'
    : 'bg-gradient-to-br from-[#FFF8DC] to-rice-paper';

  return (
    <section
      className={`w-screen min-h-screen flex items-center justify-center p-8 relative shrink-0 ${bgClass}`}
      data-year={year}
      data-element={element}
    >
      {children}

      {/* Section decoration - ink wash style divider */}
      {showDecoration && (
        <div className="absolute right-0 top-[10%] bottom-[10%] w-[2px] bg-gradient-to-b from-transparent via-chinese-red/30 to-transparent opacity-30 md:block hidden" />
      )}
    </section>
  );
}
