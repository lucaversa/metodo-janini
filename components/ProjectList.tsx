// components/ProjectList.tsx
'use client';
import React, { useState } from 'react';
import { Projeto } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, FileText, Trash2, FolderKanban, MoreVertical } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ... (Interface ProjectListProps continua igual)
interface ProjectListProps {
    projetos: Projeto[];
    onSelectProject: (id: string) => void;
    onCreateProject: (nome: string) => void;
    onDeleteProject: (id: string) => void;
}


export function ProjectList({ projetos, onSelectProject, onCreateProject, onDeleteProject }: ProjectListProps) {
    const [novoProjetoNome, setNovoProjetoNome] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleAddClick = () => {
        if (novoProjetoNome.trim()) {
            onCreateProject(novoProjetoNome.trim());
            setNovoProjetoNome('');
            setIsDialogOpen(false); // Fecha o diálogo após criar
        }
    };

    const calculateTotalProjeto = (projeto: Projeto) => {
        const recursosUnicos = new Map<string, number>();
        (projeto.departamentos || []).forEach(dep => {
            (dep.pops || []).forEach(pop => {
                const recursosDoPop = pop.grupoRecursosId
                    ? (dep.gruposDeRecursos || []).find(g => g.id === pop.grupoRecursosId)?.recursos
                    : pop.recursos;

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
        recursosUnicos.forEach(custo => {
            custoTotal += custo;
        });
        return custoTotal;
    };

    return (
        <TooltipProvider>
            <div className="p-4 sm:p-6 md:p-8">
                {/* Cabeçalho Moderno */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-800 flex items-center gap-3"><FolderKanban size={36} /> Meus Projetos</h1>
                        <p className="text-slate-500 mt-1">Crie e gerencie os custos operacionais de seus projetos.</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="mt-4 sm:mt-0">
                                <PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Projeto
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Criar Novo Projeto</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Input
                                    id="name"
                                    placeholder="Nome do novo projeto"
                                    value={novoProjetoNome}
                                    onChange={(e) => setNovoProjetoNome(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddClick()}
                                />
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddClick}>Criar Projeto</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </header>

                {/* Lista de Projetos */}
                {projetos.length === 0 ? (
                    <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
                        <h2 className="text-xl font-semibold text-slate-700">Nenhum projeto por aqui!</h2>
                        <p className="text-slate-500 mt-2">Clique em "Criar Novo Projeto" para começar a sua jornada.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {projetos.map(projeto => (
                            <Card key={projeto.id} className="flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 bg-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                            <FileText size={20} />
                                        </div>
                                        <span className="truncate">{projeto.nome}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-500">
                                        {(projeto.departamentos || []).length} departamento(s)
                                    </p>
                                    <p className="text-2xl font-bold text-slate-800 mt-2">
                                        {calculateTotalProjeto(projeto).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                </CardContent>
                                <CardFooter className="flex justify-between bg-slate-50 p-4 border-t">
                                    <Button variant="outline" onClick={() => onSelectProject(projeto.id)}>Abrir Projeto</Button>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDeleteProject(projeto.id); }}>
                                                <Trash2 className="h-5 w-5 text-red-500 hover:text-red-700" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Apagar Projeto</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}