import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  Loader2, 
  Copy 
} from 'lucide-react';

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
  pixData: any;
}

export const PixModal = ({ isOpen, onClose, pixData }: PixModalProps) => {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState('PENDING');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !pixData?.txid) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/pix/status/${pixData.txid}`);
        const data = await res.json();
        if (data.status === 'CONCLUIDA') {
          setStatus('SUCCESS');
          clearInterval(interval);
        }
      } catch (e) {
        console.error('Status check error:', e);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, pixData]);

  const copyToClipboard = () => {
    if (pixData?.qrcode) {
      navigator.clipboard.writeText(pixData.qrcode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] overflow-y-auto bg-black/90 backdrop-blur-xl"
      >
        <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="w-full max-w-md bg-[#0a0a0a] border border-white/10 p-8 rounded-2xl relative overflow-hidden"
          >
            <div className="hud-corner hud-corner-tl opacity-30" />
            <div className="hud-corner hud-corner-br opacity-30" />
            
            <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors z-10">
              <X className="w-6 h-6" />
            </button>

            {status === 'SUCCESS' ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 className="text-neon-green w-10 h-10" />
                </div>
                <h3 className="text-2xl font-display font-bold uppercase mb-4">Pagamento Confirmado!</h3>
                <p className="text-white/40 text-sm mb-8">O acesso ao Neural Blueprint foi enviado para o seu e-mail.</p>
                <button onClick={onClose} className="w-full py-4 bg-neon-green text-black font-bold uppercase text-xs tracking-widest rounded-lg">
                  Fechar Protocolo
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="text-neon-green text-[10px] font-bold uppercase tracking-[0.4em] mb-4">Neural_Payment_Gateway</div>
                  <h3 className="text-2xl font-display font-bold uppercase tracking-tight">Finalizar Acesso</h3>
                </div>

                <div className="bg-white p-4 rounded-xl mb-8 mx-auto w-48 h-48 flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.05)]">
                  {pixData?.imagemQrcode ? (
                    <img src={pixData.imagemQrcode} alt="Pix QR Code" className="w-full h-full" referrerPolicy="no-referrer" />
                  ) : (
                    <Loader2 className="w-10 h-10 text-black animate-spin" />
                  )}
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-white/40 text-[10px] uppercase tracking-widest">Valor: R$ 29,90</span>
                  </div>
                  
                  <button 
                    onClick={copyToClipboard}
                    className="w-full py-4 border border-white/10 bg-white/5 flex items-center justify-center gap-3 rounded-lg hover:bg-white/10 transition-all group"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-neon-green" />
                        <span className="text-neon-green font-bold uppercase text-[10px] tracking-widest">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-white/40 group-hover:text-white" />
                        <span className="text-white font-bold uppercase text-[10px] tracking-widest">Copiar Código Pix</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-3 pt-4 opacity-20">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="text-[8px] font-bold uppercase tracking-[0.3em]">Aguardando confirmação do Banco Efí...</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
