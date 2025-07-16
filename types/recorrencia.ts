// types/recorrencia.ts
import { v4 as uuidv4 } from 'uuid';

export enum TipoRecorrencia {
    UNICA = 'unica',
    DIARIA = 'diaria',
    SEMANAL = 'semanal',
    MENSAL = 'mensal',
    ANUAL = 'anual',
    // HORARIA foi removida
    DATAS_ESPECIFICAS = 'datas_especificas',
    PERSONALIZADA = 'personalizada'
}

export interface Recorrencia {
    id: string;
    tipo: TipoRecorrencia;
    descricao: string;
    horario?: string;
    observacoes?: string;
    dataInicio?: Date;
    dataFim?: Date;
    anoFim?: number;
    diasSemana?: number[];
    diaMes?: number;
    datasEspecificas?: Date[];
    intervalo?: number;
    unidadeIntervalo?: 'dias' | 'semanas' | 'meses' | 'anos';
}

export const RECORRENCIA_OPCOES: { [key in Exclude<TipoRecorrencia, 'horaria'>]: { label: string, descricao: string, icon: string } } = {
    [TipoRecorrencia.UNICA]: { label: 'Execução Única', descricao: 'Executado apenas uma vez', icon: '🔄' },
    [TipoRecorrencia.DIARIA]: { label: 'Diária', descricao: 'Executado todos os dias', icon: '📅' },
    [TipoRecorrencia.SEMANAL]: { label: 'Semanal', descricao: 'Executado semanalmente', icon: '📆' },
    [TipoRecorrencia.MENSAL]: { label: 'Mensal', descricao: 'Executado mensalmente', icon: '🗓️' },
    [TipoRecorrencia.ANUAL]: { label: 'Anual', descricao: 'Executado anualmente', icon: '📋' },
    [TipoRecorrencia.DATAS_ESPECIFICAS]: { label: 'Datas Específicas', descricao: 'Executado em datas específicas', icon: '📌' },
    [TipoRecorrencia.PERSONALIZADA]: { label: 'Personalizada', descricao: 'Intervalo personalizado', icon: '⚙️' }
};

export function formatarRecorrencia(recorrencia: Recorrencia): string {
    let base: string;
    const horarioInfo = recorrencia.horario ? ` às ${recorrencia.horario}` : '';
    const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' };

    switch (recorrencia.tipo) {
        case TipoRecorrencia.UNICA:
            const dataUnica = recorrencia.dataInicio ? ` em ${new Date(recorrencia.dataInicio).toLocaleDateString('pt-BR', dateOptions)}` : '';
            base = `Única${dataUnica}${horarioInfo}`;
            break;
        case TipoRecorrencia.DIARIA:
            base = `Diária${horarioInfo}`;
            break;
        case TipoRecorrencia.SEMANAL:
            if (recorrencia.diasSemana && recorrencia.diasSemana.length > 0) {
                const diasNomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                const dias = recorrencia.diasSemana.map(d => diasNomes[d]).join(', ');
                base = `Semanal (${dias})${horarioInfo}`;
            } else {
                base = `Semanal${horarioInfo}`;
            }
            break;
        case TipoRecorrencia.MENSAL:
            base = recorrencia.diaMes ? `Mensal (dia ${recorrencia.diaMes})${horarioInfo}` : `Mensal${horarioInfo}`;
            break;
        case TipoRecorrencia.ANUAL:
            base = `Anual${horarioInfo}`;
            break;
        case TipoRecorrencia.DATAS_ESPECIFICAS:
            const count = recorrencia.datasEspecificas?.length || 0;
            base = count > 0 ? `Datas específicas (${count})${horarioInfo}` : `Datas específicas${horarioInfo}`;
            break;
        case TipoRecorrencia.PERSONALIZADA:
            base = recorrencia.intervalo && recorrencia.unidadeIntervalo ? `A cada ${recorrencia.intervalo} ${recorrencia.unidadeIntervalo}${horarioInfo}` : `Personalizada${horarioInfo}`;
            break;
        default:
            const key = recorrencia.tipo as keyof typeof RECORRENCIA_OPCOES;
            base = RECORRENCIA_OPCOES[key]?.label || 'Recorrência';
            break;
    }

    let dateRangeString = '';
    if (recorrencia.tipo === TipoRecorrencia.ANUAL) {
        const anoInicio = recorrencia.dataInicio ? new Date(recorrencia.dataInicio).getUTCFullYear() : null;
        if (anoInicio && recorrencia.anoFim && recorrencia.anoFim > anoInicio) {
            dateRangeString = ` (de ${anoInicio} a ${recorrencia.anoFim})`;
        } else if (anoInicio) {
            dateRangeString = ` (a partir de ${anoInicio})`;
        }
    } else if (recorrencia.tipo !== TipoRecorrencia.UNICA && recorrencia.tipo !== TipoRecorrencia.DATAS_ESPECIFICAS) {
        if (recorrencia.dataInicio && recorrencia.dataFim) {
            const de = new Date(recorrencia.dataInicio).toLocaleDateString('pt-BR', dateOptions);
            const ate = new Date(recorrencia.dataFim).toLocaleDateString('pt-BR', dateOptions);
            dateRangeString = ` (de ${de} a ${ate})`;
        } else if (recorrencia.dataInicio) {
            const de = new Date(recorrencia.dataInicio).toLocaleDateString('pt-BR', dateOptions);
            dateRangeString = ` (a partir de ${de})`;
        }
    }

    return base + dateRangeString;
}