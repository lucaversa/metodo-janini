// lib/constants.ts
import { CategoriasRecursos } from '@/types';
import React from 'react';
// MODIFICADO: importado o ícone de Relógio
import { Users, FileText, HardHat, Tv, ShoppingCart, MapPin, Clock } from 'lucide-react';

// MODIFICADO: Adicionada a meta-informação para 'recorrencia'
export const RECURSO_META: { [key in CategoriasRecursos]: { icon: React.ElementType; color: string; label: string; } } = {
    pessoas: { icon: Users, color: 'text-sky-500', label: 'Pessoas' },
    documentos: { icon: FileText, color: 'text-orange-500', label: 'Documentos' },
    equipamentos: { icon: HardHat, color: 'text-amber-500', label: 'Equipamentos' },
    sistemas: { icon: Tv, color: 'text-purple-500', label: 'Sistemas' },
    consumiveis: { icon: ShoppingCart, color: 'text-green-500', label: 'Consumíveis' },
    locais: { icon: MapPin, color: 'text-rose-500', label: 'Locais' },
    recorrencia: { icon: Clock, color: 'text-cyan-500', label: 'Recorrência' },
};

// MODIFICADO: Adicionada a meta-informação para impressão de 'recorrencia'
export const RECURSO_META_IMPRESSAO: { [key in CategoriasRecursos]: { label: string, icon: string } } = {
    pessoas: { label: 'PESSOAS', icon: `<svg>...</svg>` },
    documentos: { label: 'DOCUMENTOS', icon: `<svg>...</svg>` },
    equipamentos: { label: 'EQUIPAMENTOS', icon: `<svg>...</svg>` },
    sistemas: { label: 'SISTEMAS', icon: `<svg>...</svg>` },
    consumiveis: { label: 'CONSUMÍVEIS', icon: `<svg>...</svg>` },
    locais: { label: 'LOCAIS', icon: `<svg>...</svg>` },
    recorrencia: { label: 'RECORRÊNCIA', icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M18 14v4h4"/><path d="M18 18m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0"/></svg>` },
};