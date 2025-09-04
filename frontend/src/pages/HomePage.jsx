import { useState } from "react";
import NavBar from "../components/NavBar";
import HeroSection from "../sections/HeroSection";
import { ScrollSmoother, ScrollTrigger } from "gsap/all";
import gsap from "gsap";
import MessageSection from "../sections/MessageSection";
import VoiceSection from "../sections/VoiceSection";
import { useGSAP } from "@gsap/react";
import FeatureSection from "../sections/FeatureSection";
import BenefitSection from "../sections/BenefitSection";
import TestimonialSection from "../sections/TestimonialSection";
import FooterSection from "../sections/FooterSection";
import { AnimatePresence } from "framer-motion";
import VoiceModal from "../components/VoiceModal";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useGSAP(() => {
    ScrollSmoother.create({
      smooth: 3,
      effects: true,
      ignoreMobileResize: true,
      normalizeScroll: true,
    });
  });

  return (
    <main>
      <NavBar />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <HeroSection openModal={() => setIsModalOpen(true)} />
          <MessageSection />
          <VoiceSection />
          <FeatureSection />
          <div>
            <BenefitSection />
            <TestimonialSection />
          </div>
          <FooterSection />
        </div>
      </div>

      {/* Modal outside smoother wrapper */}
      <AnimatePresence>
        {isModalOpen && (
          <VoiceModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
};

export default HomePage;
