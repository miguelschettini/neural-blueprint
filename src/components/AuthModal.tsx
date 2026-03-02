import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

export const AuthModal = ({ isOpen, onClose, onAuthSuccess }: AuthModalProps) => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      setError('Por favor, insira seu e-mail primeiro.');
      return;
    }
    setError('');
    setSendingCode(true);
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: authMode === 'forgot' ? 'reset' : 'register' }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setIsCodeSent(true);
      alert('Código enviado para o seu e-mail!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (authMode === 'register' || authMode === 'forgot') {
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        return;
      }
      if (!isCodeSent) {
        setError('Por favor, solicite e insira o código de verificação.');
        return;
      }
    }

    setLoading(true);
    try {
      let endpoint = '';
      let body = {};

      if (authMode === 'login') {
        endpoint = '/api/auth/login';
        body = { email, password };
      } else if (authMode === 'register') {
        endpoint = '/api/auth/register';
        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        body = { email, password, fullName, code };
      } else if (authMode === 'forgot') {
        endpoint = '/api/auth/reset-password';
        body = { email, code, newPassword: password };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      if (authMode === 'forgot') {
        alert('Senha redefinida com sucesso! Agora você pode entrar.');
        setAuthMode('login');
        setIsCodeSent(false);
        setCode('');
        setPassword('');
        setConfirmPassword('');
      } else {
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        await onAuthSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-center justify-center px-6 bg-black/90 backdrop-blur-xl"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#0a0a0a] border border-white/10 p-8 rounded-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
        >
          <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white">
            <X className="w-6 h-6" />
          </button>

          <div className="text-center mb-8">
            <h3 className="text-2xl font-display font-bold uppercase tracking-tight">
              {authMode === 'login' ? 'Acessar Conta' : authMode === 'register' ? 'Criar Nova Conta' : 'Recuperar Senha'}
            </h3>
            <p className="text-white/40 text-xs mt-2">
              {authMode === 'login' ? 'Entre para gerenciar seus acessos' : authMode === 'register' ? 'Cadastre-se para adquirir o Neural Blueprint' : 'Enviaremos um código para seu e-mail'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block">Nome</label>
                  <input 
                    type="text" 
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-green outline-none transition-all"
                    placeholder="Ex: João"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block">Sobrenome</label>
                  <input 
                    type="text" 
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-green outline-none transition-all"
                    placeholder="Ex: Silva"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block">E-mail</label>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-green outline-none transition-all"
                  placeholder="seu@email.com"
                />
                {authMode !== 'login' && (
                  <button 
                    type="button"
                    onClick={handleSendCode}
                    disabled={sendingCode}
                    className="px-4 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-white/20 transition-all disabled:opacity-50"
                  >
                    {sendingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : (isCodeSent ? 'Reenviar' : 'Verificar')}
                  </button>
                )}
              </div>
            </div>

            {authMode !== 'login' && isCodeSent && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block">Código de Verificação</label>
                <input 
                  type="text" 
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-green outline-none transition-all"
                  placeholder="000000"
                />
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">
                  {authMode === 'forgot' ? 'Nova Senha' : 'Senha'}
                </label>
                {authMode === 'login' && (
                  <button 
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot');
                      setError('');
                      setIsCodeSent(false);
                    }}
                    className="text-[9px] font-bold uppercase tracking-widest text-neon-green hover:text-neon-green/80 transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-green outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {authMode !== 'login' && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block">Confirmar {authMode === 'forgot' ? 'Nova ' : ''}Senha</label>
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-green outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            )}

            {error && <p className="text-red-500 text-[10px] font-bold uppercase text-center">{error}</p>}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-neon-green text-black font-bold uppercase text-xs tracking-widest rounded-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {authMode === 'login' ? 'Entrar' : authMode === 'register' ? 'Finalizar Cadastro' : 'Redefinir Senha'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <button 
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setError('');
                setIsCodeSent(false);
              }}
              className="text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors block w-full"
            >
              {authMode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre aqui'}
            </button>
            {authMode === 'forgot' && (
              <button 
                onClick={() => {
                  setAuthMode('login');
                  setError('');
                  setIsCodeSent(false);
                }}
                className="text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors block w-full"
              >
                Voltar para o Login
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
