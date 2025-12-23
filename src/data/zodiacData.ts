// Chinese Zodiac Data and Calculations - TypeScript Version

export type ZodiacAnimal = 'Rat' | 'Ox' | 'Tiger' | 'Rabbit' | 'Dragon' | 'Snake' | 'Horse' | 'Goat' | 'Monkey' | 'Rooster' | 'Dog' | 'Pig';
export type Element = 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';

export interface ElementFact {
  chinese: string;
  fact: string;
  traits: string[];
}

export interface ZodiacInfo {
  year: number;
  animal: ZodiacAnimal;
  animalChinese: string;
  element: Element;
  elementChinese: string;
  elementColor: string;
  elementFact: ElementFact;
  animalTraits: string;
  fullName: string;
  fullNameChinese: string;
}

export interface TimelineEntry {
  year: number;
  milestone: boolean;
  title: string;
  description: string;
  zodiac: ZodiacInfo;
}

const ZODIAC_ANIMALS: ZodiacAnimal[] = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'
];

const ZODIAC_CHINESE: Record<ZodiacAnimal, string> = {
  'Rat': '鼠', 'Ox': '牛', 'Tiger': '虎', 'Rabbit': '兔',
  'Dragon': '龙', 'Snake': '蛇', 'Horse': '马', 'Goat': '羊',
  'Monkey': '猴', 'Rooster': '鸡', 'Dog': '狗', 'Pig': '猪'
};

const ELEMENTS: Element[] = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];

const ELEMENT_CHINESE: Record<Element, string> = {
  'Wood': '木', 'Fire': '火', 'Earth': '土', 'Metal': '金', 'Water': '水'
};

const ELEMENT_COLORS: Record<Element, string> = {
  'Wood': '#228B22',
  'Fire': '#FF4500',
  'Earth': '#DAA520',
  'Metal': '#C0C0C0',
  'Water': '#1E90FF'
};

export const ELEMENT_FACTS: Record<Element, ElementFact> = {
  'Wood': {
    chinese: '木',
    fact: 'Represents growth, creativity, and flexibility. Wood types are generous, idealistic, and naturally compassionate.',
    traits: ['Creative', 'Generous', 'Idealistic']
  },
  'Fire': {
    chinese: '火',
    fact: 'Represents passion, energy, and leadership. Fire types are adventurous, enthusiastic, and natural leaders.',
    traits: ['Passionate', 'Adventurous', 'Charismatic']
  },
  'Earth': {
    chinese: '土',
    fact: 'Represents stability, patience, and practicality. Earth types are reliable, nurturing, and deeply grounded.',
    traits: ['Stable', 'Patient', 'Practical']
  },
  'Metal': {
    chinese: '金',
    fact: 'Represents strength, determination, and discipline. Metal types are ambitious, focused, and resolute.',
    traits: ['Determined', 'Ambitious', 'Disciplined']
  },
  'Water': {
    chinese: '水',
    fact: 'Represents wisdom, intuition, and adaptability. Water types are empathetic, creative, and deeply perceptive.',
    traits: ['Wise', 'Intuitive', 'Adaptable']
  }
};

const ZODIAC_TRAITS: Record<ZodiacAnimal, string> = {
  'Rat': 'Quick-witted, resourceful, and versatile',
  'Ox': 'Diligent, dependable, and determined',
  'Tiger': 'Brave, confident, and competitive',
  'Rabbit': 'Gentle, elegant, and responsible',
  'Dragon': 'Confident, intelligent, and enthusiastic',
  'Snake': 'Enigmatic, wise, and intuitive',
  'Horse': 'Animated, active, and energetic',
  'Goat': 'Calm, gentle, and sympathetic',
  'Monkey': 'Sharp, curious, and mischievous',
  'Rooster': 'Observant, hardworking, and courageous',
  'Dog': 'Loyal, honest, and prudent',
  'Pig': 'Compassionate, generous, and diligent'
};

// Calculate zodiac animal for a given year
function getZodiacAnimal(year: number): ZodiacAnimal {
  // 1900 was the year of the Rat
  const index = (year - 1900) % 12;
  return ZODIAC_ANIMALS[index >= 0 ? index : index + 12];
}

// Calculate element for a given year
function getElement(year: number): Element {
  // Element cycle: Wood, Fire, Earth, Metal, Water
  // Each element rules for 2 consecutive years
  // 1984 was a Wood year
  const cycle = Math.floor((year - 1984) / 2) % 5;
  return ELEMENTS[cycle >= 0 ? cycle : cycle + 5];
}

// Get full zodiac info for a year
export function getZodiacInfo(year: number): ZodiacInfo {
  const animal = getZodiacAnimal(year);
  const element = getElement(year);

  return {
    year: year,
    animal: animal,
    animalChinese: ZODIAC_CHINESE[animal],
    element: element,
    elementChinese: ELEMENT_CHINESE[element],
    elementColor: ELEMENT_COLORS[element],
    elementFact: ELEMENT_FACTS[element],
    animalTraits: ZODIAC_TRAITS[animal],
    fullName: `${element} ${animal}`,
    fullNameChinese: `${ELEMENT_CHINESE[element]}${ZODIAC_CHINESE[animal]}`
  };
}

// Timeline data - your personal milestones
const TIMELINE_DATA: Omit<TimelineEntry, 'zodiac'>[] = [
  {
    year: 2004,
    milestone: true,
    title: 'The Beginning',
    description: 'Born in the Year of the Wood Monkey - a year of creativity and curiosity.',
  },
  {
    year: 2008,
    milestone: true,
    title: 'Early Adventures',
    description: 'Add your memory from this year...',
  },
  {
    year: 2012,
    milestone: true,
    title: 'Growing Up',
    description: 'Add your memory from this year...',
  },
  {
    year: 2016,
    milestone: true,
    title: 'Another Monkey Year',
    description: 'The Fire Monkey returns! Add your memory...',
  },
  {
    year: 2020,
    milestone: true,
    title: 'A New Chapter',
    description: 'Add your memory from this year...',
  },
  {
    year: 2021,
    milestone: false,
    title: 'Year of the Ox',
    description: 'Add your memory from this year...',
  },
  {
    year: 2022,
    milestone: false,
    title: 'Year of the Tiger',
    description: 'Add your memory from this year...',
  },
  {
    year: 2023,
    milestone: false,
    title: 'Year of the Rabbit',
    description: 'Add your memory from this year...',
  },
  {
    year: 2024,
    milestone: false,
    title: 'Year of the Dragon',
    description: 'Add your memory from this year...',
  },
  {
    year: 2025,
    milestone: false,
    title: 'The Present',
    description: 'The journey continues...',
  }
];

// Enrich timeline data with zodiac info
export const ENRICHED_TIMELINE: TimelineEntry[] = TIMELINE_DATA.map(entry => ({
  ...entry,
  zodiac: getZodiacInfo(entry.year)
}));
