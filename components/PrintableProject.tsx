// components/PrintableProject.tsx
import React from 'react';
import { Projeto, Recurso, CategoriasRecursos } from '@/types';
import { RECURSO_META } from '@/lib/constants'; // Usamos o RECURSO_META normal com ícones React
import { PrintOptions } from './ProjectEditor'; // Importa a interface de opções

interface PrintableProjectProps {
    projeto: Projeto;
    options: PrintOptions; // Recebe as opções de impressão
}

export const PrintableProject = React.forwardRef<HTMLDivElement, PrintableProjectProps>(({ projeto, options }, ref) => {
    const calculateSubtotal = (recursos: Recurso[]) => recursos.reduce((acc, item) => acc + Number(item.custo || 0), 0);

    const calculateTotalProjeto = () => {
        const recursosUnicos = new Map<string, number>();
        projeto.departamentos.forEach(dep => {
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
        <div ref={ref} className="p-10 font-sans bg-white text-black">
            <style type="text/css" media="print">
                {`
          @page { size: auto; margin: 20mm; }
          body { -webkit-print-color-adjust: exact; color-adjust: exact; }
          .department-page { page-break-after: always; }
        `}
            </style>
            <header className="mb-8 border-b-2 border-gray-800 pb-4 text-center">
                <h1 className="text-4xl font-bold">Relatório do Projeto: {projeto.nome}</h1>
            </header>

            <div className="space-y-8">
                {projeto.departamentos.map((dep, index) => (
                    <section key={dep.id} className={index < projeto.departamentos.length - 1 ? 'department-page' : ''}>
                        <h2 className="text-3xl font-semibold text-gray-800 bg-gray-100 p-3 rounded-lg mb-4">
                            Departamento: {dep.nome}
                        </h2>
                        <div className="space-y-6">
                            {(dep.pops || []).map(pop => {
                                const recursosDoPop = pop.grupoRecursosId ? (dep.gruposDeRecursos || []).find(g => g.id === pop.grupoRecursosId)?.recursos : pop.recursos;
                                const nomeDoGrupo = pop.grupoRecursosId ? (dep.gruposDeRecursos || []).find(g => g.id === pop.grupoRecursosId)?.nome : null;
                                if (!recursosDoPop) return null;

                                return (
                                    <div key={pop.id} className="p-4 border-2 rounded-lg bg-slate-50 break-inside-avoid">
                                        <h3 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">
                                            POP: {pop.nome}
                                            {nomeDoGrupo && <span className="text-base font-normal text-gray-500 ml-2">(Usando Modelo: {nomeDoGrupo})</span>}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {Object.entries(RECURSO_META).map(([key, meta]) => {
                                                const items = recursosDoPop[key as CategoriasRecursos] || [];
                                                if (items.length === 0) return null;
                                                const Icon = meta.icon;
                                                return (
                                                    <div key={key} className="p-3 border rounded-md bg-white">
                                                        <h4 className={`flex items-center gap-2 text-lg font-bold mb-2 ${meta.color}`}>
                                                            <Icon className="h-5 w-5" /> {meta.label}
                                                        </h4>
                                                        <ul className="space-y-1 text-sm">
                                                            {items.map(item => (
                                                                <li key={item.id} className="flex justify-between">
                                                                    <span>{item.nome}</span>
                                                                    <span className="font-mono">{Number(item.custo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        {/* LÓGICA PARA MOSTRAR/ESCONDER SUBTOTAL */}
                                                        {options.showSubtotals && items.length > 1 && (
                                                            <div className="flex justify-between font-bold text-sm mt-2 pt-2 border-t">
                                                                <span>Subtotal</span>
                                                                <span>{calculateSubtotal(items).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* RENDERIZAR OBSERVAÇÕES */}
                        {dep.observacao && (
                            <div className="mt-6 p-4 border-t-4 border-gray-300 bg-gray-100 rounded-b-lg">
                                <h4 className="font-bold text-lg text-gray-700">Observações:</h4>
                                <p className="text-gray-600 whitespace-pre-wrap">{dep.observacao}</p>
                            </div>
                        )}
                    </section>
                ))}
            </div>

            <footer className="mt-12 pt-4 border-t-2 border-gray-800 text-right">
                <span className="text-xl font-bold">TOTAL GERAL DO PROJETO:</span>
                <span className="text-3xl font-bold ml-4 text-green-600">
                    {calculateTotalProjeto().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
            </footer>
        </div>
    );
});

PrintableProject.displayName = 'PrintableProject';