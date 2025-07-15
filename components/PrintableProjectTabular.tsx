// components/PrintableProjectTabular.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Projeto, Recurso, CategoriasRecursos, Pop, Recursos, GrupoDeRecursos } from '@/types';
import { RECURSO_META } from '@/lib/constants';

interface PrintableProjectTabularProps {
    projeto: Projeto;
}

export const PrintableProjectTabular = React.forwardRef<HTMLDivElement, PrintableProjectTabularProps>(({ projeto }, ref) => {
    const [fontSize, setFontSize] = useState(12);
    const tableRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Cores para cada departamento/etapa
    const coresDepartamentos = [
        { bg: 'bg-pink-200', header: 'bg-pink-400', text: 'text-pink-800', border: 'border-pink-300' },
        { bg: 'bg-blue-200', header: 'bg-blue-400', text: 'text-blue-800', border: 'border-blue-300' },
        { bg: 'bg-green-200', header: 'bg-green-400', text: 'text-green-800', border: 'border-green-300' },
        { bg: 'bg-yellow-200', header: 'bg-yellow-400', text: 'text-yellow-800', border: 'border-yellow-300' },
        { bg: 'bg-purple-200', header: 'bg-purple-400', text: 'text-purple-800', border: 'border-purple-300' },
        { bg: 'bg-red-200', header: 'bg-red-400', text: 'text-red-800', border: 'border-red-300' },
        { bg: 'bg-indigo-200', header: 'bg-indigo-400', text: 'text-indigo-800', border: 'border-indigo-300' },
        { bg: 'bg-teal-200', header: 'bg-teal-400', text: 'text-teal-800', border: 'border-teal-300' },
    ];

    // Função para ajustar o tamanho da fonte baseado no conteúdo
    const adjustFontSize = () => {
        if (!tableRef.current || !containerRef.current) return;

        const container = containerRef.current;
        const table = tableRef.current;

        // Espaço reservado para logo (inferior esquerda) e nome do projeto (superior direita)
        const reservedHeight = 120; // 60px para logo + 60px para nome do projeto
        const reservedWidth = 200; // largura reservada para logo e nome

        const availableHeight = container.clientHeight - reservedHeight;
        const availableWidth = container.clientWidth - reservedWidth;

        let currentFontSize = 12;

        // Testa diferentes tamanhos de fonte
        while (currentFontSize > 6) {
            table.style.fontSize = `${currentFontSize}px`;

            if (table.scrollHeight <= availableHeight && table.scrollWidth <= availableWidth) {
                break;
            }

            currentFontSize -= 0.5;
        }

        setFontSize(currentFontSize);
    };

    useEffect(() => {
        adjustFontSize();
        window.addEventListener('resize', adjustFontSize);
        return () => window.removeEventListener('resize', adjustFontSize);
    }, [projeto]);

    // Função para agrupar POPs por recursos compartilhados
    const agruparPops = (pops: Pop[], gruposDeRecursos: GrupoDeRecursos[] = []) => {
        const popsAgrupados = new Map<string, { popNames: string[], grupo?: GrupoDeRecursos, recursos: Recursos }>();

        pops.forEach(pop => {
            const chaveDoGrupo = pop.grupoRecursosId || `individual_${pop.id}`;

            if (!popsAgrupados.has(chaveDoGrupo)) {
                const grupo = pop.grupoRecursosId ? gruposDeRecursos.find(g => g.id === pop.grupoRecursosId) : undefined;
                popsAgrupados.set(chaveDoGrupo, {
                    popNames: [],
                    grupo: grupo,
                    recursos: grupo ? grupo.recursos : pop.recursos
                });
            }
            popsAgrupados.get(chaveDoGrupo)!.popNames.push(pop.nome);
        });

        return Array.from(popsAgrupados.values());
    };

    // Função para obter todos os tipos de recursos únicos do departamento
    const obterTiposRecursos = (popsAgrupados: ReturnType<typeof agruparPops>) => {
        const tiposRecursos = new Set<CategoriasRecursos>();

        popsAgrupados.forEach(grupo => {
            if (grupo.recursos) {
                Object.keys(grupo.recursos).forEach(tipo => {
                    const recursos = grupo.recursos[tipo as CategoriasRecursos];
                    if (recursos && recursos.length > 0) {
                        tiposRecursos.add(tipo as CategoriasRecursos);
                    }
                });
            }
        });

        return Array.from(tiposRecursos);
    };

    // Função para calcular custo total de um grupo de recursos
    const calcularCustoGrupo = (recursos: Recursos) => {
        let total = 0;
        Object.values(recursos).forEach(categoria => {
            if (categoria) {
                categoria.forEach(recurso => {
                    total += Number(recurso.custo || 0);
                });
            }
        });
        return total;
    };

    // Função para calcular total do departamento
    const calcularTotalDepartamento = (popsAgrupados: ReturnType<typeof agruparPops>) => {
        return popsAgrupados.reduce((total, grupo) => total + calcularCustoGrupo(grupo.recursos), 0);
    };

    return (
        <div ref={ref} className="bg-white text-black">
            <style type="text/css" media="print">
                {`
                    @page { 
                        size: A4 landscape; 
                        margin: 15mm; 
                    }
                    body { 
                        -webkit-print-color-adjust: exact; 
                        color-adjust: exact; 
                    }
                    .page-break { 
                        page-break-before: always; 
                    }
                    .avoid-break { 
                        page-break-inside: avoid; 
                    }
                    .print-only {
                        display: block !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .logo-space {
                        position: absolute;
                        bottom: 20px;
                        left: 20px;
                        width: 150px;
                        height: 80px;
                        background: white;
                        z-index: 10;
                        border: 2px solid #ccc;
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        color: #666;
                    }
                    .project-name-space {
                        position: absolute;
                        top: 20px;
                        right: 20px;
                        padding: 10px 20px;
                        background: white;
                        z-index: 10;
                        border: 2px solid #ccc;
                        border-radius: 8px;
                        font-weight: bold;
                        color: #333;
                        max-width: 200px;
                        text-align: center;
                    }
                `}
            </style>

            {projeto.departamentos.map((dep, depIndex) => {
                const cores = coresDepartamentos[depIndex % coresDepartamentos.length];
                const popsAgrupados = agruparPops(dep.pops, dep.gruposDeRecursos);
                const tiposRecursos = obterTiposRecursos(popsAgrupados);

                return (
                    <div key={dep.id} className={`${depIndex > 0 ? 'page-break' : ''} relative`} style={{ minHeight: '100vh' }}>
                        <div ref={containerRef} className="avoid-break p-6 h-screen relative">
                            {/* Espaço reservado para logo */}
                            <div className="logo-space">
                                LOGO
                            </div>

                            {/* Espaço reservado para nome do projeto */}
                            <div className="project-name-space">
                                {projeto.nome}
                            </div>

                            {/* Header do Departamento */}
                            <div className={`${cores.header} p-4 rounded-t-lg mb-4 mr-52`}>
                                <h2 className="text-xl font-semibold text-white text-center">
                                    {dep.nome}
                                </h2>
                            </div>

                            {/* Container da Tabela com tamanho ajustável */}
                            <div
                                ref={tableRef}
                                className="overflow-hidden mr-52 mb-32"
                                style={{ fontSize: `${fontSize}px` }}
                            >
                                {/* Tabela Principal */}
                                <div className={`${cores.bg} ${cores.border} border-2 rounded-lg overflow-hidden`}>
                                    {/* Cabeçalho da Tabela */}
                                    <div className={`${cores.header} grid gap-1 p-2`} style={{ gridTemplateColumns: `2fr repeat(${tiposRecursos.length}, minmax(150px, 1fr))` }}>
                                        <div className="font-bold text-white text-center p-2">
                                            POP
                                        </div>
                                        {tiposRecursos.map(tipo => {
                                            const meta = RECURSO_META[tipo];
                                            return (
                                                <div key={tipo} className="font-bold text-white text-center p-2">
                                                    {meta.label}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Linhas da Tabela */}
                                    {popsAgrupados.map((grupo, grupoIndex) => (
                                        <div key={grupoIndex} className={`grid gap-1 ${grupoIndex % 2 === 0 ? 'bg-white' : cores.bg} border-b ${cores.border}`} style={{ gridTemplateColumns: `2fr repeat(${tiposRecursos.length}, minmax(150px, 1fr))` }}>
                                            {/* Coluna POP */}
                                            <div className={`p-3 ${cores.text} font-semibold`}>
                                                <div className="font-bold">
                                                    {grupo.popNames.join(', ')}
                                                </div>
                                                {grupo.grupo && (
                                                    <div className="text-gray-600 mt-1">
                                                        Modelo: {grupo.grupo.nome}
                                                    </div>
                                                )}
                                                <div className="font-bold mt-2 text-green-700">
                                                    Total: {calcularCustoGrupo(grupo.recursos).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </div>
                                            </div>

                                            {/* Colunas de Recursos */}
                                            {tiposRecursos.map(tipo => {
                                                const recursos = grupo.recursos[tipo] || [];
                                                const subtotal = recursos.reduce((acc, item) => acc + Number(item.custo || 0), 0);

                                                return (
                                                    <div key={tipo} className="p-2">
                                                        {recursos.length > 0 ? (
                                                            <div className="space-y-1">
                                                                {recursos.map((recurso, index) => (
                                                                    <div key={index} className="flex justify-between items-center">
                                                                        <span className="truncate mr-2">{recurso.nome}</span>
                                                                        <span className="font-semibold whitespace-nowrap">
                                                                            {Number(recurso.custo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                                {recursos.length > 1 && (
                                                                    <div className="flex justify-between items-center pt-1 border-t border-gray-300 font-bold">
                                                                        <span>Subtotal:</span>
                                                                        <span>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="text-gray-400 text-center">-</div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>

                                {/* Footer com Total do Departamento */}
                                <div className={`${cores.header} p-4 rounded-lg mt-4 text-center`}>
                                    <span className="text-white font-bold">
                                        TOTAL DO DEPARTAMENTO: {calcularTotalDepartamento(popsAgrupados).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

PrintableProjectTabular.displayName = 'PrintableProjectTabular';