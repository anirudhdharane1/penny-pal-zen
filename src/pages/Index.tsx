import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FeatureCard } from "@/components/FeatureCard";
import { useNavigate } from "react-router-dom";
import { 
  Wallet, 
  TrendingUp, 
  Target, 
  PieChart, 
  Shield, 
  Zap,
  ArrowRight,
  Sparkles
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: PieChart,
      title: "Smart Dashboard",
      description: "Get a complete overview of your finances with beautiful, interactive charts and insights at a glance.",
      gradient: "from-primary to-accent"
    },
    {
      icon: Wallet,
      title: "Budget Tracking",
      description: "Set budgets per category and track your spending with real-time progress indicators and alerts.",
      gradient: "from-income to-income/80"
    },
    {
      icon: Target,
      title: "Goal Planning",
      description: "Set financial goals and watch your progress. Our smart system helps prioritize your savings automatically.",
      gradient: "from-success to-success/80"
    },
    {
      icon: TrendingUp,
      title: "Income Management",
      description: "Track multiple income sources and visualize your earning trends over time with detailed analytics.",
      gradient: "from-warning to-warning/80"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your financial data is encrypted and secure. We prioritize your privacy above everything else.",
      gradient: "from-primary to-primary/80"
    },
    {
      icon: Zap,
      title: "Real-time Insights",
      description: "Get instant updates on your spending patterns and receive smart recommendations to optimize your budget.",
      gradient: "from-accent to-accent/80"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-4 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Your Financial Wellness Companion</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold animate-fade-in">
              Welcome to{" "}
              <span className="gradient-text">PennyPal</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
              Take control of your finances with beautiful visualizations, 
              smart budgeting, and goal tracking designed for students and professionals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
              <Button size="xl" variant="hero" className="group" onClick={() => navigate("/auth")}>
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="xl" variant="outline">
                Learn More
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 pt-8 text-sm text-muted-foreground animate-fade-in">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                Free to Start
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-income" />
                Secure & Private
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-warning" />
                Easy to Use
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to{" "}
              <span className="gradient-text">Manage Money</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed to help you understand your finances, 
              track spending, and achieve your financial goals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card/50 to-primary/5 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
              <div className="relative p-12 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Ready to Transform Your Financial Life?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of users who are taking control of their finances 
                  with PennyPal. Start your journey to financial wellness today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                  <Button size="xl" variant="hero" className="animate-glow" onClick={() => navigate("/auth")}>
                    Start Your Journey
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                  <Button size="xl" variant="ghost">
                    Contact Support
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="gradient-text font-bold text-lg">PennyPal</span>
              <span>© 2024 All rights reserved</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
