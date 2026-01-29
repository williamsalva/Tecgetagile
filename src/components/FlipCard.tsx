"use client";

import { useState } from "react";
import { Project } from "@/data/projects";

interface FlipCardProps {
  project: Project;
}

const statusColors = {
  Verde: "bg-emerald-500",
  Amarillo: "bg-amber-400",
  Rojo: "bg-rose-500",
  Gris: "bg-slate-400",
};

const statusBorderColors = {
  Verde: "border-emerald-500",
  Amarillo: "border-amber-400",
  Rojo: "border-rose-500",
  Gris: "border-slate-400",
};

export default function FlipCard({ project }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const typeIcon = project.tipo === "Producto" ? "Π" : "ϰ";
  const statusColor = statusColors[project.estatus];
  const statusBorderColor = statusBorderColors[project.estatus];

  return (
    <div
      className="group relative h-48 w-48 [perspective:1000px] cursor-pointer"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className={`relative h-full w-full rounded-xl shadow-lg transition-all duration-500 [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* Front Side */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-white border-b-4 ${statusBorderColor} [backface-visibility:hidden] p-4`}>
          <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${statusColor}`} />
          <span className="text-5xl font-black text-brand-primary tracking-tighter mb-1">
            {project.simbolo}
          </span>
          <div className="flex flex-col items-center">
             <span className="text-2xl font-serif text-brand-secondary opacity-80 leading-none">
              {typeIcon}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary mt-1">
              {project.tipo === "Producto" ? "Producto" : "Componente"}
            </span>
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 flex h-full w-full flex-col rounded-xl bg-brand-primary text-white [backface-visibility:hidden] [transform:rotateY(180deg)] p-4 shadow-inner">
          <div className="mb-2 border-b border-white/20 pb-1">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-accent">
              DETALLES
            </h3>
            <p className="text-xs font-bold truncate">{project.nombreCorto}</p>
          </div>
          
          <div className="flex-1 space-y-2 py-1">
            <div className="flex justify-between items-center text-[10px]">
              <span className="opacity-70 font-semibold">ESTATUS</span>
              <span className={`px-2 py-0.5 rounded-full font-bold text-[8px] uppercase ${statusColor} text-white`}>
                {project.estatus}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-[10px]">
              <span className="opacity-70 font-semibold">MONTO</span>
              <span className="font-bold text-brand-accent">
                ${project.monto.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center text-[10px]">
              <span className="opacity-70 font-semibold">AVANCE</span>
              <span className="font-bold">{project.avance}%</span>
            </div>
          </div>

          <div className="mt-auto pt-2 border-t border-white/10">
            <p className="text-[8px] opacity-60 uppercase font-bold mb-1">Equipos</p>
            <div className="flex flex-wrap gap-1">
              {project.equipos.slice(0, 2).map((eq, i) => (
                <span key={i} className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded leading-tight">
                  {eq}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
