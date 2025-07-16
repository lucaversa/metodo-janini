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
    const map: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
        '/': '&#x2F;' // Adicionar escape para "/"
    };
    return text.replace(/[&<>"'\/]/g, (m) => map[m]);
}

const generateStaticHTML = (projeto: Projeto, options: PrintOptions): string => {
    const coresDepartamentos = [
        { header: 'bg-purple-600', tableHeader: 'bg-purple-500', row: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-900', textColor: '#581c87' },
        { header: 'bg-blue-600', tableHeader: 'bg-blue-500', row: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900', textColor: '#1e3a8a' },
        { header: 'bg-emerald-600', tableHeader: 'bg-emerald-500', row: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-900', textColor: '#065f46' },
        { header: 'bg-rose-600', tableHeader: 'bg-rose-500', row: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-900', textColor: '#881337' },
        { header: 'bg-amber-600', tableHeader: 'bg-amber-500', row: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-900', textColor: '#92400e' },
    ];

    let html = '';
    const projectIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline-block mr-3 align-middle"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`;

    let pageCounter = 0;

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
        popsAgrupados.forEach(grupo => {
            if (grupo.recursos) {
                (Object.keys(grupo.recursos) as CategoriasRecursos[]).forEach(tipo => {
                    if (grupo.recursos[tipo] && grupo.recursos[tipo]!.length > 0) tiposRecursosDoDep.add(tipo);
                });
            }
        });

        const tiposRecursosArray = Array.from(tiposRecursosDoDep);
        let totalDepartamento = 0;
        popsAgrupados.forEach(grupo => {
            if (grupo.recursos) {
                Object.values(grupo.recursos).flat().forEach(rec => { totalDepartamento += rec.custo || 0; });
            }
        });

        const popsArray = Array.from(popsAgrupados.values());

        const calculatePages = (pops: typeof popsArray) => {
            const MAX_ROWS_PER_PAGE = 6;
            return Math.ceil(pops.length / MAX_ROWS_PER_PAGE) || 1;
        };

        const totalPages = calculatePages(popsArray);

        const divideIntoPages = (pops: typeof popsArray, totalPages: number) => {
            const pages: (typeof popsArray)[] = [];
            if (totalPages === 0) return pages;
            const itemsPerPage = Math.ceil(pops.length / totalPages);
            for (let i = 0; i < totalPages; i++) {
                const startIndex = i * itemsPerPage;
                const endIndex = Math.min(startIndex + itemsPerPage, pops.length);
                pages.push(pops.slice(startIndex, endIndex));
            }
            return pages;
        };

        const pages = divideIntoPages(popsArray, totalPages);

        pages.forEach((pageData, pageIndex) => {
            const currentPage = pageIndex + 1;
            const isLastPage = pageIndex === pages.length - 1;

            html += `
                <div class="page-container ${pageCounter > 0 ? 'page-break' : ''}" data-dept-index="${depIndex}" data-page-index="${pageIndex}">
                    <div class="page-border">
                        <div class="content-center border-4 ${cores.border}">
                            <div class="project-name-corner" style="color: ${cores.textColor};">
                                ${projectIconSVG}
                                <span>${escapeHtml(projeto.nome)}</span>
                            </div>
                            <div class="table-container">
                                <header class="${cores.header} p-6 rounded-t-lg text-white text-center border-t-2 border-x-2 ${cores.border}">
                                    <h2 class="text-2xl font-bold tracking-wider">
                                        ${escapeHtml(dep.nome)}${totalPages > 1 ? ` (${currentPage}/${totalPages})` : ''}
                                    </h2>
                                </header>
                                <div class="overflow-hidden border-x-2 border-b-2 ${cores.border} rounded-b-lg bg-white">
                                    <table class="w-full table-fixed" id="table-${depIndex}-${pageIndex}">
                                        <thead>
                                            <tr class="${cores.tableHeader}">
                                                <th class="p-3 font-bold text-white text-left border-r border-white/30 table-header-text" style="width: 20%;">POP</th>
                                                ${tiposRecursosArray.map((tipo: CategoriasRecursos) => {
                const meta = RECURSO_META_IMPRESSAO[tipo];
                return `<th class="p-3 font-bold text-white text-center border-r border-white/30 last:border-r-0 table-header-text" style="width: ${tiposRecursosArray.length > 0 ? (80 / tiposRecursosArray.length) : 80}%;">${escapeHtml(meta?.label)}</th>`
            }).join('')}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${pageData.map((grupo, grupoIndex) => `
                                                <tr class="${grupoIndex % 2 === 0 ? 'bg-white' : cores.row}">
                                                    <td class="p-3 border-t border-r ${cores.border} font-semibold ${cores.text} align-top">
                                                        <div class="font-bold">${escapeHtml(grupo.popNames.join(', '))}</div>
                                                        ${grupo.grupo ? `<div class="opacity-70 mt-1" style="font-size: 0.9em;">Modelo: ${escapeHtml(grupo.grupo.nome)}</div>` : ''}
                                                    </td>
                                                    ${tiposRecursosArray.map((tipo: CategoriasRecursos) => {
                const recursos = (grupo.recursos && grupo.recursos[tipo]) ? grupo.recursos[tipo]! : [];
                const subtotal = recursos.reduce((acc: number, item: Recurso) => acc + (item.custo || 0), 0);
                let cellContent = `<span class="text-gray-400 italic">N/A</span>`;
                if (recursos.length > 0) {
                    cellContent = `<div class="resource-list">${recursos.map((rec: Recurso) => {
                        const observacoesHtml = rec.observacoes ? `<div class="resource-observation">${escapeHtml(rec.observacoes)}</div>` : '';
                        return `<div class="resource-item">
                                                                            <span class="resource-name">${escapeHtml(rec.nome)}</span>
                                                                            ${observacoesHtml}
                                                                        </div>`;
                    }).join('')}</div>`;
                    if (options.showSubtotals && subtotal > 0 && tipo !== 'recorrencia') {
                        cellContent += `<div class="subtotal-row">Subtotal: ${subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>`;
                    }
                }
                return `<td class="p-2 border-t border-r ${cores.border} last:border-r-0 align-top">${cellContent}</td>`;
            }).join('')}
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                        ${options.showSubtotals && totalDepartamento > 0 && isLastPage ? `
                                        <tfoot>
                                            <tr class="${cores.tableHeader} font-bold text-white">
                                                <td colspan="${tiposRecursosArray.length + 1}" class="p-3 text-right">
                                                    TOTAL DO DEPARTAMENTO: ${totalDepartamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </td>
                                            </tr>
                                        </tfoot>
                                        ` : ''}
                                    </table>
                                </div>
                            </div>
                            <div class="logo-corner">
                                <div class="logo-box flex items-center justify-center">
                                    <img src="/logo.png" alt="Logo da Empresa" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                                </div>
                            </div>
                            
                            ${isLastPage && dep.observacao ? `
                            <div class="observacoes-container">
                                <h3 class="font-bold text-gray-700">Observações:</h3>
                                <p class="text-gray-600 whitespace-pre-wrap">${escapeHtml(dep.observacao)}</p>
                            </div>
                            ` : ''}
                            </div>
                    </div>
                </div>`;
            pageCounter++;
        });
    });

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
                    @page { size: A4 landscape; margin: 0; }
                    body { font-family: ui-sans-serif, system-ui, sans-serif; -webkit-print-color-adjust: exact; color-adjust: exact; }
                    .page-container { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; box-sizing: border-box; }
                    .page-border { position: relative; width: calc(100% - 30mm); height: calc(100% - 30mm); border: 2px solid #d1d5db; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-sizing: border-box; padding: 10px; }
                    .content-center { width: 100%; height: 100%; border-radius: 8px; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; position: relative; }
                    .table-container { width: 100%; font-size: 12px; max-height: calc(100vh - 200px); }
                    .project-name-corner { position: absolute; top: 25px; right: 25px; font-size: 22px; font-weight: 700; z-index: 10; display: flex; align-items: center; }
                    .logo-corner { position: absolute; bottom: 15px; left: 25px; z-index: 10; }
                    .logo-box { width: 170px; height: 100px; font-size: 1.1rem; font-weight: 600; }
                    .page-break { page-break-before: always; }
                    table { border-collapse: collapse; }
                    th, td { word-wrap: break-word; overflow-wrap: break-word; }
                    .resource-list { display: flex; flex-direction: column; gap: 4px; }
                    .resource-item { display: flex; flex-direction: column; padding-bottom: 4px; border-bottom: 1px solid #f3f4f6; }
                    .resource-item:last-child { border-bottom: none; padding-bottom: 0; }
                    .resource-name { text-align: left; font-size: 1em; line-height: 1.3; }
                    .resource-observation { font-size: 0.9em; color: #6b7280; font-style: italic; padding-top: 3px; white-space: pre-wrap; word-wrap: break-word; }
                    .subtotal-row { margin-top: 6px; padding-top: 6px; border-top: 1px solid #e5e7eb; font-weight: bold; text-align: right; font-size: 0.95em; }
                    
                    /* ### MODIFICAÇÃO: Aumentar tamanho do texto das observações ### */
                    .observacoes-container {
                        position: absolute;
                        bottom: 15px;
                        right: 25px;
                        z-index: 10;
                        max-width: 45%;
                        font-size: 14px; /* Aumentado de 10px para 14px */
                        text-align: right;
                    }
                    /* ### FIM DA MODIFICAÇÃO ### */
                </style>
            </head>
            <body>
                ${generateStaticHTML(projeto, options)}
                <script>
                    function adjustLayoutDynamically() {
                        const pages = document.querySelectorAll('.page-container');
                        pages.forEach(page => {
                            const table = page.querySelector('table');
                            if (!table) return;

                            const rows = table.querySelectorAll('tbody tr');
                            if (rows.length === 0) return;

                            const numColumns = rows[0].querySelectorAll('td').length;
                            const columnCharCounts = Array(numColumns).fill(0);
                            rows.forEach(row => {
                                const cells = row.querySelectorAll('td');
                                cells.forEach((cell, index) => {
                                    columnCharCounts[index] += cell.innerText.length;
                                });
                            });
                            const COLUMN_THRESHOLDS = [
                                { limit: 500, size: '7px' },
                                { limit: 350, size: '8px' },
                                { limit: 200, size: '9px' },
                                { limit: 100, size: '10px' }
                            ];
                            columnCharCounts.forEach((totalChars, columnIndex) => {
                                for (const threshold of COLUMN_THRESHOLDS) {
                                    if (totalChars > threshold.limit) {
                                        rows.forEach(row => {
                                            const cell = row.querySelectorAll('td')[columnIndex];
                                            if (cell) {
                                                cell.style.fontSize = threshold.size;
                                                cell.style.lineHeight = '1.2';
                                            }
                                        });
                                        break;
                                    }
                                }
                            });
                        });
                    }
                    window.onload = () => {
                        try {
                            adjustLayoutDynamically();
                        } catch(e) {
                            console.error("Falha ao ajustar layout de impressão:", e);
                        }
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