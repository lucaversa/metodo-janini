// components/PrintableProject.tsx
import React from 'react';
import { Projeto, Recurso, CategoriasRecursos, GrupoDeRecursos, Recursos } from '@/types';

const RECURSO_HEADER_META: { [key in CategoriasRecursos | 'pop']: { label: string; } } = {
    pop: { label: 'POP' },
    pessoas: { label: 'PESSOAS' },
    documentos: { label: 'DOCUMENTOS' },
    locais: { label: 'LOCAIS' },
    sistemas: { label: 'SISTEMA' },
    equipamentos: { label: 'EQUIPAMENTOS' },
    consumiveis: { label: 'CONSUMÍVEIS' },
};

const colorThemes = [
    { bg: 'bg-purple-600', text: 'text-purple-800', border: 'border-purple-300' },
    { bg: 'bg-blue-600', text: 'text-blue-800', border: 'border-blue-300' },
    { bg: 'bg-emerald-600', text: 'text-emerald-800', border: 'border-emerald-300' },
    { bg: 'bg-rose-600', text: 'text-rose-800', border: 'border-rose-300' },
    { bg: 'bg-amber-600', text: 'text-amber-800', border: 'border-amber-300' },
];

interface PrintableProjectProps {
    projeto: Projeto;
}

export const PrintableProject = React.forwardRef<HTMLDivElement, PrintableProjectProps>(({ projeto }, ref) => {
    const columnOrder: (CategoriasRecursos | 'pop')[] = ['pop', 'pessoas', 'documentos', 'locais', 'sistemas', 'equipamentos', 'consumiveis'];

    return (
        <div ref={ref} className="bg-white text-black font-sans">
            <style type="text/css" media="print">
                {`
          @page { size: A4 landscape; margin: 15mm; }
          body { -webkit-print-color-adjust: exact; color-adjust: exact; }
          .department-page { page-break-after: always; }
          .grid-cell { page-break-inside: avoid; }
        `}
            </style>

            {projeto.departamentos.map((dep, index) => {
                const theme = colorThemes[index % colorThemes.length];

                const popsAgrupados = new Map<string, { popNames: string[], grupo?: GrupoDeRecursos, recursos: Recursos }>();
                (dep.pops || []).forEach(pop => {
                    const chaveDoGrupo = pop.grupoRecursosId || `individual_${pop.id}`;
                    if (!popsAgrupados.has(chaveDoGrupo)) {
                        const grupo = pop.grupoRecursosId ? (dep.gruposDeRecursos || []).find(g => g.id === pop.grupoRecursosId) : undefined;
                        popsAgrupados.set(chaveDoGrupo, {
                            popNames: [],
                            grupo: grupo,
                            recursos: grupo ? grupo.recursos : pop.recursos
                        });
                    }
                    popsAgrupados.get(chaveDoGrupo)!.popNames.push(pop.nome);
                });

                // <<<<<<< CORREÇÃO AQUI: Definindo o tipo do array >>>>>>>>>
                const allGridCells: JSX.Element[] = [];

                // 1. Adicionar os cabeçalhos das colunas
                columnOrder.forEach(colKey => {
                    allGridCells.push(
                        <div key={`header-${colKey}`} className={`p-2 font-bold text-center text-white text-sm ${theme.bg} border-r border-white/50`}>
                            {RECURSO_HEADER_META[colKey].label}
                        </div>
                    );
                });

                // 2. Adicionar as células de conteúdo para cada grupo de POPs
                Array.from(popsAgrupados.entries()).forEach(([chave, infoGrupo]) => {
                    const rowCells = columnOrder.map((colKey, colIndex) => {
                        let content;
                        if (colKey === 'pop') {
                            content = infoGrupo.popNames.map(name => <div key={name}>{name}</div>);
                        } else {
                            const recursos = infoGrupo.recursos[colKey as CategoriasRecursos] || [];
                            if (recursos.length > 0) {
                                content = recursos.map(recurso => <div key={recurso.id}>{recurso.nome}</div>);
                            } else {
                                content = <span className="text-gray-400 italic">Não se aplica</span>;
                            }
                        }

                        return (
                            <div key={`${chave}-${colKey}`} className={`grid-cell p-2 border-t text-sm min-h-[60px] ${theme.border} ${colIndex < 6 ? `border-r ${theme.border}` : ''}`}>
                                {content}
                            </div>
                        );
                    });
                    allGridCells.push(...rowCells);
                });

                return (
                    <div key={dep.id} className="department-page w-full">
                        <header className={`p-4 text-center text-white font-bold text-4xl rounded-t-lg ${theme.bg}`}>
                            {dep.nome.toUpperCase()}
                        </header>
                        <div className="grid grid-cols-7 border-l border-r border-b border-gray-300">
                            {allGridCells}
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

PrintableProject.displayName = 'PrintableProject';