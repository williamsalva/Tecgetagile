"use client";

import { useState } from "react";
import { Project } from "@/data/projects";

interface FlipCardProps {
  project: Project;
  zoom: number;
  isFlipped: boolean;
  onToggle: () => void;
}

const statusConfig: Record<string, { label: string; color: string; border: string }> = {
  Verde: { label: "Saludable", color: "bg-emerald-500", border: "border-emerald-500" },
  Amarillo: { label: "Riesgo", color: "bg-amber-400", border: "border-amber-400" },
  Rojo: { label: "Crítico", color: "bg-rose-500", border: "border-rose-500" },
  Gris: { label: "Hold", color: "bg-slate-400", border: "border-slate-400" },
  Azul: { label: "Soporte", color: "bg-blue-500", border: "border-blue-500" },
};

export default function FlipCard({ project, zoom, isFlipped, onToggle }: FlipCardProps) {

  const typeIcon = project.tipo === "Producto" ? "Π" : "ϰ";
  const config = statusConfig[project.estatus] || statusConfig.Gris;
  const statusColor = config.color;

  // Calculate hover scale to keep final screen size roughly constant (around 240px)
  // zoom * cardBaseScale (Math.max(0.2, 1/zoom)) * hoverMultiplier = 5 (target scale)
  const cardBaseScale = Math.max(0.2, 1 / zoom);
  const hoverMultiplier = 5 / (zoom * cardBaseScale);

  return (
    <div
      className={`group relative h-12 w-12 [perspective:1000px] cursor-pointer transition-transform duration-300 ease-out ${isFlipped ? 'z-[100]' : 'hover:z-[100]'}`}
      style={{ 
        transform: `scale(${isFlipped ? hoverMultiplier : 1})`,
      }}
      onMouseLeave={() => {
        if (isFlipped) onToggle();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      <div
        className={`relative h-full w-full rounded-md shadow-sm transition-all duration-700 [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* Front Side */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-md bg-white border border-zinc-100 [backface-visibility:hidden] p-1 shadow-sm group-hover:shadow-2xl transition-shadow overflow-hidden`}>
          <div className={`absolute bottom-0 left-0 right-0 h-1 ${statusColor}`} />
          <span className="text-sm font-black text-brand-primary tracking-tighter">
            {project.simbolo}
          </span>
          <div className="flex flex-col items-center">
             <span className="text-[10px] font-serif text-brand-secondary opacity-80 leading-none">
              {typeIcon}
            </span>
            <span className="text-[4px] font-bold uppercase tracking-widest text-brand-secondary mt-0.5">
              {project.tipo === "Producto" ? "Pro." : "Com."}
            </span>
          </div>
        </div>

        {/* Back Side (The "fon" part) */}
        <div className="absolute inset-0 flex h-full w-full flex-col rounded-md bg-brand-primary text-white [backface-visibility:hidden] [transform:rotateY(180deg)] p-1 pb-1.5 shadow-lg overflow-hidden ring-1 ring-white/10">
          <div className="mb-0.5 border-b border-white/20 pb-0.5">
            <h3 className="text-[2.5px] font-black uppercase tracking-widest text-brand-accent">
              {project.id}
            </h3>
            <p className="text-[4px] font-bold truncate leading-tight">{project.nombreCorto}</p>
          </div>
          
          <div className="flex-1 space-y-0.5 py-0.5">
            <div className="flex justify-between items-center text-[3.5px]">
              <span className="opacity-70 font-semibold uppercase text-[2.5px]">Status</span>
              <span className={`px-1 py-0.1 rounded-full font-bold text-[2.5px] uppercase ${statusColor} text-white`}>
                {config.label}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-[3.5px]">
              <span className="opacity-70 font-semibold uppercase text-[2.5px]">Inversión</span>
              <span className="font-bold text-brand-accent text-[3.5px]">
                {project.monto <= 5000 ? "Baja" : project.monto <= 15000 ? "Media" : "Alta"}
              </span>
            </div>

            <div className="flex justify-between items-center text-[3.5px]">
              <span className="opacity-70 font-semibold uppercase text-[2.5px]">Outcome</span>
              <span className="font-bold text-[3.5px]">{project.avance}%</span>
            </div>
          </div>

          <div className="mt-auto pt-0.5 border-t border-white/10">
            <div className="flex flex-wrap gap-0.5">
              <span className="text-[2.5px] bg-white/15 px-1 py-0.4 rounded-sm leading-none whitespace-nowrap block w-full truncate text-center font-bold">
                {project.po}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
