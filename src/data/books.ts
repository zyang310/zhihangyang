import { PROMPTS, type Book } from './library';
import threeBodyCover from '../assets/media/cover-three-body.webp';

// Every item on the site is a book. Order here is order on the shelf.
//
// A book shows on the live site once it has a title, dates, and at least MIN_WORDS (40) words
// (the book Zhi is reading needs only a title and a cover image).
// Unfinished books still appear in development (and with ?drafts) with a "draft" slip,
// and opening one shows its writing prompts.
//
// Body text: separate paragraphs with a blank line. [[book-id|text]] links to another book.

const lifeBinding = { texture: 'cloth', color: '#5b1a1c', height: 0.93 } as const;

export const BOOKS: Book[] = [
  // ─── Life Story ──────────────────────────────────────────────────────────
  {
    id: 'beginning',
    shelf: 'life',
    title: 'The Beginning',
    dates: '2004',
    binding: lifeBinding,
    body: `Hello world! This is Zhi and I was born in 2004, the Year of the Wood Monkey. My parents are from the countryside of China, in a village outside of Fuzhou, Fujian Province. But I was born in a hospital in Brooklyn, New York.`,
  },
  {
    id: 'chinese-years',
    shelf: 'life',
    title: 'The Chinese Years',
    dates: '2008',
    binding: lifeBinding,
    body: `My parents sent me to China to live with my grandparents in the countryside. I learned to speak Mandarin and experienced Chinese culture firsthand, even attending pre-school in China. I came back to the US in 2010-2011 and started first grade.`,
  },
  {
    id: 'new-bern',
    shelf: 'life',
    title: 'Growing Up in New Bern',
    dates: '2012',
    binding: lifeBinding,
    body: `Our family moved to New Bern, North Carolina, to open a [[restaurant|Chinese restaurant]], which I helped out at after school. I started second grade at a local elementary school and made new friends. I also started learning to play the piano and developed a passion for music.`,
  },
  {
    id: 'battle-of-the-books',
    shelf: 'life',
    title: 'Battle of the Books', // TODO(zhi): draft retitle; was "Another Monkey Year"
    dates: '2016',
    binding: lifeBinding,
    body: `2016 was another Monkey year, which means I turned 12 years old. This was also the year I graduated from elementary school and started middle school.

One of the highlights of this year was competing in my district's Battle of the Books competition, where we took 4th place out of 26 teams. Battle of the Books is also where I developed a love for reading!`,
  },
  {
    id: 'pandemic',
    shelf: 'life',
    title: 'Living in the Pandemic',
    dates: '2020',
    binding: lifeBinding,
    body: `2019-2020 was the start of my high school years. I went to Craven Early College, which allows its students to take college courses while in high school. 2020 was a challenging year due to the global pandemic. Despite the difficulties, I continued to pursue my interests and hobbies, such as music and reading.

I also got my first computer through savings from [[restaurant|working at my parent's restaurant]] and started learning about computer programming, developing a passion for technology.`,
  },
  {
    id: 'senior-year',
    shelf: 'life',
    title: 'Senior Year', // TODO(zhi): draft retitle; was "Year of the Tiger"
    dates: '2022',
    binding: lifeBinding,
    body: `2022 marked the end of my junior year and the start of my senior year. This was when I started applying to colleges and planning for my future. I continued to work part-time at my parent's restaurant and focused on my classes and extracurricular activities, such as my school's Junior Honor Society, Junior Civitan, and Science Olympiad.`,
  },
  {
    id: 'chapel-hill',
    shelf: 'life',
    title: 'Chapel Hill', // TODO(zhi): draft retitle; was "Year of the Rabbit"
    dates: '2023',
    binding: lifeBinding,
    body: `2023 was a major year in my life: I got accepted into the University of North Carolina at Chapel Hill, graduated high school, and started my college journey. I continued to work part-time at my parent's restaurant. At UNC, I started learning more about computer science. My first semester only consisted of COMP 110, the introductory class at UNC, but I was excited to absorb all the knowledge it had to offer!

I also attended my first hackathon, [[hack110|Hack110]]. It was an incredible and quite humbling experience, having to piece together a project from scratch in a limited amount of time. At UNC, I also chose to minor in Chinese, wanting to bridge the gap between my two backgrounds.`,
  },
  {
    id: 'back-to-china',
    shelf: 'life',
    title: 'Back to China', // TODO(zhi): draft retitle; was "Year of the Dragon"
    dates: '2024',
    binding: lifeBinding,
    body: `Each year brings new challenges and experiences, and 2024 was no exception. I took classes in discrete structures and data structures and algorithms. I also took the opportunity to volunteer for [[pearl-hack|Pearl Hack]]!

The summer after my freshman year, I had the opportunity to travel to China for the first time in over 10 years. I visited my hometown, Fuzhou, and explored other cities like Shanghai and Beijing. This trip was a significant milestone in my life, as it allowed me to reconnect with my cultural roots and gain a deeper understanding of my heritage. It was an incredibly enriching experience that broadened my perspectives and deepened my appreciation for both my Chinese and American identities.

During the start of my sophomore year, I took classes in OOP and Computer Systems.`,
  },
  {
    id: 'present',
    shelf: 'life',
    title: 'The Present', // TODO(zhi): no longer the present once the 2026 volume is written
    dates: '2025',
    binding: lifeBinding,
    // TODO(zhi): Project Hub and Copenhagen now have their own books; trim the overlap here if you like
    body: `2025 is when I'm learning more about the various areas of computer science and applying my knowledge in personal and class projects. Some of the classes I took in my spring semester of sophomore year were COMP 550, which helped me understand how to design algorithms, and COMP 423, a software engineering class where I learned a lot about how software engineering works in industry. My team developed [[project-hub|Project Hub]], a feature for CSX, a platform for UNC students to manage their projects and collaborate with each other. This was a significant milestone for me as it allowed me to apply my knowledge in a real-world setting and gain valuable experience in software engineering.

During the summer, I [[copenhagen|studied abroad in Copenhagen, Denmark]] for COMP 311, Computer Organization, which was an incredible experience. It opened my eyes to how different cultures approach technology as well as how interesting computer architecture is. It really made me explore the low-level aspects of computer systems. This experience also led to the opportunity to be a [[comp311-uta|UTA for this class]]. Over the summer, I also developed [[bittle|Bittle]], an app that streamlines the process of pairing mentors and mentees for clubs.

During the fall semester of my junior year, I took classes in 2-D graphics, Web Development, and Computer Security.`,
  },
  {
    id: 'year-2026',
    shelf: 'life',
    title: 'To Be Written', // TODO(zhi): the timeline stops at fall 2025
    dates: '2026',
    binding: lifeBinding,
    body: ``,
    prompts: PROMPTS.life,
  },

  // ─── Experience ──────────────────────────────────────────────────────────
  {
    id: 'restaurant',
    shelf: 'experience',
    title: 'Family Restaurant',
    dates: 'From 2012',
    binding: { texture: 'cloth', color: '#243f2d', height: 0.95 },
    facts: [{ label: 'Where', value: 'New Bern, North Carolina' }],
    // TODO(zhi): expand with the experience prompts (what you did, what changed, what you learned)
    body: `Our family moved to New Bern, North Carolina, to open a Chinese restaurant, which I helped out at after school. I kept working there part-time through high school and into college.

I got my first computer through savings from working at the restaurant and started learning about computer programming, developing a passion for technology.`,
    prompts: PROMPTS.experience,
  },
  {
    id: 'pearl-hack',
    shelf: 'experience',
    title: 'Pearl Hack Volunteer',
    dates: '2024',
    binding: { texture: 'cloth', color: '#7a5524', height: 0.82, stacked: true },
    body: `I took the opportunity to volunteer for Pearl Hack!`,
    prompts: PROMPTS.experience,
  },
  {
    id: 'copenhagen',
    shelf: 'experience',
    title: 'Study Abroad: Copenhagen',
    dates: 'Summer 2025',
    binding: { texture: 'cloth', color: '#22385a', height: 0.9 },
    facts: [
      { label: 'Course', value: 'COMP 311 · Computer Organization' },
      { label: 'Where', value: 'Copenhagen, Denmark' },
    ],
    body: `During the summer, I studied abroad in Copenhagen, Denmark for COMP 311, Computer Organization, which was an incredible experience. It opened my eyes to how different cultures approach technology as well as how interesting computer architecture is. It really made me explore the low-level aspects of computer systems.

This experience also led to the opportunity to be a [[comp311-uta|UTA for this class]].`,
    prompts: PROMPTS.experience,
  },
  {
    id: 'comp311-uta',
    shelf: 'experience',
    title: 'COMP 311 UTA',
    dates: '', // TODO(zhi): when did you start?
    binding: { texture: 'leather', color: '#3a2618', height: 0.86 },
    facts: [
      { label: 'Role', value: 'Undergraduate Teaching Assistant' },
      { label: 'Course', value: 'COMP 311 · Computer Organization' },
    ],
    body: `My summer in [[copenhagen|Copenhagen]] taking COMP 311 led to the opportunity to be a UTA for this class.`,
    prompts: PROMPTS.experience,
  },

  // ─── Projects ────────────────────────────────────────────────────────────
  {
    id: 'hack110',
    shelf: 'projects',
    title: 'Hack110',
    dates: '2023',
    binding: { texture: 'cloth', color: '#4a2b5c', height: 0.84, stacked: true },
    body: `I attended my first hackathon, Hack110. It was an incredible and quite humbling experience, having to piece together a project from scratch in a limited amount of time.`,
    prompts: PROMPTS.project,
  },
  {
    id: 'project-hub',
    shelf: 'projects',
    title: 'Project Hub',
    dates: 'Spring 2025',
    binding: { texture: 'cloth', color: '#2d4b4a', height: 0.97 },
    facts: [
      { label: 'Course', value: 'COMP 423 · Software Engineering' },
      { label: 'Built for', value: 'CSX' },
    ],
    // TODO(zhi): add your role, the stack, a link, and a screenshot
    body: `COMP 423 is a software engineering class where I learned a lot about how software engineering works in industry. My team developed Project Hub, a feature for CSX, a platform for UNC students to manage their projects and collaborate with each other.

This was a significant milestone for me as it allowed me to apply my knowledge in a real-world setting and gain valuable experience in software engineering.`,
    prompts: PROMPTS.project,
  },
  {
    id: 'bittle',
    shelf: 'projects',
    title: 'Bittle',
    dates: 'Summer 2025',
    binding: { texture: 'cloth', color: '#8a3a14', height: 0.88 },
    body: `Over the summer, I developed Bittle, an app that streamlines the process of pairing mentors and mentees for clubs.`,
    prompts: PROMPTS.project,
  },
  {
    id: 'bookshelf',
    shelf: 'projects',
    title: 'This Bookshelf',
    dates: '2026',
    binding: { texture: 'leather', color: '#6e5432', height: 0.92 },
    facts: [{ label: 'Stack', value: 'React · TypeScript · GSAP · Tailwind CSS · Vite' }],
    body: ``,
    prompts: PROMPTS.project,
  },

  // ─── Currently Reading: the book in Zhi's hands in the armchair ─────────
  {
    id: 'reading-now',
    shelf: 'reading',
    title: 'The Three-Body Problem',
    dates: '', // Optional, e.g. "Since September 2026"
    // Only used if there's no cover image.
    binding: { texture: 'cloth', color: '#5b1a1c', height: 0.9 },
    body: ``,
    image: { src: threeBodyCover, alt: 'Cover of The Three-Body Problem by Cixin Liu, translated by Ken Liu' },
    facts: [
      { label: 'Author', value: 'Liu Cixin' },
      { label: 'Translated by', value: 'Ken Liu' },
    ],
    prompts: PROMPTS.reading,
  },
];
