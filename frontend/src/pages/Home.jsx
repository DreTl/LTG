import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LandingHero from '../components/landing/LandingHero';
import LogoCloud from '../components/landing/LogoCloud';
import ShowcaseSection from '../components/landing/ShowcaseSection';
import IntegrationsSection from '../components/landing/IntegrationsSection';
import AutomationSection from '../components/landing/AutomationSection';
import LandingCTA from '../components/landing/LandingCTA';
import Footer from '../components/Footer';

export default function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash === '#features') {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [hash]);

  return (
    <div className="landing-page platform-bg min-h-screen">
      <LandingHero />
      <LogoCloud />
      <ShowcaseSection />
      <IntegrationsSection />
      <AutomationSection />
      <LandingCTA />
      <Footer />
    </div>
  );
}
