// components/RecorrenciaSelector.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { TipoRecorrencia, Recorrencia, RECORRENCIA_OPCOES, formatarRecorrencia } from '@/types/recorrencia';
import { Clock, Plus, X } from 'lucide-react';

interface RecorrenciaSelectorProps {
    recorrencia: Recorrencia;
    onChange: (recorrencia: Recorrencia) => void;
}

const dateToInputFormat = (date?: Date): string => {
    if (!date) return '';
    try {
        // Garante que a data seja tratada como UTC para evitar problemas de fuso horário
        const d = new Date(date);
        return new Date(d.getTime() + d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    } catch {
        return '';
    }
};

type UnidadeIntervalo = 'dias' | 'semanas' | 'meses' | 'anos';

export const RecorrenciaSelector: React.FC<RecorrenciaSelectorProps> = ({ recorrencia, onChange }) => {
    const [tipo, setTipo] = useState<TipoRecorrencia>(recorrencia?.tipo || TipoRecorrencia.UNICA);
    const [horario, setHorario] = useState(recorrencia?.horario || '');
    const [observacoes, setObservacoes] = useState(recorrencia?.observacoes || '');
    const [dataInicio, setDataInicio] = useState(dateToInputFormat(recorrencia?.dataInicio));
    const [dataFim, setDataFim] = useState(dateToInputFormat(recorrencia?.dataFim));
    const [anoFim, setAnoFim] = useState(recorrencia?.anoFim || new Date().getFullYear() + 1);
    const [diasSemana, setDiasSemana] = useState<number[]>(recorrencia?.diasSemana || []);
    const [diaMes, setDiaMes] = useState(recorrencia?.diaMes || 1);
    const [datasEspecificas, setDatasEspecificas] = useState<Date[]>(recorrencia?.datasEspecificas?.map(d => new Date(d)) || []);
    const [intervalo, setIntervalo] = useState(recorrencia?.intervalo || 1);
    const [unidadeIntervalo, setUnidadeIntervalo] = useState<UnidadeIntervalo>(recorrencia?.unidadeIntervalo || 'dias');
    const [novaData, setNovaData] = useState('');

    const diasSemanaOpcoes = [
        { value: 0, label: 'Domingo' }, { value: 1, label: 'Segunda' }, { value: 2, label: 'Terça' },
        { value: 3, label: 'Quarta' }, { value: 4, label: 'Quinta' }, { value: 5, label: 'Sexta' },
        { value: 6, label: 'Sábado' }
    ];

    // Usamos useMemo para criar o objeto finalRec apenas quando uma de suas dependências mudar.
    const finalRec = useMemo((): Recorrencia => ({
        ...recorrencia,
        tipo,
        horario,
        observacoes,
        dataInicio: dataInicio ? new Date(`${dataInicio}T00:00:00Z`) : undefined, // Usar Z para indicar UTC
        dataFim: dataFim ? new Date(`${dataFim}T00:00:00Z`) : undefined, // Usar Z para indicar UTC
        anoFim: tipo === TipoRecorrencia.ANUAL ? anoFim : undefined,
        descricao: RECORRENCIA_OPCOES[tipo as keyof typeof RECORRENCIA_OPCOES].descricao,
        diasSemana: tipo === TipoRecorrencia.SEMANAL ? diasSemana : undefined,
        diaMes: tipo === TipoRecorrencia.MENSAL ? diaMes : undefined,
        datasEspecificas: tipo === TipoRecorrencia.DATAS_ESPECIFICAS ? datasEspecificas : undefined,
        intervalo: tipo === TipoRecorrencia.PERSONALIZADA ? intervalo : undefined,
        unidadeIntervalo: tipo === TipoRecorrencia.PERSONALIZADA ? unidadeIntervalo : undefined,
    }), [recorrencia, tipo, horario, observacoes, dataInicio, dataFim, anoFim, diasSemana, diaMes, datasEspecificas, intervalo, unidadeIntervalo]);


    // Este useEffect agora só chama onChange quando o objeto 'finalRec' realmente muda.
    useEffect(() => {
        onChange(finalRec);
    }, [finalRec, onChange]);


    const handleDiaSemanaChange = (dia: number, checked: boolean) => {
        const novosDias = checked ? [...diasSemana, dia].sort((a, b) => a - b) : diasSemana.filter(d => d !== dia);
        setDiasSemana(novosDias);
    };

    const adicionarDataEspecifica = () => {
        if (novaData) {
            const data = new Date(`${novaData}T00:00:00Z`); // Usar Z para indicar UTC
            if (!isNaN(data.getTime())) {
                setDatasEspecificas([...datasEspecificas, data].sort((a, b) => a.getTime() - b.getTime()));
                setNovaData('');
            }
        }
    };

    const removerDataEspecifica = (index: number) => {
        setDatasEspecificas(datasEspecificas.filter((_, i) => i !== index));
    };

    const showDateRangeForRecurring = ![TipoRecorrencia.UNICA, TipoRecorrencia.ANUAL, TipoRecorrencia.DATAS_ESPECIFICAS].includes(tipo);

    const renderConfiguracoesEspecificas = () => {
        switch (tipo) {
            case TipoRecorrencia.SEMANAL:
                return (<div className="space-y-2"> <Label className="text-sm font-medium">Dias da semana:</Label> <div className="grid grid-cols-2 gap-2"> {diasSemanaOpcoes.map(dia => (<div key={dia.value} className="flex items-center space-x-2"> <Checkbox id={`dia-${dia.value}`} checked={diasSemana.includes(dia.value)} onCheckedChange={(checked) => handleDiaSemanaChange(dia.value, checked as boolean)} /> <Label htmlFor={`dia-${dia.value}`} className="text-sm font-normal cursor-pointer">{dia.label}</Label> </div>))} </div> </div>);
            case TipoRecorrencia.MENSAL:
                return (<div className="space-y-2"> <Label className="text-sm font-medium" htmlFor="dia-mes">Dia do mês:</Label> <Input id="dia-mes" type="number" min="1" max="31" value={diaMes} onChange={(e) => setDiaMes(parseInt(e.target.value) || 1)} className="w-24" /> </div>);
            case TipoRecorrencia.DATAS_ESPECIFICAS:
                return (<div className="space-y-2"> <Label className="text-sm font-medium">Datas específicas:</Label> <div className="flex gap-2"> <Input type="date" value={novaData} onChange={(e) => setNovaData(e.target.value)} className="flex-1" /> <Button onClick={adicionarDataEspecifica} size="icon"><Plus className="h-4 w-4" /></Button> </div> {datasEspecificas.length > 0 && (<div className="max-h-32 overflow-y-auto space-y-1 p-2 bg-slate-100 rounded"> {datasEspecificas.map((data, index) => (<div key={index} className="flex items-center justify-between bg-white p-2 rounded text-sm"> <span>{data.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span> <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removerDataEspecifica(index)}><X className="h-4 w-4" /></Button> </div>))} </div>)} </div>);
            case TipoRecorrencia.PERSONALIZADA:
                return (<div className="space-y-2"> <Label className="text-sm font-medium">Intervalo personalizado:</Label> <div className="flex gap-2"> <Input type="number" min="1" value={intervalo} onChange={(e) => setIntervalo(parseInt(e.target.value) || 1)} className="w-24" /> <Select value={unidadeIntervalo} onValueChange={(value) => setUnidadeIntervalo(value as UnidadeIntervalo)}> <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger> <SelectContent> <SelectItem value="dias">Dias</SelectItem> <SelectItem value="semanas">Semanas</SelectItem> <SelectItem value="meses">Meses</SelectItem> <SelectItem value="anos">Anos</SelectItem> </SelectContent> </Select> </div> </div>);
            default: return null;
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label className="text-sm font-medium">Tipo de recorrência:</Label>
                <Select value={tipo} onValueChange={(v) => setTipo(v as TipoRecorrencia)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {Object.entries(RECORRENCIA_OPCOES).map(([key, opcao]) => (
                            <SelectItem key={key} value={key as TipoRecorrencia}><div className="flex items-center gap-2"><span>{opcao.icon}</span><span>{opcao.label}</span></div></SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className='space-y-4 rounded-lg border bg-slate-50 p-3'>
                <h4 className="text-sm font-medium text-slate-600">Período de Execução</h4>
                {tipo === TipoRecorrencia.UNICA && (
                    <div className="space-y-2">
                        <Label htmlFor="data-unica" className="text-sm font-medium">Data da Execução:</Label>
                        <Input id="data-unica" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
                    </div>
                )}
                {showDateRangeForRecurring && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2"> <Label htmlFor="data-inicio" className="text-sm font-medium">Data de Início:</Label> <Input id="data-inicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} /> </div>
                        <div className="space-y-2"> <Label htmlFor="data-fim" className="text-sm font-medium">Data Final:</Label> <Input id="data-fim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} /> </div>
                    </div>
                )}
                {tipo === TipoRecorrencia.ANUAL && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2"> <Label htmlFor="data-inicio-anual" className="text-sm font-medium">Data de Início:</Label> <Input id="data-inicio-anual" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} /> </div>
                        <div className="space-y-2"> <Label htmlFor="ano-fim" className="text-sm font-medium">Ano Final:</Label> <Input id="ano-fim" type="number" value={anoFim} onChange={(e) => setAnoFim(parseInt(e.target.value))} /> </div>
                    </div>
                )}
                <div className="space-y-2">
                    <Label htmlFor="horario" className="text-sm font-medium">Horário da execução (opcional):</Label>
                    <Input id="horario" type="time" value={horario} onChange={(e) => setHorario(e.target.value)} />
                </div>
            </div>

            {renderConfiguracoesEspecificas()}

            <div className="space-y-2">
                <Label className="text-sm font-medium" htmlFor="obs-recorrencia">Observações (opcional):</Label>
                <Input id="obs-recorrencia" placeholder="Ex: Apenas em dias úteis" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-900"><Clock className="h-4 w-4" /><span>Preview da recorrência:</span></div>
                <div className="text-sm text-blue-700 mt-1 font-semibold">{formatarRecorrencia(finalRec)}</div>
            </div>
        </div>
    );
};
