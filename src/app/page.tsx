import { Navbar } from "@/components/layout/Navbar";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { SectionDock } from "@/components/layout/SectionDock";
import { HomeSections } from "@/components/sections/HomeSections";

export default function Home() {
  return (
    <main className="relative">
      <ScrollProgress />
      <Navbar />
      <SectionDock />
      <HomeSections />
      <FloatingActions />
    </main>
  );
}
