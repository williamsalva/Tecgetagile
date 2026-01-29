"use client";

import { Project } from "@/data/projects";

interface ProjectTableProps {
  projects: Project[];
}

const statusColors = {
  Verde: "bg-emerald-500",
  Amarillo: "bg-amber-400",
  Rojo: "bg-rose-500",
  Gris: "bg-slate-400",
  Azul: "bg-blue-500",
};

export default function ProjectTable({ projects }: ProjectTableProps) {
  return (
    <div className="w-full overflow-hidden bg-white rounded-xl shadow-sm border border-zinc-100">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-secondary/60">ID</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-secondary/60 text-center">Sim</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-secondary/60">Proyecto</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-secondary/60">Estatus</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-secondary/60 text-right">Inversión</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-secondary/60 text-center">Avance</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-secondary/60">Product Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-zinc-400 text-xs font-medium italic">
                  No se encontraron proyectos con los filtros seleccionados
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-black text-brand-primary tracking-tight">{project.id}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 text-[10px] font-black text-brand-primary mx-auto">
                      {project.simbolo}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-brand-primary leading-tight">{project.nombreCorto}</span>
                      <span className="text-[9px] text-brand-secondary/60 uppercase tracking-tighter mt-0.5">{project.tipo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusColors[project.estatus]}`} />
                      <span className="text-[10px] font-bold uppercase tracking-wide text-brand-primary">{project.estatus}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-mono font-bold text-brand-primary">
                      ${project.monto.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`text-[10px] font-black ${project.avance < 0 ? 'text-rose-500' : 'text-brand-primary'}`}>
                        {project.avance}%
                      </span>
                      <div className="w-16 h-1 bg-zinc-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${statusColors[project.estatus]}`} 
                          style={{ width: `${Math.min(100, Math.max(0, project.avance))}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-[10px] font-medium text-brand-secondary">{project.po}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
