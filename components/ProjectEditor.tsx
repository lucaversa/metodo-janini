'use client';

import React, { useState, useEffect } from 'react';
import { Projeto, Departamento } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { DepartmentCard } from './DepartmentCard';
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { PrintButtonTabular } from './PrintButtonTabular';

interface ProjectEditorProps {
    projeto: Projeto;
    onUpdate: (projetoAtualizado: Projeto) => void;
    onClose: () => void;
}

export function ProjectEditor({ projeto, onUpdate, onClose }: ProjectEditorProps) {
    const [editedProject, setEditedProject] = useState<Projeto>(projeto);
    const [newDepartmentName, setNewDepartmentName] = useState('');
    const [isAddingDepartment, setIsAddingDepartment] = useState(false);
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
        if (newDepartmentName.trim() === '') return;
        const newDepartment: Departamento = { id: uuidv4(), nome: newDepartmentName, pops: [], gruposDeRecursos: [] };
        const newProjectState = { ...editedProject, departamentos: [...editedProject.departamentos, newDepartment] };
        updateProject(newProjectState);
        setNewDepartmentName('');
        setIsAddingDepartment(false);
        toast.success(`Departamento "${newDepartmentName}" adicionado.`);
        setOpenDepartmentId(newDepartment.id);
    };

    const updateDepartment = (depAtualizado: Departamento) => {
        updateProject({ ...editedProject, departamentos: editedProject.departamentos.map(d => d.id === depAtualizado.id ? depAtualizado : d) });
    };

    const deleteDepartment = (depId: string) => {
        if (confirm('Tem certeza que deseja apagar este departamento?')) {
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

    return (
        <div className="p-4 md:p-6 h-screen flex flex-col bg-slate-50">
            <header className="flex-shrink-0 flex justify-between items-center mb-4 pb-4 border-b">
                <h1 className="text-3xl font-bold text-slate-800">{editedProject.nome}</h1>
                <div className="flex items-center gap-2">
                    <PrintButtonTabular projeto={editedProject} />
                    <Button variant="outline" onClick={onClose}>
                        <X className="mr-2 h-4 w-4" /> Fechar
                    </Button>
                </div>
            </header>
            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                <Reorder.Group axis="y" values={editedProject.departamentos} onReorder={handleDepartmentReorder} className="space-y-4">
                    {editedProject.departamentos.map(dep => (
                        <Reorder.Item key={dep.id} value={dep}>
                            <DepartmentCard
                                departamento={dep}
                                onUpdate={updateDepartment}
                                onDelete={deleteDepartment}
                                isOpen={openDepartmentId === dep.id}
                                onToggle={() => handleToggleDepartment(dep.id)}
                            />
                        </Reorder.Item>
                    ))}
                </Reorder.Group>

                <AnimatePresence>
                    {isAddingDepartment && (
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                            <Card>
                                <CardHeader><CardTitle>Novo Departamento</CardTitle></CardHeader>
                                <CardContent className="flex gap-2">
                                    <Input placeholder="Nome do novo departamento" value={newDepartmentName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewDepartmentName(e.target.value)} onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && addDepartment()} />
                                    <Button onClick={addDepartment}>Salvar</Button>
                                    <Button variant="ghost" onClick={() => setIsAddingDepartment(false)}>Cancelar</Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
                {!isAddingDepartment && (
                    <Button variant="outline" className="w-full border-dashed" onClick={() => setIsAddingDepartment(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Adicionar Departamento
                    </Button>
                )}
            </div>
            <CardFooter className="flex-shrink-0 flex justify-end items-center gap-4 font-bold bg-white p-4 mt-4 border-t rounded-lg shadow-sm">
                <span className="text-lg text-slate-700">TOTAL DO PROJETO:</span>
                <span className="text-2xl text-green-600">
                    {calculateTotalProjeto().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
            </CardFooter>
        </div>
    );
}