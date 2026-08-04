import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { Features } from './Features';
import { AppPreview } from './AppPreview';
import { LandingPricing } from './LandingPricing';
import { Footer } from './Footer';

export function LandingPage() {
  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      background: 'hsl(222, 25%, 7%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: 'hsl(210, 30%, 90%)',
      overflowX: 'hidden',
      overflowY: 'auto',
      display: 'flex', flexDirection: 'column',
      flex: 1,
    }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Hero />
        <Features />
        <AppPreview />
        <LandingPricing />
      </main>
      <Footer />
    </div>
  );
}
