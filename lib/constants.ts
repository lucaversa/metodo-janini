// lib/constants.ts
import { CategoriasRecursos } from '@/types';
import React from 'react';
import { Users, FileText, HardHat, Tv, ShoppingCart, MapPin } from 'lucide-react';

// Este é para a UI principal
export const RECURSO_META: { [key in CategoriasRecursos]: { icon: React.ElementType; color: string; label: string; } } = {
    pessoas: { icon: Users, color: 'text-sky-500', label: 'Pessoas' },
    documentos: { icon: FileText, color: 'text-orange-500', label: 'Documentos' },
    equipamentos: { icon: HardHat, color: 'text-amber-500', label: 'Equipamentos' },
    sistemas: { icon: Tv, color: 'text-purple-500', label: 'Sistemas' },
    consumiveis: { icon: ShoppingCart, color: 'text-green-500', label: 'Consumíveis' },
    locais: { icon: MapPin, color: 'text-rose-500', label: 'Locais' },
};

// Este é para a impressão, com o código SVG direto
export const RECURSO_META_IMPRESSAO: { [key in CategoriasRecursos]: { label: string, icon: string } } = {
    pessoas: { label: 'PESSOAS', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>` },
    documentos: { label: 'DOCUMENTOS', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>` },
    equipamentos: { label: 'EQUIPAMENTOS', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 13a4 4 0 1 0 0-6 4 4 0 0 0 0 6Z"/><path d="M12 22V10"/><path d="M12 10a8.1 8.1 0 0 0-7.3-5.3c-4.4.9-5.4 6.2-2.3 9.3s7.9 4.9 11.2 3.8A8.1 8.1 0 0 0 20 10a12 12 0 0 1-8.2 3.3"/><path d="M20 10c0 4.2-3.3 9-5 9s-5-4.8-5-9"/><path d="M12 2v2.7"/></svg>` },
    sistemas: { label: 'SISTEMAS', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>` },
    consumiveis: { label: 'CONSUMÍVEIS', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.16"/></svg>` },
    locais: { label: 'LOCAIS', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>` },
};