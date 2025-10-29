import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { 
  Home,
  FolderKanban,
  Sparkles,
  LogOut
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const session = useSession();
  const supabase = useSupabaseClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const links = [
    {
      label: "Home",
      href: "/",
      icon: <Home className="h-5 w-5 shrink-0 text-gray-400" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        router.push('/');
      },
    },
    {
      label: "Projects",
      href: "/dashboard",
      icon: <FolderKanban className="h-5 w-5 shrink-0 text-gray-400" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        router.push('/dashboard');
      },
    },
    {
      label: "Credits",
      href: "#credits",
      icon: <Sparkles className="h-5 w-5 shrink-0 text-mint-400" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        // Future: Open credits modal
      },
    },
    {
      label: "Sign Out",
      href: "#",
      icon: <LogOut className="h-5 w-5 shrink-0 text-gray-400" />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        handleSignOut();
      },
    },
  ];

  return (
    <div className="flex w-full h-screen overflow-hidden bg-black">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <div 
                  key={idx}
                  onClick={link.onClick}
                >
                  <SidebarLink link={link} />
                </div>
              ))}
            </div>
          </div>
          {session?.user && (
            <div className="border-t border-white/10 pt-4">
              <SidebarLink
                link={{
                  label: session.user.email?.split('@')[0] || "User",
                  href: "#",
                  icon: (
                    <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-mint-400 to-mint-600 flex items-center justify-center text-white text-xs font-bold">
                      {session.user.email?.[0].toUpperCase()}
                    </div>
                  ),
                }}
              />
            </div>
          )}
        </SidebarBody>
      </Sidebar>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}

const Logo = () => {
  return (
    <a
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal"
    >
      <div className="h-7 w-7 shrink-0 rounded-lg bg-gradient-to-br from-mint-400 to-mint-600" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-clash font-bold text-white text-lg whitespace-pre"
      >
        Project 67
      </motion.span>
    </a>
  );
};

const LogoIcon = () => {
  return (
    <a
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1"
    >
      <div className="h-7 w-7 shrink-0 rounded-lg bg-gradient-to-br from-mint-400 to-mint-600" />
    </a>
  );
};

