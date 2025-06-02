
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Users, BarChart3, Shield, CheckCircle } from "lucide-react";

const LandingPage = () => {
  const redirectToDashboard = () => {
    window.location.href = 'https://dashboard.refspring.com';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="font-bold text-2xl text-slate-900">
              RefSpring
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Pricing
              </a>
              <a href="#contact" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Contact
              </a>
            </nav>
            <Button variant="outline" className="hidden md:flex" onClick={redirectToDashboard}>
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Full Viewport */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <CheckCircle className="w-4 h-4" />
              No monthly fees • Pay only when you earn
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold text-slate-900 leading-tight mb-8">
              The affiliate platform
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                that pays for itself
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Unlike other platforms charging €99-299/month, RefSpring uses a <strong>revenue-based model</strong>: 
              <br />
              <span className="text-slate-900 font-semibold">100% free access, we only earn when you do.</span>
            </p>

            {/* Value props */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-slate-700 font-medium">No setup fees</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-slate-700 font-medium">No monthly subscription</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-slate-700 font-medium">Full platform access</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="text-lg px-10 py-6 bg-blue-600 hover:bg-blue-700 shadow-xl hover:shadow-2xl transition-all" onClick={redirectToDashboard}>
                Start earning today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-10 py-6 border-2 hover:bg-slate-50 shadow-lg" onClick={redirectToDashboard}>
                See how it works
              </Button>
            </div>

            {/* Social proof */}
            <div className="mt-16 pt-8 border-t border-slate-200">
              <p className="text-slate-500 text-sm mb-4">Trusted by companies who want results, not recurring bills</p>
              <div className="flex justify-center items-center gap-8 opacity-60">
                <div className="text-2xl font-bold text-slate-400">€2.1M+</div>
                <div className="w-px h-8 bg-slate-300"></div>
                <div className="text-2xl font-bold text-slate-400">Generated</div>
                <div className="w-px h-8 bg-slate-300"></div>
                <div className="text-2xl font-bold text-slate-400">€0</div>
                <div className="w-px h-8 bg-slate-300"></div>
                <div className="text-2xl font-bold text-slate-400">Upfront</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful tools designed to help you build and manage successful affiliate programs at scale.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Zap className="h-8 w-8 text-blue-600" />,
                title: "Lightning Fast",
                description: "Set up your affiliate program in minutes, not weeks."
              },
              {
                icon: <Users className="h-8 w-8 text-green-600" />,
                title: "Recruit Affiliates",
                description: "Find and onboard top-performing affiliates effortlessly."
              },
              {
                icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
                title: "Advanced Analytics",
                description: "Track performance with real-time insights and reporting."
              },
              {
                icon: <Shield className="h-8 w-8 text-orange-600" />,
                title: "Fraud Protection",
                description: "Advanced security to protect against fraudulent activities."
              }
            ].map((feature, index) => (
              <div key={index} className="p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-16">
            Trusted by industry leaders
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { number: "10K+", label: "Active Campaigns" },
              { number: "€50M+", label: "Revenue Generated" },
              { number: "99.9%", label: "Uptime" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-xl text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to grow your business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of companies using RefSpring to scale their affiliate programs.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6" onClick={redirectToDashboard}>
            Get started for free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="font-bold text-2xl text-white mb-4">RefSpring</div>
              <p className="text-slate-400">
                The modern affiliate management platform.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 RefSpring. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
