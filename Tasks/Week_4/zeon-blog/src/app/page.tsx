import HeroSection from "./components/home/HeroSection";
import FeaturedSection from "./components/home/FeaturedSection";
import BlogGrid from "./components/home/BlogGrid";

export default function HomePage() {
  return (
    <div className="space-y-20">
      <HeroSection />
      <FeaturedSection />
      <BlogGrid />
    </div>
  );
}