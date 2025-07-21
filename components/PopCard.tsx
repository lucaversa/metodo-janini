// components/PopCard.tsx
import React from 'react';
import { Pop, GrupoDeRecursos, Recurso, CategoriasRecursos } from '@/types';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ResourceGroup } from './ResourceGroup';
import { RECURSO_META } from '@/lib/constants';

interface PopCardProps {
    pop: Pop;
    gruposDisponiveis: GrupoDeRecursos[];
    onUpdate: (popAtualizado: Pop) => void;
    onDelete: (popId: string) => void;
}

export function PopCard({ pop, gruposDisponiveis, onUpdate, onDelete }: PopCardProps) {
    const handleGroupChange = (groupId: string) => {
        if (groupId === 'individual') {
            onUpdate({ ...pop, grupoRecursosId: null });
        } else {
            onUpdate({ ...pop, grupoRecursosId: groupId });
        }
    };

    const handleResourceUpdate = (categoria: CategoriasRecursos, novosRecursos: Recurso[]) => {
        onUpdate({
            ...pop,
            recursos: {
                ...pop.recursos,
                [categoria]: novosRecursos,
            },
        });
    };

    const isIndividual = !pop.grupoRecursosId;

    return (
        <Card className="mb-2 bg-white hover:bg-slate-50 transition-colors">
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 gap-3 sm:gap-2">
                <CardTitle className="text-base font-semibold text-slate-700 w-full sm:w-auto">{pop.nome}</CardTitle>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 w-full sm:w-auto">
                    <Select onValueChange={handleGroupChange} value={pop.grupoRecursosId || 'individual'}>
                        <SelectTrigger className="w-full max-w-[250px] min-w-[120px] bg-white">
                            <SelectValue placeholder="Selecione um grupo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="individual">Recursos Individuais</SelectItem>
                            {gruposDisponiveis.map(g => (
                                <SelectItem key={g.id} value={g.id}>{g.nome}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {isIndividual && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="hidden sm:flex"><Edit className="mr-2 h-4 w-4" />Editar Recursos</Button>
                            </DialogTrigger>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="flex sm:hidden px-2"><Edit className="h-4 w-4" /></Button>
                            </DialogTrigger>

                            <DialogContent className="w-[95vw] sm:w-[90vw] max-w-[1400px] h-[95vh] sm:h-[90vh] flex flex-col p-3 sm:p-6">
                                <DialogHeader className="flex-shrink-0">
                                    <DialogTitle className="text-lg sm:text-xl">Editando Recursos de: {pop.nome}</DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 overflow-y-auto p-1 flex-grow">
                                    {Object.entries(RECURSO_META).map(([key, meta]) => (
                                        <ResourceGroup
                                            key={key}
                                            categoria={key as CategoriasRecursos}
                                            recursos={pop.recursos[key as CategoriasRecursos] || []}
                                            meta={meta}
                                            onUpdate={handleResourceUpdate}
                                        />
                                    ))}
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                    <Button variant="ghost" size="icon" className="min-h-[44px] hover:bg-red-50" onClick={() => onDelete(pop.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                </div>
            </CardHeader>
        </Card>
    );
}