// components/ProjectList.tsx
'use client';
import React, { useState } from 'react';
import { Projeto } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PlusCircle, FileText, Trash2, FolderKanban, MoreVertical, FolderPlus, Building2, TrendingUp } from 'lucide-react';

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
            setIsDialogOpen(false);
        }
    };

    const calculateTotalProjeto = (projeto: Projeto): number => {
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

    const getTotalProjects = () => projetos.length;
    const getTotalBudget = () => projetos.reduce((total, projeto) => total + calculateTotalProjeto(projeto), 0);

    return (
        <TooltipProvider>
            <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
                {/* Header com gradiente */}
                <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white">
                    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div>
                                <h1 className="text-5xl font-bold flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                                        <FolderKanban size={40} className="text-white" />
                                    </div>
                                    Meus Projetos
                                </h1>
                                <p className="text-blue-100 text-lg">Crie e gerencie os custos operacionais de seus projetos com eficiência.</p>
                            </div>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="mt-6 sm:mt-0 bg-white text-blue-700 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-lg font-semibold">
                                        <PlusCircle className="mr-2 h-5 w-5" /> Criar Novo Projeto
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl">Criar Novo Projeto</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <Input
                                            id="name"
                                            placeholder="Ex: Plano Operacional HCSL"
                                            value={novoProjetoNome}
                                            onChange={(e) => setNovoProjetoNome(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddClick()}
                                            className="h-12 text-lg"
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleAddClick} className="px-8 py-3">Criar Projeto</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>

                <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    {/* Cards de estatísticas */}
                    {projetos.length > 0 && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/20 rounded-full">
                                            <FolderKanban className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <p className="text-blue-100 text-sm font-medium">Total de Projetos</p>
                                            <p className="text-3xl font-bold">{getTotalProjects()}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/20 rounded-full">
                                            <TrendingUp className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <p className="text-green-100 text-sm font-medium">Orçamento Total</p>
                                            <p className="text-2xl font-bold">
                                                {getTotalBudget().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg md:col-span-2 lg:col-span-1">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/20 rounded-full">
                                            <Building2 className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <p className="text-purple-100 text-sm font-medium">Média por Projeto</p>
                                            <p className="text-2xl font-bold">
                                                {projetos.length > 0 ? (getTotalBudget() / projetos.length).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {projetos.length === 0 ? (
                        <Card className="text-center py-20 px-4 bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-2xl">
                            <div className="flex justify-center mb-6">
                                <div className="p-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                                    <FolderPlus size={64} className="text-blue-500" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-slate-800 mb-4">Nenhum projeto por aqui!</h2>
                            <p className="text-slate-600 text-lg max-w-md mx-auto">Clique em &quot;Criar Novo Projeto&quot; para começar a sua jornada de gestão de custos operacionais.</p>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {projetos.map(projeto => (
                                <Card
                                    key={projeto.id}
                                    className="group flex flex-col justify-between bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border-0 hover:shadow-2xl hover:-translate-y-2 hover:bg-white transition-all duration-500 cursor-pointer min-h-[280px] overflow-hidden relative"
                                    onClick={() => onSelectProject(projeto.id)}
                                >
                                    {/* Gradiente sutil no topo */}
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>

                                    <CardHeader className="pb-4">
                                        <CardTitle className="flex items-start gap-4">
                                            <div className="flex-shrink-0 p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                                                <FileText size={24} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <span className="text-xl font-bold text-slate-800 line-clamp-2 group-hover:text-blue-700 transition-colors duration-300">
                                                    {projeto.nome}
                                                </span>
                                                <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                                                    <Building2 size={14} />
                                                    {(projeto.departamentos || []).length} departamento(s)
                                                </p>
                                            </div>
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="flex-1 flex flex-col justify-center">
                                        <div className="text-center py-4">
                                            <p className="text-sm text-slate-500 mb-2">Orçamento Total</p>
                                            <p className="text-3xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors duration-300">
                                                {calculateTotalProjeto(projeto).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </p>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="flex justify-end p-4 border-t border-slate-100 mt-auto bg-slate-50/50 group-hover:bg-blue-50/50 transition-all duration-300">
                                        <DropdownMenu>
                                            <Tooltip>
                                                <TooltipTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="hover:bg-white/80 transition-all duration-300">
                                                            <MoreVertical className="h-5 w-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Mais opções</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                    onSelect={() => onDeleteProject(projeto.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Apagar Projeto</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </TooltipProvider>
    );
}