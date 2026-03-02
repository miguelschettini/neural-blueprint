import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Cpu, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Terminal, 
  BookOpen, 
  MessageSquare,
  Star,
  Download,
} from 'lucide-react';

// Components
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { PixModal } from './components/PixModal';
import { AdminPanel } from './components/AdminPanel';
import { FeatureCard } from './components/FeatureCard';
import { FAQItem } from './components/FAQItem';
import { Marquee } from './components/Marquee';

// Types
import { User } from './types';

export default function App() {
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setUser(null);
        setIsAuthLoading(false);
        return;
      }

      const res = await fetch('/api/auth/me', { 
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const contentType = res.headers.get("content-type");
      if (!res.ok || !contentType || !contentType.includes("application/json")) {
        console.warn('checkAuth: Resposta não é JSON ou erro no servidor', res.status);
        setUser(null);
        localStorage.removeItem('auth_token');
        return;
      }

      const data = await res.json();
      setUser(data.user);
      if (!data.user) {
        localStorage.removeItem('auth_token');
      }
    } catch (e) {
      console.error('Erro crítico no checkAuth:', e);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setUser(null);
  }, []);

  const handlePayment = async () => {
    if (isAuthLoading || isLoading) return;

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (user.hasPurchased) {
      alert('Você já adquiriu este produto! O link de acesso foi enviado ao seu e-mail.');
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/pix/create-charge', { 
        method: 'POST', 
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPixData(data);
      setIsPixModalOpen(true);
    } catch (e: any) {
      console.error('Payment error:', e);
      alert(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#050505]">
      <div className="grid-overlay opacity-20" />
      
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onOpenAuth={() => setIsAuthModalOpen(true)} 
        onHandlePayment={handlePayment} 
        onOpenAdmin={() => setIsAdminModalOpen(true)} 
      />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onAuthSuccess={checkAuth} 
      />

      <AdminPanel 
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />

      <PixModal 
        isOpen={isPixModalOpen} 
        onClose={() => setIsPixModalOpen(false)} 
        pixData={pixData} 
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/20 mb-8"
          >
            <Sparkles className="w-4 h-4 text-neon-green" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neon-green">Neural_Blueprint_v2.5_Active</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-display font-bold uppercase tracking-tighter mb-8 leading-[0.9]"
          >
            Domine a <span className="text-neon-green">Engenharia</span> <br />
            de Prompts de Elite
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 max-w-2xl mx-auto text-lg mb-12 font-light leading-relaxed"
          >
            O guia definitivo para transformar IAs em ferramentas de alta performance. 
            Aprenda os protocolos secretos utilizados pelos maiores especialistas do mundo.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <button 
              onClick={handlePayment}
              disabled={isLoading}
              className="group relative px-10 py-5 bg-neon-green text-black font-bold uppercase text-xs tracking-[0.2em] hover:scale-105 transition-all flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              {isLoading ? 'Processando...' : 'Adquirir Acesso Vitalício'}
              <ArrowRight className="w-4 h-4" />
            </button>
            <a href="#preview" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors flex items-center gap-2">
              Ver Protocolos de Aula <ChevronDown className="w-3 h-3" />
            </a>
          </motion.div>
        </div>
      </section>

      <Marquee />

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Terminal}
              title="Sintaxe de Elite"
              description="Domine frameworks avançados como Chain-of-Thought e Few-Shot Prompting para resultados cirúrgicos."
            />
            <FeatureCard 
              icon={Cpu}
              title="Lógica Neural"
              description="Entenda como os LLMs processam informações e aprenda a hackear a árvore de probabilidade da IA."
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Protocolos Seguros"
              description="Aprenda a criar prompts que evitam alucinações e garantem a consistência dos dados em escala."
            />
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section id="preview" className="py-32 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-20 items-center">
            <div className="flex-1">
              <h2 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tighter mb-8 leading-none">
                O Que Você Vai <br /> <span className="text-neon-green">Desbloquear</span>
              </h2>
              <div className="space-y-6">
                {[
                  'Framework de Prompting Estruturado (FPS)',
                  'Técnicas de Injeção de Contexto Dinâmico',
                  'Otimização de Tokens para Performance',
                  'Biblioteca com +500 Prompts de Alta Conversão',
                  'Acesso ao Grupo Privado de Operadores'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-2 h-2 bg-neon-green rounded-full group-hover:scale-150 transition-transform" />
                    <span className="text-white/60 uppercase text-xs font-bold tracking-widest group-hover:text-white transition-colors">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="absolute -inset-4 bg-neon-green/20 blur-3xl rounded-full opacity-20" />
              <div className="relative glass-panel p-2 rounded-xl border border-white/10 overflow-hidden">
                <div className="bg-[#050505] rounded-lg p-8 aspect-video flex flex-col justify-between border border-white/5">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/20" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                      <div className="w-3 h-3 rounded-full bg-green-500/20" />
                    </div>
                    <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Neural_Blueprint_Terminal</div>
                  </div>
                  <div className="space-y-4 font-mono">
                    <p className="text-neon-green text-xs">{">"} Initializing_Elite_Protocol...</p>
                    <p className="text-white/40 text-[10px]">{"["}OK{"]"} Neural_Weights_Loaded</p>
                    <p className="text-white/40 text-[10px]">{"["}OK{"]"} Prompt_Engine_Optimized</p>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-full bg-neon-green"
                      />
                    </div>
                  </div>
                  <div className="mt-8 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-white/40" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest">Módulo 01</p>
                      <p className="text-[8px] text-white/20 uppercase tracking-widest">Fundamentos da Lógica Neural</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-green/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-xl mx-auto text-center relative z-10">
          <div className="glass-panel p-12 rounded-2xl border border-neon-green/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-neon-green text-black px-4 py-1 text-[8px] font-black uppercase tracking-widest">Oferta_Limitada</div>
            
            <h3 className="text-2xl font-display font-bold uppercase tracking-tight mb-2">Neural Blueprint</h3>
            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-8">Acesso Completo + Bônus</p>
            
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="text-white/20 text-xl line-through font-light">R$ 197</span>
              <span className="text-6xl font-display font-bold text-white tracking-tighter">R$ 29<span className="text-2xl">,90</span></span>
            </div>
            
            <div className="space-y-4 mb-10 text-left">
              {[
                'Curso Completo em Vídeo',
                'Biblioteca de Prompts Profissionais',
                'Templates de Estruturação',
                'Certificado de Conclusão',
                'Suporte Prioritário'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-neon-green" />
                  <span className="text-[10px] uppercase tracking-widest text-white/60">{item}</span>
                </div>
              ))}
            </div>
            
            <button 
              onClick={handlePayment}
              disabled={isLoading}
              className="w-full py-5 bg-neon-green text-black font-bold uppercase text-xs tracking-[0.2em] hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
            >
              {isLoading ? 'Iniciando Protocolo...' : 'Ativar Acesso Agora'}
              <Zap className="w-4 h-4 fill-current" />
            </button>
            
            <p className="mt-6 text-[8px] text-white/20 uppercase tracking-widest flex items-center justify-center gap-2">
              <ShieldCheck className="w-3 h-3" /> Pagamento Seguro via Banco Efí
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-display font-bold uppercase tracking-tighter mb-4">Dúvidas Frequentes</h2>
            <p className="text-white/40 text-xs uppercase tracking-[0.3em]">Protocolos de Suporte ao Operador</p>
          </div>
          
          <div className="space-y-4">
            <FAQItem 
              question="Preciso saber programar?"
              answer="Não. O Neural Blueprint foca na lógica de comunicação com a IA. Embora usemos conceitos técnicos, qualquer pessoa pode aplicar os métodos."
            />
            <FAQItem 
              question="O acesso é vitalício?"
              answer="Sim. Uma vez adquirido, você terá acesso a todas as atualizações futuras sem custos adicionais."
            />
            <FAQItem 
              question="Funciona com qualquer IA?"
              answer="Sim. Os princípios de engenharia de prompts são universais e funcionam no ChatGPT, Claude, Gemini e modelos locais."
            />
            <FAQItem 
              question="Como recebo o conteúdo?"
              answer="Imediatamente após a confirmação do pagamento via Pix, você receberá os links de acesso no seu e-mail cadastrado."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-white/10 flex items-center justify-center rounded-sm">
              <Zap className="text-white w-4 h-4" />
            </div>
            <span className="font-display text-sm font-bold tracking-tight uppercase">PromptMaster <span className="text-white/20">© 2026</span></span>
          </div>
          
          <div className="flex gap-8 text-[8px] font-bold uppercase tracking-widest text-white/20">
            <a href="#" className="hover:text-neon-green transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-neon-green transition-colors">Privacidade</a>
            <a href="#" className="hover:text-neon-green transition-colors">Suporte</a>
          </div>
          
          <div className="flex gap-4">
            <button className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center hover:border-neon-green/30 transition-colors">
              <Star className="w-3 h-3 text-white/20" />
            </button>
            <button className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center hover:border-neon-green/30 transition-colors">
              <MessageSquare className="w-3 h-3 text-white/20" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);
