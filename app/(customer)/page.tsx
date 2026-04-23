import LandingHero from "@/components/customer/LandingHero";
import LandingMarquee from "@/components/customer/LandingMarquee";
import LandingCategories from "@/components/customer/LandingCategories";
import LandingShowcase from "@/components/customer/LandingShowcase";
import LandingExperience from "@/components/customer/LandingExperience";
import LandingReviews from "@/components/customer/LandingReviews";
import LandingFinalCTA from "@/components/customer/LandingFinalCTA";
import LandingSmoothScroll from "@/components/customer/LandingSmoothScroll";
import LandingCursor from "@/components/customer/LandingCursor";
import Footer from "@/components/customer/Footer";

export default function LandingPage() {
  return (
    <>
      <LandingSmoothScroll />
      <LandingCursor />
      <LandingHero />
      <LandingMarquee />
      <LandingCategories />
      <LandingShowcase />
      <LandingExperience />
      <LandingReviews />
      <LandingFinalCTA />
      <Footer />
    </>
  );
}
