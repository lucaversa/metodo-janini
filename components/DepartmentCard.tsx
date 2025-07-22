'use client';

import React, { useState } from 'react';

import { Departamento, Pop, Recursos, GrupoDeRecursos, CategoriasRecursos } from '@/types';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

import { Trash2, Plus, Users, Edit, FileText, MessageSquare, GripVertical, ChevronDown, X } from 'lucide-react';

import { PopCard } from './PopCard';

import { v4 as uuidv4 } from 'uuid';

import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';

import { ResourceGroup } from './ResourceGroup';

import { RECURSO_META } from '@/lib/constants';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { motion, AnimatePresence } from 'framer-motion';

import { Label } from '@/components/ui/label';

import { Textarea } from '@/components/ui/textarea';



interface DepartmentCardProps {

    departamento: Departamento;

    onUpdate: (depAtualizado: Departamento) => void;

    onDelete: (depId: string) => void;

    isOpen: boolean;

    onToggle: () => void;

}



const emptyResources: Recursos = {

    pessoas: [], documentos: [], equipamentos: [],

    sistemas: [], consumiveis: [], locais: [],

};



export function DepartmentCard({ departamento, onUpdate, onDelete, isOpen, onToggle }: DepartmentCardProps) {

    const [newPopName, setNewPopName] = useState('');

    const [newGroupName, setNewGroupName] = useState('');

    const [editingGroup, setEditingGroup] = useState<GrupoDeRecursos | null>(null);

    const [isAddingPop, setIsAddingPop] = useState(false);

    const [isAddingGroup, setIsAddingGroup] = useState(false);



    const updateDepartment = (updates: Partial<Departamento>) => { onUpdate({ ...departamento, ...updates }); };



    const addPop = () => {

        if (newPopName.trim() === '') return;

        const newPop: Pop = { id: uuidv4(), nome: newPopName, grupoRecursosId: null, recursos: emptyResources };

        updateDepartment({ pops: [...(departamento.pops || []), newPop] });

        setNewPopName('');

        setIsAddingPop(false);

        toast.success(`POP "${newPopName}" adicionado.`);

    };



    const updatePop = (popAtualizado: Pop) => {

        updateDepartment({ pops: (departamento.pops || []).map(p => p.id === popAtualizado.id ? popAtualizado : p) });

    };



    const deletePop = (popId: string) => {

        if (confirm('Apagar este POP?')) {

            const pop = departamento.pops.find(p => p.id === popId);

            updateDepartment({ pops: (departamento.pops || []).filter(p => p.id !== popId) });

            toast.error(`POP "${pop?.nome}" apagado.`);

        }

    };



    const addGroup = () => {

        if (newGroupName.trim() === '') return;

        const newGroup: GrupoDeRecursos = { id: uuidv4(), nome: newGroupName, recursos: emptyResources };

        updateDepartment({ gruposDeRecursos: [...(departamento.gruposDeRecursos || []), newGroup] });

        setNewGroupName('');

        setIsAddingGroup(false);

        toast.success(`Grupo "${newGroupName}" criado.`);

    };



    const updateGroup = (groupAtualizado: GrupoDeRecursos) => {

        const novosGrupos = (departamento.gruposDeRecursos || []).map(g => g.id === groupAtualizado.id ? groupAtualizado : g);

        updateDepartment({ gruposDeRecursos: novosGrupos });

    };



    const deleteGroup = (groupId: string) => {

        if (confirm('Tem a certeza que quer apagar este grupo? Os POPs que o usam perderão os seus recursos.')) {

            const popsAtualizados = (departamento.pops || []).map(p => p.grupoRecursosId === groupId ? { ...p, grupoRecursosId: null } : p);

            const gruposAtualizados = (departamento.gruposDeRecursos || []).filter(g => g.id !== groupId);

            updateDepartment({ pops: popsAtualizados, gruposDeRecursos: gruposAtualizados });

            toast.error('Grupo apagado.');

        }

    };



    return (

        <TooltipProvider>

            <Card className="bg-white border-l-4 border-primary shadow-md transition-all duration-300 hover:shadow-lg overflow-hidden">

                <CardHeader

                    className="flex flex-row items-center gap-2 cursor-pointer"

                    onClick={onToggle}

                >

                    <div

                        className="text-muted-foreground cursor-grab p-2 -ml-2"

                        title="Arrastar para reordenar"

                        onPointerDown={(e) => e.stopPropagation()}

                    >

                        <GripVertical className="h-6 w-6" />

                    </div>

                    <CardTitle className="flex-grow text-2xl text-slate-800">{departamento.nome}</CardTitle>

                    <div onPointerDown={(e) => e.stopPropagation()}>

                        <Tooltip>

                            <TooltipTrigger asChild>

                                <Button

                                    variant="ghost"

                                    size="icon"

                                    className="min-h-[44px] hover:bg-red-50"

                                    onClick={(e) => {

                                        e.stopPropagation();

                                        onDelete(departamento.id);

                                    }}

                                >

                                    <Trash2 className="h-5 w-5 text-red-500 hover:text-red-700 transition-colors" />

                                </Button>

                            </TooltipTrigger>

                            <TooltipContent><p>Apagar Departamento</p></TooltipContent>

                        </Tooltip>

                    </div>

                    <ChevronDown className={`h-6 w-6 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />

                </CardHeader>



                <AnimatePresence initial={false}>

                    {isOpen && (

                        <motion.section

                            key="content"

                            initial="collapsed"

                            animate="open"

                            exit="collapsed"

                            variants={{

                                open: { opacity: 1, height: "auto" },

                                collapsed: { opacity: 0, height: 0 }

                            }}

                            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}

                        >

                            <CardContent className="pt-0">

                                <Tabs defaultValue="pops" className="w-full">

                                    <TabsList className="grid w-full grid-cols-3 bg-slate-100 h-auto p-1">

                                        <TabsTrigger value="pops" className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-sm py-2 sm:py-3 transition-all duration-300 min-h-[44px]">

                                            <div className="flex items-center gap-1 sm:gap-2"><FileText size={16} className="sm:w-[18px] sm:h-[18px]" /><span className="text-xs sm:text-sm">POPs</span></div>

                                        </TabsTrigger>

                                        <TabsTrigger value="modelos" className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-sm py-2 sm:py-3 transition-all duration-300 min-h-[44px]">

                                            <div className="flex items-center gap-1 sm:gap-2"><Users size={16} className="sm:w-[18px] sm:h-[18px]" /><span className="text-xs sm:text-sm">Modelos</span></div>

                                        </TabsTrigger>

                                        <TabsTrigger value="observacoes" className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-sm py-2 sm:py-3 transition-all duration-300 min-h-[44px]">

                                            <div className="flex items-center gap-1 sm:gap-2"><MessageSquare size={16} className="sm:w-[18px] sm:h-[18px]" /><span className="text-xs sm:text-sm">Observações</span></div>

                                        </TabsTrigger>

                                    </TabsList>

                                    <TabsContent value="pops" className="mt-4">

                                        <div className="p-4 border rounded-lg bg-slate-50">

                                            <p className="text-sm text-muted-foreground mb-4">Adicione POPs e associe-os a um modelo de recursos ou configure-os individualmente.</p>

                                            <div className="space-y-2">

                                                {(departamento.pops || []).map(pop => (

                                                    <PopCard key={pop.id} pop={pop} gruposDisponiveis={departamento.gruposDeRecursos || []} onUpdate={updatePop} onDelete={deletePop} />

                                                ))}

                                            </div>

                                            <div className="pt-4 border-t mt-4">

                                                <AnimatePresence>

                                                    {isAddingPop && (

                                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex gap-2">

                                                            <Input placeholder="Nome do novo POP" value={newPopName} onChange={e => setNewPopName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPop()} />

                                                            <Button onClick={addPop}>Salvar</Button>

                                                            <Button variant="ghost" onClick={() => setIsAddingPop(false)}>Cancelar</Button>

                                                        </motion.div>

                                                    )}

                                                </AnimatePresence>

                                                {!isAddingPop && (

                                                    <Button onClick={() => setIsAddingPop(true)} variant="outline" className="w-full border-dashed min-h-[44px]"><Plus className="mr-2 h-4 w-4" /> Adicionar POP</Button>

                                                )}

                                            </div>

                                        </div>

                                    </TabsContent>

                                    <TabsContent value="modelos" className="mt-4">

                                        <div className="p-4 border rounded-lg bg-slate-100">

                                            <h3 className="font-bold text-lg mb-1">Modelos de Recursos</h3>

                                            <p className="text-sm text-muted-foreground mb-4">Crie modelos reutilizáveis de pessoas, equipamentos, etc., para associar a vários POPs.</p>

                                            <div className="space-y-2">

                                                {(departamento.gruposDeRecursos || []).map(grupo => (

                                                    <div key={grupo.id} className="flex justify-between items-center p-2 rounded-md hover:bg-slate-200/60 border bg-white">

                                                        <span className="font-medium text-slate-700">{grupo.nome}</span>

                                                        <div className="flex flex-row items-center gap-2">

                                                            <Dialog onOpenChange={(isOpen) => !isOpen && setEditingGroup(null)}>

                                                                <DialogTrigger asChild>

                                                                    <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => setEditingGroup(grupo)}><Edit className="mr-2 h-4 w-4" />Editar Modelo</Button>
                                                                </DialogTrigger>
                                                                <DialogTrigger asChild>
                                                                    <Button variant="outline" size="sm" className="flex sm:hidden px-2" onClick={() => setEditingGroup(grupo)}><Edit className="h-4 w-4" /></Button>

                                                                </DialogTrigger>

                                                                <DialogContent style={{ width: '90vw', maxWidth: '1400px' }} className="h-[90vh] flex flex-col p-3 sm:p-6">

                                                                    <DialogHeader className="flex-shrink-0"><DialogTitle className="text-lg sm:text-xl">Editando Modelo: {editingGroup?.nome}</DialogTitle></DialogHeader>

                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 overflow-y-auto p-4 flex-grow">

                                                                        {editingGroup && Object.entries(RECURSO_META).map(([key, meta]) => (

                                                                            <ResourceGroup key={key} categoria={key as CategoriasRecursos} recursos={editingGroup.recursos[key as CategoriasRecursos] || []} meta={meta}

                                                                                onUpdate={(cat, recs) => {

                                                                                    const grupoEditado = { ...editingGroup, recursos: { ...editingGroup.recursos, [cat]: recs } };

                                                                                    setEditingGroup(grupoEditado);

                                                                                    updateGroup(grupoEditado);

                                                                                }}

                                                                            />

                                                                        ))}

                                                                    </div>

                                                                </DialogContent>

                                                            </Dialog>

                                                            <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className="min-h-[44px] hover:bg-red-50" onClick={() => deleteGroup(grupo.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TooltipTrigger><TooltipContent><p>Apagar Modelo</p></TooltipContent></Tooltip>

                                                        </div>

                                                    </div>

                                                ))}

                                            </div>

                                            <div className="pt-4 border-t mt-4">

                                                <AnimatePresence>

                                                    {isAddingGroup && (

                                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex gap-2">

                                                            <Input placeholder="Nome do novo modelo" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGroup()} />

                                                            <Button onClick={addGroup}>Salvar</Button>

                                                            <Button variant="ghost" onClick={() => setIsAddingGroup(false)}>Cancelar</Button>

                                                        </motion.div>

                                                    )}

                                                </AnimatePresence>

                                                {!isAddingGroup && (

                                                    <Button onClick={() => setIsAddingGroup(true)} variant="outline" className="w-full border-dashed min-h-[44px]"><Plus className="mr-2 h-4 w-4" /> Criar Modelo</Button>

                                                )}

                                            </div>

                                        </div>

                                    </TabsContent>

                                    <TabsContent value="observacoes" className="mt-4">

                                        <div className="p-4 border rounded-lg bg-slate-100">

                                            <Label htmlFor={`obs-${departamento.id}`} className="font-bold text-lg mb-1">Observações do Departamento</Label>

                                            <p className="text-sm text-muted-foreground mb-4">O texto que escrever aqui aparecerá no rodapé do relatório deste departamento.</p>

                                            <Textarea

                                                id={`obs-${departamento.id}`}

                                                placeholder="Escreva aqui as suas observações..."

                                                value={departamento.observacao || ''}

                                                onChange={(e) => updateDepartment({ observacao: e.target.value })}

                                                className="min-h-[120px] bg-white"

                                                rows={5}

                                            />

                                        </div>

                                    </TabsContent>

                                </Tabs>

                            </CardContent>

                        </motion.section>

                    )}

                </AnimatePresence>

            </Card>

        </TooltipProvider>

    );

}