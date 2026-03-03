import { Navbar } from "@/components/layout/Navbar";
import { HomeSections } from "@/components/sections/HomeSections";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <HomeSections />
    </main>
  );
}
