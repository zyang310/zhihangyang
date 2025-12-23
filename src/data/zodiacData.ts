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
// Timeline data - your personal milestones
const TIMELINE_DATA: Omit<TimelineEntry, 'zodiac'>[] = [
  {
    year: 2004,
    milestone: true,
    title: 'The Beginning',
    description: 'Hello world! This is Zhi and I was born in 2004, the Year of the Wood Monkey. My parents are from the countryside of China, in a village outside of Fuzhou, Fujian Province. But I was born in a hospital in Brooklyn, New York.',
  },
  {
    year: 2008,
    milestone: true,
    title: 'The Chinese Years',
    description: 'My parents sent me to China to live with my grandparents in the countryside. I learned to speak Mandarin and experienced Chinese culture firsthand, even attending pre-school in China. I came back to the US in 2010-2011 and started first grade.',
  },
  {
    year: 2012,
    milestone: true,
    title: 'Growing Up in New Bern',
    description: 'Our family moved to New Bern, North Carolina, to open a Chinese restaurant, which I helped out at after school. I started second grade at a local elementary school and made new friends. I also started learning to play the piano and developed a passion for music.',
  },
  {
    year: 2016,
    milestone: true,
    title: 'Another Monkey Year',
    description: "2016 was another Monkey year, which means I turned 12 years old. This was also the year I graduated from elementary school and started middle school. One of the highlights of this year was competing in my district's Battle of the Books competition, where we took 4th place out of 26 teams. Battle of the Books is also where I developed a love for reading!",
  },
  {
    year: 2020,
    milestone: true,
    title: 'Living in the Pandemic',
    description: "2019-2020 was the start of my high school years. I went to Craven Early College, which allows its students to take college courses while in high school. 2020 was a challenging year due to the global pandemic. Despite the difficulties, I continued to pursue my interests and hobbies, such as music and reading. I also got my first computer through savings from working at my parent's restaurant and started learning about computer programming, developing a passion for technology.",
  },
  {
    year: 2022,
    milestone: false,
    title: 'Year of the Tiger',
    description: "2022 marked the end of my junior year and the start of my senior year. This was when I started applying to colleges and planning for my future. I continued to work part-time at my parent's restaurant and focused on my classes and extracurricular activities, such as my school's Junior Honor Society, Junior Civitan, and Science Olympiad.",
  },
  {
    year: 2023,
    milestone: false,
    title: 'Year of the Rabbit',
    description: "2023 was a major year in my life: I got accepted into the University of North Carolina at Chapel Hill, graduated high school, and started my college journey. I continued to work part-time at my parent's restaurant. At UNC, I started learning more about computer science. My first semester only consisted of COMP 110, the introductory class at UNC, but I was excited to absorb all the knowledge it had to offer! I also attended my first hackathon, Hack110. It was an incredible and quite humbling experience, having to piece together a project from scratch in a limited amount of time. At UNC, I also chose to minor in Chinese, wanting to bridge the gap between my two backgrounds.",
  },
  {
    year: 2024,
    milestone: false,
    title: 'Year of the Dragon',
    description: 'Each year brings new challenges and experiences, and 2024 was no exception. I took classes in discrete structures and data structures and algorithms. I also took the opportunity to volunteer for Pearl Hack! The summer after my freshman year, I had the opportunity to travel to China for the first time in over 10 years. I visited my hometown, Fuzhou, and explored other cities like Shanghai and Beijing. This trip was a significant milestone in my life, as it allowed me to reconnect with my cultural roots and gain a deeper understanding of my heritage. It was an incredibly enriching experience that broadened my perspectives and deepened my appreciation for both my Chinese and American identities. During the start of my sophomore year, I took classes in OOP and Computer Systems.',
  },
  {
    year: 2025,
    milestone: false,
    title: 'The Present',
    description: "2025 is when I'm learning more about the various areas of computer science and applying my knowledge in personal and class projects. Some of the classes I took in my spring semester of sophomore year were COMP 550, which helped me understand how to design algorithms, and COMP 423, a software engineering class where I learned a lot about how software engineering works in industry. My team developed Project Hub, a feature for CSX, a platform for UNC students to manage their projects and collaborate with each other. This was a significant milestone for me as it allowed me to apply my knowledge in a real-world setting and gain valuable experience in software engineering. During the summer, I studied abroad in Copenhagen, Denmark for COMP 311, Computer Organization, which was an incredible experience. It opened my eyes to how different cultures approach technology as well as how interesting computer architecture is. It really made me explore the low-level aspects of computer systems. This experience also led to the opportunity to be a UTA for this class. Over the summer, I also developed Bittle, an app that streamlines the process of pairing mentors and mentees for clubs. During the fall semester of my junior year, I took classes in 2-D graphics, Web Development, and Computer Security.",
  }
];

// Enrich timeline data with zodiac info
export const ENRICHED_TIMELINE: TimelineEntry[] = TIMELINE_DATA.map(entry => ({
  ...entry,
  zodiac: getZodiacInfo(entry.year)
}));
