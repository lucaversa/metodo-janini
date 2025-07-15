// lib/constants.ts
import { Users, FileText, HardHat, Tv, ShoppingCart, MapPin } from 'lucide-react';
import { CategoriasRecursos } from '@/types';
import React from 'react';

export const RECURSO_META: { [key in CategoriasRecursos]: { icon: React.ElementType; color: string; label: string; } } = {
    pessoas: { icon: Users, color: 'text-sky-500', label: 'Pessoas' },
    documentos: { icon: FileText, color: 'text-orange-500', label: 'Documentos' },
    equipamentos: { icon: HardHat, color: 'text-amber-500', label: 'Equipamentos' }, // Cor ajustada
    sistemas: { icon: Tv, color: 'text-purple-500', label: 'Sistemas' },
    consumiveis: { icon: ShoppingCart, color: 'text-green-500', label: 'Consumíveis' },
    locais: { icon: MapPin, color: 'text-rose-500', label: 'Locais' }, // << COR CORRIGIDA
};