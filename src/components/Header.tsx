import React from 'react';
import logoCpe from '../assets/logo_cpe.png';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';

export default function Header() {
  return (
    <header className="flex items-center justify-between bg-white px-8 py-4 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Sistema de coleta de frequência | Painel administrativo
        </h1>
        <p className="text-sm text-slate-500">Cursinho Popular EACH - USP</p>
      </div>
      
      <div className="flex items-center gap-4">
        <img src={logoCpe} className="w-[120px]" alt="Logo Cursinho Popular EACH" />
        
        {/* Adicionei o ícone de sair para ficar igual ao seu design no Figma! */}
        <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </header>
  );
}