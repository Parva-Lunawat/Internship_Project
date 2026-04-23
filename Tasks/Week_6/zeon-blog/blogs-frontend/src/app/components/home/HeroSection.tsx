export default function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 py-14 md:py-20 dark:border-slate-700/80">
      <img
        src="/hero-cover.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/65" />
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl dark:text-slate-100">
          Inside Design: Stories and interviews
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-700 md:text-lg dark:text-slate-200">
          Subscribe to learn about new product features, the latest in technology,
          and updates.
        </p>

        <form
          className="mx-auto mt-8 flex max-w-md items-center gap-2"
          // onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="h-11 w-full rounded-lg border border-gray-300 bg-white/95 px-4 text-sm text-slate-900 outline-none focus:border-gray-400 dark:border-slate-600 dark:bg-slate-900/95 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-sky-400"
          />
          <button
            type="submit"
            className="h-11 shrink-0 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white hover:bg-black dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
