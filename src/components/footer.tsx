import {
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="bg-card/50 border-t border-border px-6 py-8 ">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          {/* Brand Section */}
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Empowering students with AI-powered learning tools for better
              education outcomes.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Product</h3>
            <div className="space-y-2">
              <a
                href="/features"
                className="block text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                Features
              </a>
              <a
                href="#"
                className="block text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                AI Quiz Generator
              </a>
              <a
                href="#"
                className="block text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                Study Assistant
              </a>
              <a
                href="#"
                className="block text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                Progress Tracking
              </a>
            </div>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Support</h3>
            <div className="space-y-2">
              <a
                href="#"
                className="block text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                Help Center
              </a>
              <a
                href="#"
                className="block text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                Documentation
              </a>
              <a
                href="#"
                className="block text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                Contact Us
              </a>
              <a
                href="#"
                className="block text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                Community
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@eduai.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            © 2025 EduMind Platform. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
