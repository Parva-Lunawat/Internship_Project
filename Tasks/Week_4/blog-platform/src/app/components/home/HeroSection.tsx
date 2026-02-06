export default function HeroSection() {
  return (
    <section className="py-20 text-center">
      <h1 className="text-4xl font-bold">
        Inside Design: Stories and interviews
      </h1>

      <p className="mx-auto mt-4 max-w-xl text-gray-600">
        Subscribe to learn about new product features, the latest in technology,
        and updates.
      </p>

      <div className="mt-6 flex justify-center gap-2">
        <input
          type="email"
          placeholder="Enter your email"
          className="w-64 rounded-lg border px-4 py-2"
        />
        <button className="rounded-lg bg-black px-4 py-2 text-white">
          Subscribe
        </button>
      </div>
    </section>
  );
}
