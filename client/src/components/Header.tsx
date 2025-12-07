import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export default function Header() {
  const [location, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isConnected } = useAccount();

  // Redirecionar para dashboard quando conectar
  useEffect(() => {
    if (isConnected && location === '/') {
      navigate('/dashboard');
    }
  }, [isConnected, location, navigate]);

  const navItems = [
    { label: 'HOME', path: '/' },
    { label: 'DASHBOARD', path: '/dashboard', hidden: !isConnected },
    { label: 'COMO APOSTAR', path: '/how-to-bet' },
    { label: 'WHITEPAPER', path: '/whitepaper' },
  ].filter(item => !item.hidden);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center gap-2 group">
            <img src="/images/dxbet-logo.png" alt="DxBet" className="w-12 h-12 object-contain" />
            <span className="text-2xl font-bold tracking-tighter text-white group-hover:text-primary transition-colors hidden sm:inline">
              DxBet
            </span>
          </a>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.filter(item => !item.hidden).map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary uppercase tracking-widest relative py-1",
                  location === item.path 
                    ? "text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-primary after:shadow-[0_0_10px_var(--primary)]" 
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </a>
            </Link>
          ))}
        </nav>

        {/* Connect Wallet & Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <ConnectButton 
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
              }}
              showBalance={{
                smallScreen: false,
                largeScreen: true,
              }}
            />
          </div>
          
          <button 
            className="md:hidden text-white hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-background border-b border-border p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
          <nav className="flex flex-col gap-4">
            {navItems.filter(item => !item.hidden).map((item) => (
              <Link key={item.path} href={item.path}>
                <a
                  className={cn(
                    "text-lg font-medium transition-colors hover:text-primary uppercase tracking-widest p-2 border-l-2",
                    location === item.path 
                      ? "text-primary border-primary bg-primary/5" 
                      : "text-muted-foreground border-transparent"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-border flex justify-center">
            <ConnectButton />
          </div>
        </div>
      )}
    </header>
  );
}
