import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Loader2, 
  BarChart3, 
  TrendingUp, 
  Users 
} from 'lucide-react';
import { AdminData } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanel = ({ isOpen, onClose }: AdminPanelProps) => {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'full'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchSales();
    }
  }, [isOpen]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/sales', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      setData(result);
    } catch (e) {
      console.error('Admin fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = data?.sales?.filter((sale) => 
    sale.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const displaySales = view === 'dashboard' ? filteredSales.slice(0, 10) : filteredSales;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-center justify-center px-6 bg-black/95 backdrop-blur-2xl"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-5xl bg-[#0a0a0a] border border-white/10 p-4 sm:p-8 rounded-2xl relative max-h-[90vh] flex flex-col overflow-hidden"
        >
          <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/40 hover:text-white z-20">
            <X className="w-6 h-6" />
          </button>

          <div className="mb-6 sm:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-3xl font-display font-bold uppercase tracking-tight flex items-center gap-3">
                <BarChart3 className="text-neon-green w-6 h-6 sm:w-8 sm:h-8" />
                {view === 'dashboard' ? 'Painel de Controle' : 'Relatório Completo'}
              </h3>
              <p className="text-white/40 text-[10px] sm:text-xs mt-1 uppercase tracking-widest">
                {view === 'dashboard' ? 'Gestão de Vendas e Faturamento' : `Total de ${filteredSales.length} transações encontradas`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {view === 'full' && (
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Buscar cliente ou e-mail..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[10px] text-white outline-none focus:border-neon-green w-48 sm:w-64 transition-all"
                  />
                </div>
              )}
              <button 
                onClick={() => {
                  if (view === 'full') {
                    setView('dashboard');
                    setSearchTerm('');
                  } else {
                    fetchSales();
                  }
                }}
                className="text-[10px] font-bold uppercase tracking-widest text-neon-green hover:text-white transition-colors flex items-center gap-2"
              >
                {view === 'full' ? 'Voltar ao Painel' : (
                  <>
                    <Loader2 className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {loading && !data ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-neon-green" />
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-8 pb-4">
                {view === 'dashboard' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white/5 border border-white/10 p-4 sm:p-6 rounded-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-8 h-8 sm:w-12 sm:h-12" />
                      </div>
                      <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 sm:mb-2">Vendas Totais</p>
                      <p className="text-2xl sm:text-4xl font-display font-bold text-neon-green">{data?.stats?.total_sales || 0}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 sm:p-6 rounded-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-8 h-8 sm:w-12 sm:h-12" />
                      </div>
                      <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1 sm:mb-2">Faturamento Total</p>
                      <p className="text-2xl sm:text-4xl font-display font-bold text-white">R$ {data?.stats?.total_revenue?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                )}

                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <div className="p-3 sm:p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <h4 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
                      {view === 'dashboard' ? 'Vendas Recentes' : 'Relatório Histórico'}
                    </h4>
                    {view === 'dashboard' ? (
                      <button 
                        onClick={() => setView('full')}
                        className="text-[8px] uppercase text-neon-green hover:text-white font-bold tracking-widest transition-colors"
                      >
                        Ver Relatório Completo →
                      </button>
                    ) : (
                      <span className="text-[8px] uppercase text-white/20">Dados permanentes do sistema</span>
                    )}
                  </div>
                  
                  <div className="divide-y divide-white/5">
                    <div className="hidden sm:grid grid-cols-4 gap-4 px-6 py-4 text-[10px] uppercase tracking-widest text-white/40 font-bold border-b border-white/10">
                      <div>Cliente</div>
                      <div>E-mail</div>
                      <div>Valor</div>
                      <div className="text-right">Data</div>
                    </div>

                    {displaySales.map((sale) => (
                      <div key={sale.id} className="p-4 sm:px-6 sm:py-4 hover:bg-white/5 transition-colors">
                        <div className="flex flex-col sm:grid sm:grid-cols-4 sm:gap-4 sm:items-center gap-3 sm:gap-4">
                          <div className="flex justify-between items-center sm:block">
                            <span className="sm:hidden text-[8px] uppercase text-white/20 font-bold tracking-widest">Cliente</span>
                            <span className="text-xs font-medium text-white truncate max-w-[150px] sm:max-w-none block">{sale.full_name}</span>
                          </div>
                          
                          <div className="flex justify-between items-center sm:block">
                            <span className="sm:hidden text-[8px] uppercase text-white/20 font-bold tracking-widest">E-mail</span>
                            <span className="text-[10px] sm:text-xs text-white/60 truncate max-w-[180px] sm:max-w-none block">{sale.email}</span>
                          </div>

                          <div className="flex justify-between items-center sm:block">
                            <span className="sm:hidden text-[8px] uppercase text-white/20 font-bold tracking-widest">Valor</span>
                            <span className="text-xs text-neon-green font-bold block">R$ {parseFloat(sale.amount).toFixed(2)}</span>
                          </div>

                          <div className="flex justify-between items-center sm:block sm:text-right">
                            <span className="sm:hidden text-[8px] uppercase text-white/20 font-bold tracking-widest">Data</span>
                            <span className="text-[10px] sm:text-xs text-white/40 block">{new Date(sale.created_at).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {displaySales.length === 0 && (
                      <div className="px-6 py-10 text-center text-white/20 italic text-xs">
                        {searchTerm ? 'Nenhum resultado para sua busca.' : 'Nenhuma venda registrada ainda.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
