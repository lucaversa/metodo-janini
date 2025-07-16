// types/index.ts
import { Recorrencia } from './recorrencia';

export type Recurso = {
    id: string;
    nome: string;
    custo: number;
    observacoes?: string; // Campo para observações
};

// Categoria 'recorrencia' adicionada
export type CategoriasRecursos = 'pessoas' | 'documentos' | 'equipamentos' | 'sistemas' | 'consumiveis' | 'locais' | 'recorrencia';

export type Recursos = {
    [key in CategoriasRecursos]?: Recurso[];
};

export type GrupoDeRecursos = {
    id: string;
    nome: string;
    recursos: Recursos;
}

export type Pop = {
    id: string;
    nome: string;
    grupoRecursosId?: string | null;
    recursos: Recursos;
};

export type Departamento = {
    id: string;
    nome: string;
    pops: Pop[];
    gruposDeRecursos: GrupoDeRecursos[];
    observacao?: string;
};

export type Projeto = {
    id: string;
    nome: string;
    departamentos: Departamento[];
};