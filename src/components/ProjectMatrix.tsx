"use client";

import { useState } from "react";
import { Project } from "@/data/projects";
import FlipCard from "./FlipCard";

interface ProjectMatrixProps {
  projects: Project[];
}

export default function ProjectMatrix({ projects }: ProjectMatrixProps) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const categories = {
    outcome: [
      { id: "high", label: "Alto Outcome", range: "(>80%)", check: (p: Project) => p.avance > 80, color: "text-emerald-600" },
      { id: "medium", label: "Medio Outcome", range: "(30-80%)", check: (p: Project) => p.avance >= 30 && p.avance <= 80, color: "text-amber-600" },
      { id: "low", label: "Bajo Outcome", range: "(<30%)", check: (p: Project) => p.avance < 30, color: "text-rose-600" },
    ],
    investment: [
      { id: "low", label: "Baja Inversión", range: "(≤5K)", check: (p: Project) => p.monto <= 5000 },
      { id: "medium", label: "Inversión Media", range: "(5-15K)", check: (p: Project) => p.monto > 5000 && p.monto <= 15000 },
      { id: "high", label: "Alta Inversión", range: "(>15K)", check: (p: Project) => p.monto > 15000 },
    ],
  };

  const getCellProjects = (outcomeIdx: number, investIdx: number) => {
    const outcomeField = categories.outcome[outcomeIdx];
    const investField = categories.investment[investIdx];
    return projects.filter(p => outcomeField.check(p) && investField.check(p));
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 overflow-x-auto">
      <div className="min-w-[1000px]">
        {/* Matrix Header (Investment) */}
        <div className="grid grid-cols-[200px_1fr_1fr_1fr] mb-4">
          <div /> {/* Top-left empty cell */}
          {categories.investment.map((inv) => (
            <div key={inv.id} className="text-center">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-secondary/60 mb-1">{inv.label}</h4>
              <p className="text-[10px] font-bold text-brand-secondary/30">{inv.range}</p>
            </div>
          ))}
        </div>

        {/* Matrix Rows */}
        <div className="space-y-4">
          {categories.outcome.map((out, rowIdx) => (
            <div key={out.id} className="grid grid-cols-[200px_1fr_1fr_1fr] gap-4 min-h-[180px]">
              {/* Row Label */}
              <div className="flex flex-col justify-center pr-8 border-r border-zinc-50">
                <div className="flex items-center gap-2 mb-1">
                   <div className={`w-2 h-2 rounded-sm rotate-45 ${out.color.replace('text', 'bg')}`} />
                   <h4 className={`text-[10px] font-black uppercase tracking-widest ${out.color}`}>{out.label}</h4>
                </div>
                <p className="text-[10px] font-bold text-brand-secondary/30 pl-4">{out.range}</p>
              </div>

              {/* Cells */}
              {[0, 1, 2].map((colIdx) => {
                const cellProjects = getCellProjects(rowIdx, colIdx);
                return (
                  <div 
                    key={colIdx} 
                    className="bg-zinc-50/50 rounded-xl border border-zinc-100/50 p-4 flex flex-wrap gap-3 content-start relative"
                  >
                    {cellProjects.length === 0 ? (
                      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em]">Vacío</span>
                      </div>
                    ) : (
                      cellProjects.map((project) => (
                        <div 
                          key={project.id} 
                          className={`relative ${activeCardId === project.id ? 'z-50' : 'hover:z-10'}`}
                          style={{ width: '48px', height: '48px' }}
                        >
                          <FlipCard 
                            project={project} 
                            zoom={1} 
                            isFlipped={activeCardId === project.id}
                            onToggle={() => setActiveCardId(activeCardId === project.id ? null : project.id)}
                          />
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
