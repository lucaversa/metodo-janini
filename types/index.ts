// types/index.ts
export type Recurso = {
    id: string;
    nome: string;
    custo: number;
};

export type CategoriasRecursos = 'pessoas' | 'documentos' | 'equipamentos' | 'sistemas' | 'consumiveis' | 'locais';

export type Recursos = {
    pessoas: Recurso[];
    documentos: Recurso[];
    equipamentos: Recurso[];
    sistemas: Recurso[];
    consumiveis: Recurso[];
    locais: Recurso[];
};

// NOVO: Define um modelo de recursos reutilizável
export type GrupoDeRecursos = {
    id: string;
    nome: string;
    recursos: Recursos;
}

export type Pop = {
    id: string;
    nome: string;
    // MODIFICADO: O POP agora pode ter um ID de um grupo ou os seus próprios recursos
    grupoRecursosId?: string | null;
    recursos: Recursos;
};

export type Departamento = {
    id: string;
    nome: string;
    pops: Pop[];
    // NOVO: Cada departamento agora gere os seus próprios grupos de recursos
    gruposDeRecursos: GrupoDeRecursos[];
};

export type Projeto = {
    id: string;
    nome: string;
    departamentos: Departamento[];
};