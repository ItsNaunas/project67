"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import { useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';

interface CustomNavbarProps {
  onSignInClick?: () => void;
}

export function CustomNavbar({ onSignInClick }: CustomNavbarProps) {
  const session = useSession();
  const router = useRouter();
  const navItems = [
    { name: "Features", link: "#features" },
    { name: "How It Works", link: "#how-it-works" },
    { name: "Pricing", link: "#pricing" },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignIn = () => {
    if (onSignInClick) {
      onSignInClick();
    }
  };

  const handleGetStarted = () => {
    // Always open auth modal for signup
    handleSignIn();
  };

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            <NavbarButton variant="secondary" onClick={handleSignIn}>
              Sign In
            </NavbarButton>
            <NavbarButton variant="gradient" onClick={handleGetStarted}>
              Get Started
            </NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={idx}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-300 hover:text-mint-400 text-lg"
              >
                {item.name}
              </a>
            ))}
            <div className="w-full pt-4 space-y-2">
              <NavbarButton variant="secondary" onClick={handleSignIn} className="w-full block text-center">
                Sign In
              </NavbarButton>
              <NavbarButton variant="primary" onClick={handleGetStarted} className="w-full block text-center">
                Get Started
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}

