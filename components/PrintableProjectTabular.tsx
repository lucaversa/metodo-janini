// components/PrintableProjectTabular.tsx
import React from 'react';
import { Projeto, Recurso, CategoriasRecursos, Pop, Recursos, GrupoDeRecursos } from '@/types';
import { RECURSO_META } from '@/lib/constants';

interface PrintableProjectTabularProps {
    projeto: Projeto;
}

export const PrintableProjectTabular = React.forwardRef<HTMLDivElement, PrintableProjectTabularProps>(({ projeto }, ref) => {
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
                `}
            </style>

            {projeto.departamentos.map((dep, depIndex) => {
                const cores = coresDepartamentos[depIndex % coresDepartamentos.length];
                const popsAgrupados = agruparPops(dep.pops, dep.gruposDeRecursos);
                const tiposRecursos = obterTiposRecursos(popsAgrupados);

                return (
                    <div key={dep.id} className={`${depIndex > 0 ? 'page-break' : ''} avoid-break p-6 min-h-screen`}>
                        {/* Header do Projeto e Departamento */}
                        <div className={`${cores.header} p-4 rounded-t-lg mb-4`}>
                            <h1 className="text-2xl font-bold text-white text-center">
                                {projeto.nome}
                            </h1>
                            <h2 className="text-xl font-semibold text-white text-center mt-2">
                                {dep.nome}
                            </h2>
                        </div>

                        {/* Tabela Principal */}
                        <div className={`${cores.bg} ${cores.border} border-2 rounded-lg overflow-hidden`}>
                            {/* Cabeçalho da Tabela */}
                            <div className={`${cores.header} grid gap-1 p-2`} style={{ gridTemplateColumns: `2fr repeat(${tiposRecursos.length}, minmax(200px, 1fr))` }}>
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
                                <div key={grupoIndex} className={`grid gap-1 ${grupoIndex % 2 === 0 ? 'bg-white' : cores.bg} border-b ${cores.border}`} style={{ gridTemplateColumns: `2fr repeat(${tiposRecursos.length}, minmax(200px, 1fr))` }}>
                                    {/* Coluna POP */}
                                    <div className={`p-3 ${cores.text} font-semibold`}>
                                        <div className="text-sm font-bold">
                                            {grupo.popNames.join(', ')}
                                        </div>
                                        {grupo.grupo && (
                                            <div className="text-xs text-gray-600 mt-1">
                                                Modelo: {grupo.grupo.nome}
                                            </div>
                                        )}
                                        <div className="text-xs font-bold mt-2 text-green-700">
                                            Total: {calcularCustoGrupo(grupo.recursos).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </div>
                                    </div>

                                    {/* Colunas de Recursos */}
                                    {tiposRecursos.map(tipo => {
                                        const recursos = grupo.recursos[tipo] || [];
                                        const subtotal = recursos.reduce((acc, item) => acc + Number(item.custo || 0), 0);

                                        return (
                                            <div key={tipo} className="p-2 text-xs">
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

                        {/* Observações */}
                        <div className={`${cores.bg} ${cores.border} border-2 border-t-0 rounded-b-lg p-4 mt-0`}>
                            <div className={`${cores.text} text-sm`}>
                                <strong>OBSERVAÇÕES:</strong> Avaliar se existe POP desta atividade (responsabilidade do hospital).
                                Anexo vídeo confeccionado pelo LAC e enviado para a Diretoria Médica.
                            </div>
                        </div>

                        {/* Footer com Total do Departamento */}
                        <div className={`${cores.header} p-4 rounded-lg mt-4 text-center`}>
                            <span className="text-white font-bold text-lg">
                                TOTAL DO DEPARTAMENTO: {calcularTotalDepartamento(popsAgrupados).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

PrintableProjectTabular.displayName = 'PrintableProjectTabular';