'use client';

import React, { useState } from 'react';
import { Projeto, Recurso, CategoriasRecursos, Recursos, GrupoDeRecursos } from '@/types';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from "sonner";
import { RECURSO_META_IMPRESSAO } from '@/lib/constants';

interface PrintButtonTabularProps {
    projeto: Projeto;
    className?: string;
}

interface PrintOptions {
    showSubtotals: boolean;
}

function escapeHtml(text: string | undefined | null) {
    if (!text) return '';
    const map: { [key: string]: string } = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

const generateStaticHTML = (projeto: Projeto, options: PrintOptions): string => {
    const coresDepartamentos = [
        { header: 'bg-purple-600', tableHeader: 'bg-purple-500', row: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900' },
        { header: 'bg-blue-600', tableHeader: 'bg-blue-500', row: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900' },
        { header: 'bg-emerald-600', tableHeader: 'bg-emerald-500', row: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900' },
        { header: 'bg-rose-600', tableHeader: 'bg-rose-500', row: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900' },
        { header: 'bg-amber-600', tableHeader: 'bg-amber-500', row: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900' },
    ];

    let html = '<div class="font-sans text-gray-800 max-w-7xl mx-auto">';

    projeto.departamentos.forEach((dep, depIndex) => {
        const cores = coresDepartamentos[depIndex % coresDepartamentos.length];
        const popsAgrupados = new Map<string, { popNames: string[], grupo?: GrupoDeRecursos, recursos: Recursos }>();
        (dep.pops || []).forEach(pop => {
            const chaveDoGrupo = pop.grupoRecursosId || `individual_${pop.id}`;
            if (!popsAgrupados.has(chaveDoGrupo)) {
                const grupo = pop.grupoRecursosId ? (dep.gruposDeRecursos || []).find(g => g.id === pop.grupoRecursosId) : undefined;
                popsAgrupados.set(chaveDoGrupo, { popNames: [], grupo, recursos: grupo ? grupo.recursos : pop.recursos });
            }
            popsAgrupados.get(chaveDoGrupo)!.popNames.push(pop.nome);
        });

        const tiposRecursosDoDep = new Set<CategoriasRecursos>();
        let totalRecursos = 0;
        popsAgrupados.forEach(grupo => {
            if (grupo.recursos) {
                (Object.keys(grupo.recursos) as CategoriasRecursos[]).forEach(tipo => {
                    if (grupo.recursos[tipo] && grupo.recursos[tipo].length > 0) {
                        tiposRecursosDoDep.add(tipo);
                        totalRecursos += grupo.recursos[tipo].length;
                    }
                });
            }
        });

        const tiposRecursosArray = Array.from(tiposRecursosDoDep);

        let totalDepartamento = 0;
        if (options.showSubtotals) {
            popsAgrupados.forEach(grupo => {
                if (grupo.recursos) {
                    Object.values(grupo.recursos).flat().forEach(rec => {
                        totalDepartamento += rec.custo || 0;
                    });
                }
            });
        }

        // ✨ CADA DEPARTAMENTO AGORA É UM BLOCO QUE TENTA NÃO QUEBRAR A PÁGINA
        html += `
            <div class="department-report ${depIndex > 0 ? 'page-break' : ''}">
                <header class="${cores.header} p-4 rounded-t-lg text-white text-center shadow-lg border-t-2 border-x-2 ${cores.border}">
                    <h1 class="text-2xl font-bold tracking-wider">${escapeHtml(projeto.nome)}</h1>
                    <h2 class="text-lg font-light">${escapeHtml(dep.nome)}</h2>
                </header>
                <div class="overflow-hidden border-x-2 border-b-2 ${cores.border} rounded-b-lg shadow-lg bg-white">
                    <table class="w-full table-fixed">
                        <thead>
                            <tr class="${cores.tableHeader}">
                                <th class="p-3 font-bold text-white text-left border-r border-white/30" style="width: 30%;">POP</th>
                                ${tiposRecursosArray.map(tipo => {
            const meta = RECURSO_META_IMPRESSAO[tipo];
            return `<th class="p-3 font-bold text-white text-center border-r border-white/30 last:border-r-0" style="width: ${70 / tiposRecursosArray.length}%;">${escapeHtml(meta.label)}</th>`
        }).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${Array.from(popsAgrupados.values()).map((grupo, grupoIndex) => `
                                <tr class="${grupoIndex % 2 === 0 ? 'bg-white' : cores.row}">
                                    <td class="p-3 border-t border-r ${cores.border} font-semibold ${cores.text} align-top">
                                        <div class="font-bold">${escapeHtml(grupo.popNames.join(', '))}</div>
                                        ${grupo.grupo ? `<div class="text-xs opacity-70 mt-1">Modelo: ${escapeHtml(grupo.grupo.nome)}</div>` : ''}
                                    </td>
                                    ${tiposRecursosArray.map(tipo => {
            const recursos = grupo.recursos[tipo] || [];
            const subtotal = recursos.reduce((acc: number, item: Recurso) => acc + (item.custo || 0), 0);
            let cellContent = `<span class="text-gray-400 italic">N/A</span>`;
            if (recursos.length > 0) {
                cellContent = `<ul class="space-y-1 list-none p-0 m-0">${recursos.map(rec => `<li>${escapeHtml(rec.nome)}</li>`).join('')}</ul>`;
                if (options.showSubtotals && subtotal > 0) {
                    cellContent += `<div class="mt-2 pt-1 border-t ${cores.border} font-bold text-right subtotal-text">Subtotal: ${subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>`;
                }
            }
            return `<td class="p-2 border-t border-r ${cores.border} last:border-r-0 align-top">${cellContent}</td>`;
        }).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                        ${options.showSubtotals && totalDepartamento > 0 ? `
                        <tfoot>
                            <tr class="${cores.tableHeader} text-white font-bold">
                                {/* ✨ ESTILO DO TOTAL ALTERADO: CLASSE ADICIONADA */}
                                <td colspan="${tiposRecursosArray.length + 1}" class="p-3 text-right total-footer">
                                    TOTAL DO DEPARTAMENTO: ${totalDepartamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                            </tr>
                        </tfoot>
                        ` : ''}
                    </table>
                </div>`;

        if (dep.observacao) {
            html += `<div class="mt-4 p-4 rounded-lg border-2 ${cores.border} ${cores.row} shadow-sm"><strong class="${cores.text}">OBSERVAÇÕES:</strong> <span class="ml-2">${escapeHtml(dep.observacao).replace(/\n/g, '<br>')}</span></div>`;
        }
        html += `</div>`; // Fim de .department-report
    });

    html += '</div>';
    return html;
};

export const PrintButtonTabular: React.FC<PrintButtonTabularProps> = ({ projeto, className = '' }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [options, setOptions] = useState<PrintOptions>({ showSubtotals: true });

    const handlePrint = () => {
        setIsDialogOpen(false);
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('Por favor, permita pop-ups para imprimir');
            return;
        }

        const printContent = `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Relatório - ${escapeHtml(projeto.nome)}</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    @page { 
                        size: A4 landscape; 
                        margin: 1cm; /* Margem reduzida para dar mais espaço */
                    }
                    /* ✨ REGRAS DE CSS MELHORADAS PARA CENTRALIZAÇÃO E ESCALA */
                    html, body {
                        height: 100%;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                    }
                    body { 
                        font-family: ui-sans-serif, system-ui, sans-serif; 
                        -webkit-print-color-adjust: exact; 
                        color-adjust: exact;
                        line-height: 1.4;
                    }
                    .page-break { page-break-before: always; }
                    table { border-collapse: collapse; }
                    th, td {
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                    }
                    .subtotal-text {
                        font-size: 0.8em; /* Fonte do subtotal menor */
                        color: #4b5563;  /* Cor cinza escura para o subtotal */
                    }
                    .total-footer {
                        font-size: 0.9em; /* Fonte do total um pouco menor */
                        color: #e5e7eb;  /* Cor cinza clara para contrastar com o fundo escuro */
                    }

                    @media print {
                        html, body {
                           background-color: #f0f0f0; /* Fundo cinza claro para visualização */
                        }
                        body {
                            /* Força a centralização vertical e horizontal */
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        /* O container principal do relatório */
                        body > div {
                            width: 100%;
                            height: fit-content;
                        }
                        /* O bloco de cada departamento */
                        .department-report {
                           /* TENTA MANTER TUDO EM UMA PÁGINA */
                           page-break-inside: avoid !important;
                           /* A MÁGICA ACONTECE AQUI: A fonte escala com a altura da página */
                           font-size: 1.2vh; 
                           margin-bottom: 2em; /* Espaçamento entre relatórios, se houver mais de um */
                        }
                        .shadow-lg, .shadow-sm {
                            box-shadow: none !important;
                        }
                    }
                </style>
            </head>
            <body>
                ${generateStaticHTML(projeto, options)}
                <script>
                    window.onload = () => {
                        setTimeout(() => { window.print(); }, 500);
                    };
                </script>
            </body>
            </html>`;

        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className={`hover:bg-gray-50 transition-colors ${className}`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Relatório Tabular
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Opções do Relatório</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="show-subtotals"
                            checked={options.showSubtotals}
                            onCheckedChange={(checked) => setOptions(prev => ({ ...prev, showSubtotals: checked }))}
                        />
                        <Label htmlFor="show-subtotals" className="text-sm font-medium">
                            Exibir Totais e Subtotais
                        </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Mostra a soma dos custos para cada categoria e o total por departamento.
                    </p>
                </div>
                <DialogFooter>
                    <Button onClick={handlePrint} className="w-full">
                        Gerar Relatório
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};