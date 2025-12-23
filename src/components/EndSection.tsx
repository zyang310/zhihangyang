import { ChineseFrame } from './ChineseFrame';

export function EndSection() {
  return (
    <section className="w-screen min-h-screen flex items-center justify-center p-8 relative shrink-0 bg-gradient-to-br from-chinese-red to-chinese-red-dark">
      <div className="text-center">
        <ChineseFrame variant="dark">
          <h2 className="font-chinese text-[clamp(2.5rem,8vw,4rem)] text-gold mb-2">
            未完待续
          </h2>
          <p className="text-rice-paper italic mb-8">To Be Continued...</p>

          <div className="flex gap-6 justify-center flex-wrap">
            <a
              href="mailto:your.email@example.com"
              className="text-gold no-underline px-6 py-3 border border-gold transition-all hover:bg-gold hover:text-chinese-red-dark"
            >
              Email
            </a>
            <a
              href="https://github.com/zyang310"
              className="text-gold no-underline px-6 py-3 border border-gold transition-all hover:bg-gold hover:text-chinese-red-dark"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/yourprofile"
              className="text-gold no-underline px-6 py-3 border border-gold transition-all hover:bg-gold hover:text-chinese-red-dark"
            >
              LinkedIn
            </a>
          </div>
        </ChineseFrame>
      </div>
    </section>
  );
}
