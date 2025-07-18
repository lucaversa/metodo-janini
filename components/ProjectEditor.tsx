// components/ProjectEditor.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Projeto, Departamento } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, X, FilePenLine, Building2, TrendingUp, Layers } from 'lucide-react';
import { DepartmentCard } from './DepartmentCard';
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { motion, Reorder } from 'framer-motion';
import { PrintButtonTabular } from './PrintButtonTabular';

interface ProjectEditorProps {
    projeto: Projeto;
    onUpdate: (projetoAtualizado: Projeto) => void;
    onClose: () => void;
}

export function ProjectEditor({ projeto, onUpdate, onClose }: ProjectEditorProps) {
    const [editedProject, setEditedProject] = useState<Projeto>(projeto);
    const [newDepartmentName, setNewDepartmentName] = useState('');
    const [isAddDeptDialogOpen, setAddDeptDialogOpen] = useState(false);
    const [openDepartmentId, setOpenDepartmentId] = useState<string | null>(null);

    useEffect(() => {
        if (projeto.departamentos.length > 0 && openDepartmentId === null) {
            setOpenDepartmentId(projeto.departamentos[0].id);
        }
    }, [projeto.departamentos, openDepartmentId]);

    const updateProject = (projetoAtualizado: Projeto) => {
        setEditedProject(projetoAtualizado);
        onUpdate(projetoAtualizado);
    };

    const addDepartment = () => {
        if (newDepartmentName.trim() === '') {
            toast.error("O nome do departamento não pode estar vazio.");
            return;
        }
        const newDepartment: Departamento = { id: uuidv4(), nome: newDepartmentName, pops: [], gruposDeRecursos: [] };
        const newProjectState = { ...editedProject, departamentos: [...editedProject.departamentos, newDepartment] };
        updateProject(newProjectState);
        setNewDepartmentName('');
        setAddDeptDialogOpen(false);
        toast.success(`Departamento "${newDepartmentName}" adicionado.`);
        setOpenDepartmentId(newDepartment.id);
    };

    const updateDepartment = (depAtualizado: Departamento) => {
        updateProject({ ...editedProject, departamentos: editedProject.departamentos.map(d => d.id === depAtualizado.id ? depAtualizado : d) });
    };

    const deleteDepartment = (depId: string) => {
        if (confirm('Tem certeza que deseja apagar este departamento e todos os seus dados?')) {
            const dep = editedProject.departamentos.find(d => d.id === depId);
            updateProject({ ...editedProject, departamentos: editedProject.departamentos.filter(d => d.id !== depId) });
            toast.error(`Departamento "${dep?.nome}" apagado.`);
        }
    };

    const handleDepartmentReorder = (newOrder: Departamento[]) => {
        updateProject({ ...editedProject, departamentos: newOrder });
    };

    const handleToggleDepartment = (depId: string) => {
        setOpenDepartmentId(prevId => (prevId === depId ? null : depId));
    };

    const calculateTotalProjeto = () => {
        const recursosUnicos = new Map<string, number>();
        editedProject.departamentos.forEach(dep => {
            (dep.pops || []).forEach(pop => {
                const recursosDoPop = pop.grupoRecursosId ? (dep.gruposDeRecursos || []).find(g => g.id === pop.grupoRecursosId)?.recursos : pop.recursos;
                if (recursosDoPop) {
                    Object.values(recursosDoPop).flat().forEach(recurso => {
                        if (!recursosUnicos.has(recurso.id)) {
                            recursosUnicos.set(recurso.id, recurso.custo);
                        }
                    });
                }
            });
        });
        let custoTotal = 0;
        recursosUnicos.forEach(custo => { custoTotal += custo; });
        return custoTotal;
    };

    const getTotalDepartments = () => editedProject.departamentos.length;
    const getTotalPops = () => editedProject.departamentos.reduce((total, dep) => total + (dep.pops || []).length, 0);

    return (
        <div className="h-screen w-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            {/* Header com gradiente e informações principais */}
            <header className="flex-shrink-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-lg">
                <div className="container mx-auto p-6">
                    {/* Primeira linha: Título e botões */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                                <FilePenLine className="h-8 w-8 text-white flex-shrink-0" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-3xl font-bold text-white truncate">{editedProject.nome}</h1>
                                <p className="text-blue-100 hidden md:block">Arraste os departamentos para reordenar • Clique para expandir</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Dialog open={isAddDeptDialogOpen} onOpenChange={setAddDeptDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300">
                                        <Plus className="mr-2 h-4 w-4" /> Novo Departamento
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl">Adicionar Novo Departamento</DialogTitle>
                                    </DialogHeader>
                                    <Input
                                        placeholder="Nome do departamento"
                                        value={newDepartmentName}
                                        onChange={(e) => setNewDepartmentName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addDepartment()}
                                        className="h-12 text-lg"
                                    />
                                    <DialogFooter>
                                        <Button onClick={addDepartment} className="px-8 py-3">Adicionar</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <div className="[&>*]:!bg-green-500 [&>*]:!hover:bg-green-600 [&>*]:!text-white [&>*]:!border-green-500 [&>*]:shadow-lg [&>*]:hover:shadow-xl [&>*]:transition-all [&>*]:duration-300">
                                <PrintButtonTabular projeto={editedProject} />
                            </div>
                            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300" onClick={onClose}>
                                <X className="mr-2 h-4 w-4" /> Fechar
                            </Button>
                        </div>
                    </div>

                    {/* Segunda linha: Resumo do projeto */}
                    <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-blue-200" />
                                <span className="text-blue-100 font-medium">{getTotalDepartments()} Departamentos</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Layers className="h-5 w-5 text-purple-200" />
                                <span className="text-blue-100 font-medium">{getTotalPops()} POPs</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div className="text-right">
                                <p className="text-blue-100 text-sm font-medium">TOTAL DO PROJETO</p>
                                <p className="text-2xl font-bold text-white">
                                    {calculateTotalProjeto().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Conteúdo principal - Departamentos */}
            <main className="flex-grow container mx-auto px-4 py-6 overflow-y-auto">
                <div className="space-y-4">
                    {editedProject.departamentos.length === 0 ? (
                        <Card className="text-center py-16 px-4 bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-xl">
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                                    <Building2 size={48} className="text-blue-500" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Nenhum departamento ainda</h2>
                            <p className="text-slate-600 max-w-md mx-auto">Clique em &quot;Novo Departamento&quot; para começar a estruturar seu projeto.</p>
                        </Card>
                    ) : (
                        <Reorder.Group axis="y" values={editedProject.departamentos} onReorder={handleDepartmentReorder} className="space-y-4">
                            {editedProject.departamentos.map(dep => (
                                <Reorder.Item key={dep.id} value={dep}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-0 hover:shadow-xl transition-all duration-300 overflow-hidden"
                                    >
                                        <DepartmentCard
                                            departamento={dep}
                                            onUpdate={updateDepartment}
                                            onDelete={deleteDepartment}
                                            isOpen={openDepartmentId === dep.id}
                                            onToggle={() => handleToggleDepartment(dep.id)}
                                        />
                                    </motion.div>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    )}
                </div>
            </main>
        </div>
    );
}