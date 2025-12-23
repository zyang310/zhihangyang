interface ZodiacDisplayProps {
  animalChinese: string;
  animal: string;
}

export function ZodiacDisplay({ animalChinese, animal }: ZodiacDisplayProps) {
  return (
    <div className="text-center my-6 p-4 bg-gradient-to-br from-gold/10 to-chinese-red/5">
      <div className="font-chinese text-[clamp(4rem,10vw,6rem)] text-ink-black leading-none">
        {animalChinese}
      </div>
      <div className="text-base text-gold uppercase tracking-[0.2rem] mt-2">
        {animal}
      </div>
    </div>
  );
}
