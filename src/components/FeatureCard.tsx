import React from 'react';

interface FeatureCardProps {
  icon: any;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <div className="p-10 tech-card rounded-xl border border-white/5 hover:border-neon-green/20 transition-all">
    <div className="w-12 h-12 bg-neon-green/10 flex items-center justify-center rounded-lg mb-8">
      <Icon className="text-neon-green w-6 h-6" />
    </div>
    <h3 className="text-xl font-display font-bold mb-4 uppercase tracking-tight">{title}</h3>
    <p className="text-white/40 leading-relaxed text-sm font-light">{description}</p>
  </div>
);
