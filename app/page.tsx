import About from "@/components/About";
import AgentBuildRoot from "@/components/AgentBuildRoot";
import Certifications from "@/components/Certifications";
import Company from "@/components/Company";
import Contact from "@/components/Contact";
import Experience from "@/components/Experience";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import SystemsMatrix from "@/components/SystemsMatrix";

export default function Home() {
  return (
    <div id="page" className="relative">
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[90] focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <SystemsMatrix />
        <Certifications />
        <Company />
        <Contact />
      </main>
      <Footer />
      <AgentBuildRoot />
    </div>
  );
}
