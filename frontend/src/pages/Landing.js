import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Lenis from 'lenis';
import { Button } from '@/components/ui/button';
import { FileText, Search, Brain, TrendingUp, Users, Shield } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="font-serif text-2xl font-bold text-zinc-950">ResearchHub</div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/auth')}
                data-testid="nav-login-btn"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate('/auth?mode=register')}
                data-testid="nav-signup-btn"
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-12 overflow-hidden noise">
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.15) 0%, transparent 50%)'
            }}
          />
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <div className="space-y-6">
                <div className="inline-block">
                  <div className="text-xs font-mono uppercase tracking-widest text-primary px-4 py-2 border border-primary/20 rounded-md bg-primary/5">
                    Research Intelligence Platform
                  </div>
                </div>
                <h1 className="font-serif text-5xl lg:text-6xl font-bold text-zinc-950 tracking-tight leading-tight">
                  Transform Documents Into Strategic Insights
                </h1>
                <p className="text-lg text-zinc-600 leading-relaxed max-w-xl">
                  Upload, analyze, and extract intelligence from thousands of research papers, reports, and filings with AI-powered precision.
                </p>
                <div className="flex items-center gap-4 pt-4">
                  <Button
                    size="lg"
                    onClick={() => navigate('/auth?mode=register')}
                    data-testid="hero-get-started-btn"
                    className="bg-primary hover:bg-primary/90 text-white h-12 px-8 text-base transition-all duration-200 hover:scale-[1.02]"
                  >
                    Start Analyzing
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate('/auth')}
                    data-testid="hero-signin-btn"
                    className="h-12 px-8 text-base"
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1765046255478-55efc763637c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2ODh8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRhdGElMjB2aXN1YWxpemF0aW9uJTIwbWluaW1hbHxlbnwwfHx8fDE3NzA3Mjg1MjN8MA&ixlib=rb-4.1.0&q=85"
                  alt="Abstract 3D Data Visualization"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 lg:px-12 bg-zinc-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-mono uppercase tracking-widest text-primary mb-4">FEATURES</div>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-zinc-950 mb-6">
              Built for Modern Research
            </h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              Everything you need to manage, analyze, and extract insights from your research documents
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-white border border-zinc-200 rounded-lg p-8 hover:border-primary/50 transition-all duration-200" data-testid="feature-document-management">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold text-zinc-950 mb-3">Document Management</h3>
              <p className="text-zinc-600 leading-relaxed">
                Upload and organize PDFs, reports, and filings by company, industry, or custom categories
              </p>
            </div>

            <div className="group bg-white border border-zinc-200 rounded-lg p-8 hover:border-primary/50 transition-all duration-200" data-testid="feature-smart-search">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold text-zinc-950 mb-3">Smart Search</h3>
              <p className="text-zinc-600 leading-relaxed">
                Find exactly what you need with full-text search across all your documents
              </p>
            </div>

            <div className="group bg-white border border-zinc-200 rounded-lg p-8 hover:border-primary/50 transition-all duration-200" data-testid="feature-ai-analysis">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold text-zinc-950 mb-3">AI Analysis</h3>
              <p className="text-zinc-600 leading-relaxed">
                Ask questions and get instant answers from your documents using advanced AI
              </p>
            </div>

            <div className="group bg-white border border-zinc-200 rounded-lg p-8 hover:border-primary/50 transition-all duration-200" data-testid="feature-insights">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold text-zinc-950 mb-3">Insights Dashboard</h3>
              <p className="text-zinc-600 leading-relaxed">
                Track your research activity and visualize trends across companies and industries
              </p>
            </div>

            <div className="group bg-white border border-zinc-200 rounded-lg p-8 hover:border-primary/50 transition-all duration-200" data-testid="feature-collaboration">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold text-zinc-950 mb-3">Team Ready</h3>
              <p className="text-zinc-600 leading-relaxed">
                Built to scale from individual researchers to enterprise teams
              </p>
            </div>

            <div className="group bg-white border border-zinc-200 rounded-lg p-8 hover:border-primary/50 transition-all duration-200" data-testid="feature-security">
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold text-zinc-950 mb-3">Secure & Private</h3>
              <p className="text-zinc-600 leading-relaxed">
                Your research data is encrypted and securely stored with enterprise-grade security
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-zinc-950 mb-6">
            Ready to Transform Your Research?
          </h2>
          <p className="text-lg text-zinc-600 mb-8">
            Join researchers and analysts who are already saving hours with AI-powered document analysis
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/auth?mode=register')}
            data-testid="cta-get-started-btn"
            className="bg-primary hover:bg-primary/90 text-white h-12 px-8 text-base transition-all duration-200 hover:scale-[1.02]"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="font-serif text-xl font-bold text-zinc-950">ResearchHub</div>
            <p className="text-sm text-zinc-600">© 2026 ResearchHub. Built for researchers, by researchers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}