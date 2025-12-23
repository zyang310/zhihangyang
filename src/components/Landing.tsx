import { ChineseFrame } from './ChineseFrame';

interface LandingProps {
  onScrollClick: () => void;
}

export function Landing({ onScrollClick }: LandingProps) {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rice-paper to-rice-paper-dark relative overflow-hidden">
      {/* Background decorative gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(196,30,58,0.05)_0%,transparent_50%)]" />
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(212,175,55,0.08)_0%,transparent_50%)]" />
      </div>

      <div className="text-center z-10 p-8">
        <ChineseFrame>
          <h1 className="font-chinese text-[clamp(3rem,10vw,6rem)] text-ink-black tracking-[0.5rem] mb-2">
            杨治航
          </h1>
          <h2 className="font-body text-[clamp(1.2rem,3vw,1.8rem)] font-normal text-chinese-red tracking-[0.3rem] uppercase mb-8">
            Zhihang Yang
          </h2>

          <div className="my-8">
            <span className="font-chinese text-[clamp(4rem,12vw,8rem)] text-chinese-red block leading-none drop-shadow-md">
              猴
            </span>
            <p className="text-gold mt-2 tracking-wider text-base">
              Year of the Wood Monkey · 2004
            </p>
          </div>

          <p className="italic text-gray-600 my-6">
            A journey through time, told through the Chinese zodiac
          </p>

          <div
            className="mt-8 text-chinese-red cursor-pointer animate-pulse-slow"
            onClick={onScrollClick}
          >
            <span>Scroll to explore</span>
            <div className="text-2xl mt-2 animate-scroll-hint">→</div>
          </div>
        </ChineseFrame>
      </div>

      {/* Decorative clouds */}
      <div className="absolute w-[200px] h-[100px] bg-[radial-gradient(ellipse,rgba(255,255,255,0.8)_0%,transparent_70%)] pointer-events-none left-[-50px] top-[20%]" />
      <div className="absolute w-[200px] h-[100px] bg-[radial-gradient(ellipse,rgba(255,255,255,0.8)_0%,transparent_70%)] pointer-events-none right-[-50px] bottom-[20%]" />
    </section>
  );
}
