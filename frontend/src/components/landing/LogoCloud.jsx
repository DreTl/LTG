const partners = ['Village Cup', 'Festival FC', 'Unity League', 'Champions', 'Local FA'];

export default function LogoCloud() {
  return (
    <section className="py-12 border-y border-white/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
          {partners.map((name) => (
            <span
              key={name}
              className="text-white/25 text-sm md:text-base font-semibold tracking-widest uppercase hover:text-white/40 transition-colors"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
