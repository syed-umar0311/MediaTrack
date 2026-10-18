import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  Pill, Heart, Calendar, Bell, Users, Shield,
  CheckCircle, ArrowRight, Menu, X, Sun, Moon, Monitor
} from 'lucide-react';
import { useState } from 'react';

export default function HomePage() {
  const { mode, palette, changeMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <Bell className="w-6 h-6" />,
      title: 'Smart Reminders',
      description: 'Never miss a dose with intelligent, customizable medication reminders.'
    },
    {
      icon: <Pill className="w-6 h-6" />,
      title: 'Medicine Tracking',
      description: 'Keep track of all your medications, dosages, and schedules in one place.'
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Dose History',
      description: 'Monitor adherence with complete dose tracking and detailed reports.'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Family Management',
      description: 'Manage medicine schedules for your entire family with separate profiles.'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Stock & Expiry Tracking',
      description: 'Get alerts for low stock and expiring medicines before it\'s too late.'
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Temporary Care Plans',
      description: 'Create short-term care plans for illnesses with built-in review workflows.'
    }
  ];

  const howItWorks = [
    { step: 1, title: 'Create Account', description: 'Sign up in seconds with just your email' },
    { step: 2, title: 'Add Medicines', description: 'Enter manually or scan prescription images' },
    { step: 3, title: 'Review Details', description: 'Confirm extracted information for accuracy' },
    { step: 4, title: 'Set Schedules', description: 'Configure reminders based on your routine' },
    { step: 5, title: 'Track & Manage', description: 'Mark doses, monitor stock, manage family care' }
  ];

  const faqs = [
    {
      q: 'How do medicine reminders work?',
      a: 'MediTrack sends you reminders at scheduled times through in-app notifications. You can mark doses as taken, skipped, or snooze them for later.'
    },
    {
      q: 'Can I manage medicines for family members?',
      a: 'Yes! You can create managed profiles for children or connect adult family members with their consent. Each profile has separate medicine records and customizable notification preferences.'
    },
    {
      q: 'How does prescription scanning work?',
      a: 'Upload a photo of your prescription, and our AI extracts medicine names, dosages, and instructions. You review and confirm all details before any medicines are created.'
    },
    {
      q: 'Is my medical data secure?',
      a: 'Absolutely. Your data is protected with industry-standard encryption. We never share your information without your explicit consent.'
    },
    {
      q: 'What happens if I miss a dose?',
      a: 'Missed doses are tracked in your history. You can optionally receive follow-up notifications, but MediTrack does not automatically adjust your medicine schedule.'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'rgb(var(--color-background))',
      color: 'rgb(var(--color-foreground))'
    }}>
      {/* Navbar */}
      <nav style={{
        borderBottom: '1px solid rgb(var(--color-border))',
        backgroundColor: 'rgb(var(--color-background))'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Pill className="w-8 h-8" style={{ color: 'rgb(var(--color-primary))' }} />
              <span className="text-xl font-bold">MediTrack</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="hover:opacity-80 transition-opacity">Features</a>
              <a href="#how-it-works" className="hover:opacity-80 transition-opacity">How It Works</a>
              <a href="#family-care" className="hover:opacity-80 transition-opacity">Family Care</a>
              <a href="#faq" className="hover:opacity-80 transition-opacity">FAQ</a>

              {/* Theme Toggle */}
              <button
                onClick={() => {
                  const modes = ['light', 'dark', 'system'];
                  const currentIndex = modes.indexOf(mode);
                  const nextMode = modes[(currentIndex + 1) % modes.length];
                  changeMode(nextMode);
                }}
                className="p-2 rounded-lg hover:bg-[rgb(var(--color-secondary))] transition-colors"
                aria-label="Toggle theme"
              >
                {mode === 'light' && <Sun className="w-5 h-5" />}
                {mode === 'dark' && <Moon className="w-5 h-5" />}
                {mode === 'system' && <Monitor className="w-5 h-5" />}
              </button>

              <Link
                to="/login"
                className="hover:opacity-80 transition-opacity"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: 'rgb(var(--color-primary))',
                  color: 'rgb(var(--color-primary-foreground))'
                }}
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3">
              <a href="#features" className="block py-2 hover:opacity-80">Features</a>
              <a href="#how-it-works" className="block py-2 hover:opacity-80">How It Works</a>
              <a href="#family-care" className="block py-2 hover:opacity-80">Family Care</a>
              <a href="#faq" className="block py-2 hover:opacity-80">FAQ</a>
              <Link to="/login" className="block py-2 hover:opacity-80">Login</Link>
              <Link
                to="/signup"
                className="block px-6 py-2 rounded-lg font-medium text-center"
                style={{
                  backgroundColor: 'rgb(var(--color-primary))',
                  color: 'rgb(var(--color-primary-foreground))'
                }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Simple Medicine Management for You and Your Family
          </h1>
          <p
            className="text-lg sm:text-xl mb-12 leading-relaxed"
            style={{ color: 'rgb(var(--color-muted-foreground))' }}
          >
            Organize medicines, schedules, reminders, and family care in one secure place.
            Never miss a dose. Stay informed about stock and expiry dates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 rounded-lg text-lg font-medium transition-all hover:opacity-90"
              style={{
                backgroundColor: 'rgb(var(--color-primary))',
                color: 'rgb(var(--color-primary-foreground))'
              }}
            >
              Get Started
            </Link>
            <a
              href="#features"
              className="px-8 py-4 rounded-lg text-lg font-medium transition-all border"
              style={{
                borderColor: 'rgb(var(--color-border))',
                color: 'rgb(var(--color-foreground))'
              }}
            >
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        className="py-20"
        style={{ backgroundColor: 'rgb(var(--color-secondary))' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">About MediTrack</h2>
          <p
            className="text-lg leading-relaxed"
            style={{ color: 'rgb(var(--color-muted-foreground))' }}
          >
            MediTrack helps you organize medicines, schedules, stock, expiry dates, and family reminders
            in one place. Whether you're managing your own medications or caring for family members,
            MediTrack simplifies the process with intelligent reminders, prescription scanning, and
            comprehensive tracking.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need</h2>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'rgb(var(--color-muted-foreground))' }}
          >
            Comprehensive tools for medication management, family care, and health tracking
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border transition-all hover:shadow-lg"
              style={{
                backgroundColor: 'rgb(var(--color-card))',
                borderColor: 'rgb(var(--color-border))'
              }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: 'rgb(var(--color-primary) / 0.1)' }}
              >
                <div style={{ color: 'rgb(var(--color-primary))' }}>
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-20"
        style={{ backgroundColor: 'rgb(var(--color-secondary))' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
            <p
              className="text-lg"
              style={{ color: 'rgb(var(--color-muted-foreground))' }}
            >
              Get started in minutes with our simple workflow
            </p>
          </div>

          <div className="space-y-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{
                    backgroundColor: 'rgb(var(--color-primary))',
                    color: 'rgb(var(--color-primary-foreground))'
                  }}
                >
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Family Care Section */}
      <section id="family-care" className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Family Medicine Management</h2>
          <p
            className="text-lg max-w-3xl mx-auto"
            style={{ color: 'rgb(var(--color-muted-foreground))' }}
          >
            Manage medications for your entire family with managed child profiles,
            consent-based adult connections, and configurable shared notifications.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgb(var(--color-primary) / 0.1)' }}
            >
              <Users className="w-8 h-8" style={{ color: 'rgb(var(--color-primary))' }} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Managed Profiles</h3>
            <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
              Create and manage profiles for children without separate accounts
            </p>
          </div>

          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgb(var(--color-primary) / 0.1)' }}
            >
              <Shield className="w-8 h-8" style={{ color: 'rgb(var(--color-primary))' }} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Consent-Based Access</h3>
            <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
              Connect adult accounts with granular permission controls
            </p>
          </div>

          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgb(var(--color-primary) / 0.1)' }}
            >
              <Bell className="w-8 h-8" style={{ color: 'rgb(var(--color-primary))' }} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Shared Notifications</h3>
            <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
              Choose which alerts family members receive for each profile
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section
        className="py-20"
        style={{ backgroundColor: 'rgb(var(--color-secondary))' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-6" style={{ color: 'rgb(var(--color-primary))' }} />
            <h2 className="text-3xl font-bold mb-6">Privacy & Responsible Design</h2>
            <div
              className="text-lg leading-relaxed space-y-4"
              style={{ color: 'rgb(var(--color-muted-foreground))' }}
            >
              <p>
                Your private medical records are protected by secure access controls and encryption.
                Information extracted from scans requires your review and confirmation before being saved.
              </p>
              <p>
                <strong style={{ color: 'rgb(var(--color-foreground))' }}>Important:</strong> MediTrack
                helps you organize and track medicine information. It does not diagnose illnesses,
                prescribe treatment, or replace professional medical advice. Always consult qualified
                healthcare professionals for medical decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border"
              style={{
                backgroundColor: 'rgb(var(--color-card))',
                borderColor: 'rgb(var(--color-border))'
              }}
            >
              <h3 className="text-lg font-semibold mb-3">{faq.q}</h3>
              <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          Ready to Simplify Your Medicine Management?
        </h2>
        <p
          className="text-lg mb-8"
          style={{ color: 'rgb(var(--color-muted-foreground))' }}
        >
          Join thousands organizing their healthcare with MediTrack
        </p>
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-lg font-medium transition-all hover:opacity-90"
          style={{
            backgroundColor: 'rgb(var(--color-primary))',
            color: 'rgb(var(--color-primary-foreground))'
          }}
        >
          Create Your Account
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer
        className="border-t py-12"
        style={{ borderColor: 'rgb(var(--color-border))' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Pill className="w-6 h-6" style={{ color: 'rgb(var(--color-primary))' }} />
                <span className="font-bold">MediTrack</span>
              </div>
              <p style={{ color: 'rgb(var(--color-muted-foreground))' }}>
                Simple medicine management for modern families
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <div className="space-y-2">
                <a href="#features" className="block hover:opacity-80" style={{ color: 'rgb(var(--color-muted-foreground))' }}>Features</a>
                <a href="#how-it-works" className="block hover:opacity-80" style={{ color: 'rgb(var(--color-muted-foreground))' }}>How It Works</a>
                <a href="#family-care" className="block hover:opacity-80" style={{ color: 'rgb(var(--color-muted-foreground))' }}>Family Care</a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <div className="space-y-2">
                <a href="#faq" className="block hover:opacity-80" style={{ color: 'rgb(var(--color-muted-foreground))' }}>FAQ</a>
                <span className="block" style={{ color: 'rgb(var(--color-muted-foreground))' }}>Contact: support@meditrack.example</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <div className="space-y-2">
                <a href="#" className="block hover:opacity-80" style={{ color: 'rgb(var(--color-muted-foreground))' }}>Privacy Policy</a>
                <a href="#" className="block hover:opacity-80" style={{ color: 'rgb(var(--color-muted-foreground))' }}>Terms of Service</a>
              </div>
            </div>
          </div>

          <div
            className="pt-8 border-t text-center"
            style={{
              borderColor: 'rgb(var(--color-border))',
              color: 'rgb(var(--color-muted-foreground))'
            }}
          >
            <p>© 2026 MediTrack. For organizational and informational purposes only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
