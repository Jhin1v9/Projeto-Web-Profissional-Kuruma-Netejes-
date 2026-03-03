import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Estimate } from "@/components/sections/Estimate";
import { Process } from "@/components/sections/Process";
import { Location } from "@/components/sections/Location";
import { CTA } from "@/components/sections/CTA";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Services />
      <Estimate />
      <Process />
      <Location />
      <CTA />
      <Footer />
    </main>
  );
}
