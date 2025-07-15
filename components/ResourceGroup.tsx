// components/ResourceGroup.tsx
'use client'
import React, { useState } from 'react';
import { Recurso, CategoriasRecursos } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { v4 as uuidv4 } from 'uuid';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ResourceGroupProps {
    categoria: CategoriasRecursos;
    meta: { icon: React.ElementType; color: string; label: string; };
    recursos: Recurso[];
    onUpdate: (categoria: CategoriasRecursos, novosRecursos: Recurso[]) => void;
}

export function ResourceGroup({ categoria, meta: { icon: Icon, color, label }, recursos, onUpdate }: ResourceGroupProps) {
    const [nome, setNome] = useState('');
    const [custo, setCusto] = useState('');
    const [editingItem, setEditingItem] = useState<Recurso | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const calculateSubtotal = () => {
        return (recursos || []).reduce((acc, item) => acc + Number(item.custo || 0), 0);
    };

    const resetForm = () => {
        setNome('');
        setCusto('');
        setEditingItem(null);
        setIsDialogOpen(false);
    };

    const handleSave = () => {
        if (nome.trim() === '' || custo.trim() === '') return;
        const custoNumerico = parseFloat(custo.replace(',', '.'));
        if (isNaN(custoNumerico)) return;

        if (editingItem) {
            const atualizados = recursos.map(r => r.id === editingItem.id ? { ...r, nome: nome.trim(), custo: custoNumerico } : r);
            onUpdate(categoria, atualizados);
        } else {
            const novoRecurso: Recurso = { id: uuidv4(), nome: nome.trim(), custo: custoNumerico };
            onUpdate(categoria, [...(recursos || []), novoRecurso]);
        }
        resetForm();
    };

    const handleDelete = (id: string) => {
        onUpdate(categoria, recursos.filter(r => r.id !== id));
    };

    const openEditDialog = (recurso: Recurso) => {
        setEditingItem(recurso);
        setNome(recurso.nome);
        setCusto(String(recurso.custo));
        setIsDialogOpen(true);
    }

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            resetForm();
        }
        setIsDialogOpen(open);
    }

    return (
        <TooltipProvider>
            <Card className="flex flex-col h-full bg-slate-50 shadow-sm">
                <CardHeader className="flex-shrink-0 pb-4">
                    <CardTitle className={`flex items-center gap-3 text-xl font-semibold ${color}`}>
                        <Icon size={22} /> {label}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-1 overflow-y-auto p-2">
                    {(recursos || []).length === 0 ? (
                        <p className="text-sm text-center text-slate-400 py-4 italic">Nenhum item.</p>
                    ) : (
                        recursos.map(recurso => (
                            <div key={recurso.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-slate-200/70 group">
                                <span className="flex-1 truncate pr-2">
                                    {recurso.nome} - <span className="font-medium">{Number(recurso.custo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                </span>
                                <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Tooltip>
                                        <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(recurso)}><Edit className="h-4 w-4" /></Button></TooltipTrigger>
                                        <TooltipContent><p>Editar Item</p></TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(recurso.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TooltipTrigger>
                                        <TooltipContent><p>Apagar Item</p></TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                        ))
                    )}
                </CardContent>
                <CardFooter className="flex-shrink-0 flex justify-between items-center bg-slate-200 p-2 border-t">
                    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="bg-white"><Plus className="mr-2 h-4 w-4" /> Adicionar</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingItem ? 'Editar' : 'Adicionar'} {label.slice(0, -1)}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Input placeholder="Nome do item" value={nome} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNome(e.target.value)} />
                                <Input type="text" placeholder="Custo unitário (ex: 25,50)" value={custo} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCusto(e.target.value)} />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                                <Button onClick={handleSave}>Salvar</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    {/* <<<<<<< CORREÇÃO AQUI: Adicionado pr-2 para dar espaço à direita >>>>>>> */}
                    <span className="text-sm font-bold pr-2">
                        {calculateSubtotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                </CardFooter>
            </Card>
        </TooltipProvider>
    );
}