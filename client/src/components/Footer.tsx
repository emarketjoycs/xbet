import { Link } from 'wouter';
import { Github, Twitter, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background/50 backdrop-blur-sm mt-auto">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/">
              <a className="flex items-center gap-2 mb-4 group w-fit">
                <img src="/images/dxbet-logo.png" alt="DxBet" className="w-10 h-10 object-contain" />
                <span className="text-xl font-bold tracking-tighter text-white">
                  DxBet
                </span>
              </a>
            </Link>
            <p className="text-muted-foreground max-w-xs text-sm leading-relaxed font-mono">
              DxBet: Plataforma de apostas descentralizada P2P na Polygon PoS. 
              Odds dinâmicas, transparência total e pagamentos automatizados via Smart Contracts.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-bold uppercase tracking-wider mb-4 text-sm">Plataforma</h3>
            <ul className="space-y-2 text-sm font-mono">
              <li>
                <Link href="/">
                  <a className="text-muted-foreground hover:text-primary transition-colors">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/how-to-bet">
                  <a className="text-muted-foreground hover:text-primary transition-colors">Como Apostar</a>
                </Link>
              </li>
              <li>
                <Link href="/whitepaper">
                  <a className="text-muted-foreground hover:text-primary transition-colors">Whitepaper</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold uppercase tracking-wider mb-4 text-sm">Comunidade</h3>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-mono">
          <p>&copy; 2025 DxBet Decentralized Protocol. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>Polygon PoS Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
