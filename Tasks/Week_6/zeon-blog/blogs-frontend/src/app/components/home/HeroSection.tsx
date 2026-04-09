export default function HeroSection() {
  return (
    <section className="py-14 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Inside Design: Stories and interviews
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 md:text-lg dark:text-gray-300">
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
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-sky-400"
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
