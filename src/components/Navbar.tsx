import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  User, 
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  user: UserType | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  onHandlePayment: () => void;
  onOpenAdmin: () => void;
}

export const Navbar = ({ user, onLogout, onOpenAuth, onHandlePayment, onOpenAdmin }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatName = (fullName: string) => {
    if (!fullName) return '';
    const first = fullName.trim().split(' ')[0];
    return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel px-6 py-4 sm:py-5">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neon-green flex items-center justify-center rounded-sm">
            <Zap className="text-black w-5 h-5" />
          </div>
          <span className="font-display text-lg sm:text-xl font-bold tracking-tight uppercase">Prompt<span className="text-neon-green">Master</span></span>
        </div>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
          <a href="#features" className="hover:text-white transition-colors">O Método</a>
          <a href="#preview" className="hover:text-white transition-colors">Conteúdo</a>
          <a href="#pricing" className="hover:text-white transition-colors">Preço</a>
          {user ? (
            <div className="flex items-center gap-4 pl-6 border-l border-white/10">
              <div className="flex items-center gap-2 text-neon-green">
                <div className="w-6 h-6 rounded-full bg-neon-green/10 flex items-center justify-center">
                  <User className="w-3 h-3" />
                </div>
                <span className="max-w-[120px] truncate">
                  {user.full_name ? formatName(user.full_name) : user.email.split('@')[0]}
                </span>
              </div>
              <button 
                onClick={onLogout} 
                className="p-2 text-white/20 hover:text-red-500 transition-colors"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
              {user.is_admin === 1 && (
                <button 
                  onClick={onOpenAdmin}
                  className="ml-2 px-3 py-1 bg-neon-green/10 border border-neon-green/20 text-neon-green rounded-sm hover:bg-neon-green hover:text-black transition-all"
                >
                  Admin
                </button>
              )}
            </div>
          ) : (
            <button onClick={onOpenAuth} className="text-white hover:text-neon-green transition-colors">Entrar</button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!user?.hasPurchased && (
            <a 
              href="#pricing" 
              className="hidden sm:block bg-white text-black px-6 py-2 rounded-sm font-bold uppercase text-[10px] tracking-[0.1em] hover:bg-neon-green transition-colors"
            >
              Começar Agora
            </a>
          )}
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-black/95 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
              <a href="#features" onClick={() => setIsMenuOpen(false)} className="hover:text-neon-green transition-colors">O Método</a>
              <a href="#preview" onClick={() => setIsMenuOpen(false)} className="hover:text-neon-green transition-colors">Conteúdo</a>
              <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="hover:text-neon-green transition-colors">Preço</a>
              {user ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-neon-green/10 flex items-center justify-center">
                      <User className="text-neon-green w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white text-xs font-bold">
                        {user.full_name ? formatName(user.full_name) : user.email.split('@')[0]}
                      </span>
                      <span className="text-white/40 text-[8px] uppercase tracking-widest">Sessão Ativa</span>
                    </div>
                  </div>
                  {user.hasPurchased && (
                    <button onClick={() => { onHandlePayment(); setIsMenuOpen(false); }} className="w-full bg-neon-green text-black py-4 text-center rounded-sm font-bold uppercase text-[10px] tracking-widest">Acessar Produto</button>
                  )}
                  <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="w-full text-left p-4 text-red-500/60 hover:text-red-500 transition-colors border border-red-500/10 rounded-lg flex items-center gap-3 font-bold uppercase text-[10px] tracking-widest">
                    <LogOut className="w-4 h-4" /> Sair da Conta
                  </button>
                  {user.is_admin === 1 && (
                    <button onClick={() => { onOpenAdmin(); setIsMenuOpen(false); }} className="w-full bg-neon-green/10 text-neon-green py-4 text-center rounded-sm font-bold uppercase text-[10px] tracking-widest border border-neon-green/20">Painel Admin</button>
                  )}
                </div>
              ) : (
                <>
                  <button onClick={() => { onOpenAuth(); setIsMenuOpen(false); }} className="text-left p-4 hover:text-neon-green transition-colors">Entrar</button>
                  <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="bg-neon-green text-black py-4 text-center rounded-sm font-bold uppercase text-[10px] tracking-widest">Começar Agora</a>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
