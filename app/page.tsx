// app/page.tsx
'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Projeto } from '@/types';
import { ProjectList } from '@/components/ProjectList';
import { ProjectEditor } from '@/components/ProjectEditor';
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";

export default function HomePage() {
  const [projetos, setProjetos] = useLocalStorage<Projeto[]>('meus-projetos', []);
  const [projetoAtivoId, setProjetoAtivoId] = useState<string | null>(null);

  const handleCreateProject = (nome: string) => {
    const novoProjeto: Projeto = {
      id: uuidv4(),
      nome,
      departamentos: [],
    };
    setProjetos([...projetos, novoProjeto]);
    toast.success(`Projeto "${nome}" criado com sucesso!`);
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Tem certeza que deseja apagar este projeto e todos os seus dados?')) {
      const projeto = projetos.find(p => p.id === id);
      setProjetos(projetos.filter(p => p.id !== id));
      toast.error(`Projeto "${projeto?.nome}" foi apagado.`);
    }
  };

  const handleUpdateProject = (projetoAtualizado: Projeto) => {
    setProjetos(projetos.map(p => p.id === projetoAtualizado.id ? projetoAtualizado : p));
  };

  const projetoAtivo = projetos.find(p => p.id === projetoAtivoId) || null;

  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      {projetoAtivo ? (
        <ProjectEditor
          key={projetoAtivo.id}
          projeto={projetoAtivo}
          onUpdate={handleUpdateProject}
          onClose={() => setProjetoAtivoId(null)}
        />
      ) : (
        <ProjectList
          projetos={projetos}
          onSelectProject={setProjetoAtivoId}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
        />
      )}
    </main>
  );
}