interface YearNavProps {
  years: number[];
  activeIndex: number;
  onNavigate: (index: number) => void;
}

export function YearNav({ years, activeIndex, onNavigate }: YearNavProps) {
  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-3 px-6 py-3 bg-white/95 border-2 border-chinese-red shadow-lg z-50 max-md:bottom-4 max-md:px-4 max-md:py-2 max-md:gap-2">
      {years.map((year, index) => (
        <div
          key={year}
          className={`w-3 h-3 rounded-full border-2 border-chinese-red cursor-pointer transition-all relative hover:bg-gold hover:scale-[1.2] max-md:w-[10px] max-md:h-[10px] ${
            activeIndex === index ? 'bg-chinese-red' : 'bg-rice-paper-dark'
          }`}
          title={String(year)}
          onClick={() => onNavigate(index)}
        />
      ))}
    </nav>
  );
}
