import { TimelineEntry, Element } from '../data/zodiacData';
import { ElementBadge } from './ElementBadge';
import { ZodiacDisplay } from './ZodiacDisplay';

interface YearCardProps {
  entry: TimelineEntry;
}

const borderColors: Record<Element, string> = {
  Wood: 'border-element-wood',
  Fire: 'border-element-fire',
  Earth: 'border-element-earth',
  Metal: 'border-gray-500',
  Water: 'border-element-water',
};

export function YearCard({ entry }: YearCardProps) {
  const { year, title, description, zodiac } = entry;

  return (
    <div
      className={`w-[min(500px,85vw)] bg-white/90 border-2 ${borderColors[zodiac.element]} p-10 relative shadow-[0_10px_40px_rgba(0,0,0,0.1),0_0_0_1px_#D4AF37] md:p-10 max-md:p-6`}
    >
      {/* Corner decorations */}
      <div className="absolute w-[30px] h-[30px] border-2 border-gold top-[10px] left-[10px] border-r-0 border-b-0" />
      <div className="absolute w-[30px] h-[30px] border-2 border-gold bottom-[10px] right-[10px] border-l-0 border-t-0" />

      <ElementBadge
        element={zodiac.element}
        elementChinese={zodiac.elementChinese}
      />

      <div className="font-chinese text-[clamp(3rem,8vw,5rem)] text-chinese-red text-center leading-none mb-4">
        {year}
      </div>

      <ZodiacDisplay
        animalChinese={zodiac.animalChinese}
        animal={zodiac.animal}
      />

      <div className="text-center my-6">
        <h3 className="font-body text-2xl text-chinese-red mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>

      <div className="mt-6 p-4 bg-black/[0.03] border-l-[3px] border-gold text-sm text-gray-600">
        <p>
          <strong className="text-ink-black">{zodiac.element} ({zodiac.elementChinese}):</strong>{' '}
          {zodiac.elementFact.fact}
        </p>
      </div>
    </div>
  );
}
