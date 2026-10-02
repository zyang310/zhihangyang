import { PROMPTS, type Book } from './library';
import threeBodyCover from '../assets/media/cover-three-body.webp';
import cphCityHall from '../assets/media/copenhagen-city-hall.webp';
import cphHarbor from '../assets/media/copenhagen-harbor.webp';
import cphRosenborg from '../assets/media/copenhagen-rosenborg.webp';
import cphSunset from '../assets/media/copenhagen-sunset.webp';

// Every item on the site is a book. Order here is order on the shelf.
//
// A book shows on the live site once it has a title, dates, and at least MIN_WORDS (40) words
// (the book Zhi is reading needs only a title and a cover image).
// Unfinished books still appear in development (and with ?drafts) with a "draft" slip,
// and opening one shows its writing prompts.
//
// Body text: separate paragraphs with a blank line. [[book-id|text]] links to another book.

const copenhagenPhotos = [
  { src: cphRosenborg, alt: "Rosenborg Castle framed by linden leaves in the King's Garden, Copenhagen" },
  { src: cphHarbor, alt: 'An old brick warehouse with a red tile roof on the Copenhagen harbor, bicycles in the foreground' },
  { src: cphSunset, alt: 'Sunset down a tree-lined Copenhagen street, bicycles parked along the sidewalk' },
  { src: cphCityHall, alt: 'Copenhagen City Hall and its clock tower under an overcast evening sky' },
];

const lifeBinding = { texture: 'cloth', color: '#5b1a1c', height: 0.93 } as const;

export const BOOKS: Book[] = [
  // ─── Life Story ──────────────────────────────────────────────────────────
  {
    id: 'before-college',
    shelf: 'life',
    title: 'Before College',
    dates: '2004–2023',
    binding: lifeBinding,
    body: `Hello world! This is Zhi and I was born in 2004. My parents are from the countryside of China, in a village outside of Fuzhou, Fujian Province. But I was born in a hospital in Brooklyn, New York.

When I was young, my parents sent me to [[travel|China to live with my grandparents]] in the countryside, where I learned to speak Mandarin and even attended pre-school. I came back to the US in 2010-2011 and started first grade.

Our family then moved to New Bern, North Carolina, to open a [[restaurant|Chinese restaurant]], which I helped out at after school. I started second grade at a local elementary school and made new friends. In 2016 I graduated from elementary school and started middle school.

In 2019 I started high school at Craven Early College, which allows its students to take college courses while in high school. 2020 was a challenging year due to the global pandemic, but it's also when I got my first computer through savings from [[restaurant|working at my parent's restaurant]] and started learning about computer programming, developing a passion for technology.

My senior year was when I started applying to colleges and planning for my future. I continued to work part-time at the restaurant and focused on my classes and extracurricular activities, such as my school's Junior Honor Society, Junior Civitan, and Science Olympiad.`,
  },
  {
    id: 'college',
    shelf: 'life',
    title: 'College',
    dates: '2023–Present',
    binding: lifeBinding,
    // TODO(zhi): Project Hub and Copenhagen now have their own books; trim the overlap here if you like
    body: `2023 was a major year in my life: I got accepted into the University of North Carolina at Chapel Hill, graduated high school, and started my college journey. My first semester only consisted of COMP 110, the introductory class at UNC, but I was excited to absorb all the knowledge it had to offer! I also attended my first hackathon, [[hack110|Hack110]]. It was an incredible and quite humbling experience, having to piece together a project from scratch in a limited amount of time. At UNC, I also chose to minor in Chinese, wanting to bridge the gap between my two backgrounds.

In 2024 I took classes in discrete structures and data structures and algorithms, and volunteered for [[pearl-hack|Pearl Hack]]! During the start of my sophomore year, I took classes in OOP and Computer Systems.

In the spring of 2025 I took COMP 550, which helped me understand how to design algorithms, and COMP 423, a software engineering class where I learned a lot about how software engineering works in industry. My team developed [[project-hub|Project Hub]], a feature for CSX, a platform for UNC students to manage their projects and collaborate with each other.

That summer, I [[copenhagen|studied abroad in Copenhagen]] for COMP 311, Computer Organization, which made me explore the low-level aspects of computer systems and led to the opportunity to be a [[comp311-uta|UTA for this class]]. I also developed [[bittle|Bittle]], an app that streamlines the process of pairing mentors and mentees for clubs.

During the fall semester of my junior year, I took classes in 2-D graphics, Web Development, and Computer Security.`,
  },
  {
    id: 'hobbies',
    shelf: 'life',
    title: 'Hobbies',
    dates: 'Ongoing',
    binding: lifeBinding,
    // TODO(zhi): expand: what you play and read now, and anything else you do for fun
    body: `Music: I started learning to play the piano after our family moved to New Bern and developed a passion for music.

Reading: in middle school, I competed in my district's Battle of the Books competition, where we took 4th place out of 26 teams. Battle of the Books is where I developed a love for reading! These days I'm reading [[reading-now|The Three-Body Problem]].

Through the pandemic, music and reading were what I kept coming back to, along with a new hobby: programming, which started on the first computer I bought with my own savings.`,
  },
  {
    id: 'travel',
    shelf: 'life',
    title: 'Travel',
    dates: '2008–2025',
    binding: lifeBinding,
    // TODO(zhi): add more trips (and photos from China)
    image: copenhagenPhotos[0],
    body: `China, as a child: my parents sent me to live with my grandparents in the countryside outside Fuzhou. I learned to speak Mandarin and experienced Chinese culture firsthand, even attending pre-school in China, before coming back to the US in 2010-2011.

China, 2024: the summer after my freshman year, I traveled to China for the first time in over 10 years. I visited my hometown, Fuzhou, and explored other cities like Shanghai and Beijing. The trip allowed me to reconnect with my cultural roots and gain a deeper understanding of my heritage, and deepened my appreciation for both my Chinese and American identities.

Denmark, 2025: I spent the summer [[copenhagen|studying abroad in Copenhagen]], which opened my eyes to how different cultures approach technology.`,
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
    gallery: copenhagenPhotos,
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
