import { Element } from '../data/zodiacData';

interface ElementBadgeProps {
  element: Element;
  elementChinese: string;
}

const elementGradients: Record<Element, string> = {
  Wood: 'from-element-wood to-element-wood-light',
  Fire: 'from-element-fire to-element-fire-light',
  Earth: 'from-element-earth to-element-earth-light',
  Metal: 'from-gray-500 to-element-metal',
  Water: 'from-element-water to-element-water-light',
};

export function ElementBadge({ element, elementChinese }: ElementBadgeProps) {
  return (
    <div
      className={`absolute top-[-15px] right-[30px] px-4 py-2 text-white text-center shadow-lg bg-gradient-to-br ${elementGradients[element]}`}
    >
      <span className="font-chinese text-2xl block">{elementChinese}</span>
      <span className="text-[0.7rem] uppercase tracking-wider">{element}</span>
    </div>
  );
}
