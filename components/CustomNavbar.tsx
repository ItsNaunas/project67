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
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';

interface CustomNavbarProps {
  onSignInClick?: () => void;
  onGetStartedClick?: () => void;
}

export function CustomNavbar({ onSignInClick, onGetStartedClick }: CustomNavbarProps) {
  const session = useSession();
  const supabase = useSupabaseClient();
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
    if (onGetStartedClick) {
      onGetStartedClick();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <NavbarButton variant="secondary" onClick={() => router.push('/dashboard')}>
                  Dashboard
                </NavbarButton>
                <NavbarButton variant="gradient" onClick={() => router.push('/generate')}>
                  Create New
                </NavbarButton>
                <NavbarButton variant="ghost" onClick={handleSignOut}>
                  Sign Out
                </NavbarButton>
              </>
            ) : (
              <>
                <NavbarButton variant="secondary" onClick={handleSignIn}>
                  Sign In
                </NavbarButton>
                <NavbarButton variant="gradient" onClick={handleGetStarted}>
                  Get Started
                </NavbarButton>
              </>
            )}
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
              {session ? (
                <>
                  <NavbarButton 
                    variant="secondary" 
                    onClick={() => { router.push('/dashboard'); setIsMobileMenuOpen(false); }} 
                    className="w-full block text-center"
                  >
                    Dashboard
                  </NavbarButton>
                  <NavbarButton 
                    variant="primary" 
                    onClick={() => { router.push('/generate'); setIsMobileMenuOpen(false); }} 
                    className="w-full block text-center"
                  >
                    Create New
                  </NavbarButton>
                  <NavbarButton 
                    variant="ghost" 
                    onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }} 
                    className="w-full block text-center"
                  >
                    Sign Out
                  </NavbarButton>
                </>
              ) : (
                <>
                  <NavbarButton 
                    variant="secondary" 
                    onClick={handleSignIn} 
                    className="w-full block text-center"
                  >
                    Sign In
                  </NavbarButton>
                  <NavbarButton 
                    variant="primary" 
                    onClick={handleGetStarted} 
                    className="w-full block text-center"
                  >
                    Get Started
                  </NavbarButton>
                </>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}

