"use client";

import { useState, useRef, useEffect } from "react";
import FlipCard from "./FlipCard";
import { Project, projects as allProjects } from "@/data/projects";

interface ProjectChartProps {
  filteredProjects: Project[];
  zoom: number;
  offset: { x: number; y: number };
  activeCardId: string | null;
  setActiveCardId: (id: string | null) => void;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
}

const padding = 80;

export default function ProjectChart({
  filteredProjects,
  zoom,
  offset,
  activeCardId,
  setActiveCardId,
  isDragging,
  onMouseDown,
  onMouseMove,
  onMouseUp
}: ProjectChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, []);

  // Find max values for normalization (using all projects to keep scale consistent)
  const realMaxMonto = Math.max(...allProjects.map(p => p.monto));
  const maxMonto = Math.ceil(realMaxMonto / 5000) * 5000 + 5000;
  const realMaxAvance = Math.max(...allProjects.map(p => p.avance));
  const realMinAvance = Math.min(...allProjects.map(p => p.avance));
  const minAvance = Math.floor(realMinAvance / 10) * 10 - 10;
  const maxAvance = Math.ceil(realMaxAvance / 10) * 10 + 10;

  // Helper to map screen position to data value
  const getDataValue = (screenPos: number, isX: boolean) => {
    const size = isX ? dimensions.width : dimensions.height;
    if (size === 0) return 0;

    const offsetVal = isX ? offset.x : offset.y;
    const center = size / 2;
    
    // Reverse the transform: s = (p - center) * zoom + center + offset
    const p = (screenPos - offsetVal - center) / zoom + center;
    
    const dataAreaSize = size - 2 * padding;
    
    if (isX) {
      const normalizedX = (p - padding) / dataAreaSize;
      return normalizedX * maxMonto;
    } else {
      // Y-axis is from bottom: p is dist from top
      const distFromBottom = dimensions.height - p;
      const normalizedY = (distFromBottom - padding) / dataAreaSize;
      return minAvance + normalizedY * (maxAvance - minAvance);
    }
  };

  const getYValue = (percent: number) => {
    return getDataValue(percent * dimensions.height, false);
  };

  const getXValue = (percent: number) => {
    return getDataValue(percent * dimensions.width, true);
  };

  return (
    <div 
      ref={containerRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      className={`relative w-full h-[800px] border-l-2 border-b-2 border-brand-primary/10 bg-zinc-50/50 backdrop-blur-sm rounded-tr-3xl shadow-sm overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      {/* Container for everything that scales and pans */}
      <div 
        className="absolute inset-0 transition-transform ease-out"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: '50% 50%',
          transitionDuration: isDragging ? '50ms' : '700ms'
        }}
      >
        {/* Dynamic Hierarchical Grid */}
        <div 
          className="absolute pointer-events-none"
          style={{
            top: '-1000%',
            left: '-1000%',
            width: '3000%',
            height: '3000%',
            backgroundImage: `
              linear-gradient(to right, rgba(15, 23, 42, ${zoom > 6 ? 0.03 : 0}) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(15, 23, 42, ${zoom > 6 ? 0.03 : 0}) 1px, transparent 1px),
              linear-gradient(to right, rgba(15, 23, 42, ${zoom > 3 ? 0.05 : 0}) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(15, 23, 42, ${zoom > 3 ? 0.05 : 0}) 1px, transparent 1px),
              linear-gradient(to right, rgba(15, 23, 42, ${zoom > 1.5 ? 0.05 : 0}) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(15, 23, 42, ${zoom > 1.5 ? 0.05 : 0}) 1px, transparent 1px),
              linear-gradient(to right, rgba(15, 23, 42, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(15, 23, 42, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: `
              ${(dimensions.width - 2 * padding) / 32}px ${(dimensions.height - 2 * padding) / 32}px,
              ${(dimensions.width - 2 * padding) / 32}px ${(dimensions.height - 2 * padding) / 32}px,
              ${(dimensions.width - 2 * padding) / 16}px ${(dimensions.height - 2 * padding) / 16}px,
              ${(dimensions.width - 2 * padding) / 16}px ${(dimensions.height - 2 * padding) / 16}px,
              ${(dimensions.width - 2 * padding) / 8}px ${(dimensions.height - 2 * padding) / 8}px,
              ${(dimensions.width - 2 * padding) / 8}px ${(dimensions.height - 2 * padding) / 8}px,
              ${(dimensions.width - 2 * padding) / 4}px ${(dimensions.height - 2 * padding) / 4}px,
              ${(dimensions.width - 2 * padding) / 4}px ${(dimensions.height - 2 * padding) / 4}px
            `,
            backgroundPosition: `calc(1000% + ${padding}px) calc(1000% + ${padding}px)`,
            transition: 'opacity 0.3s ease-out'
          }}
        ></div>

        {/* Chart Content Area */}
        <div className="absolute inset-x-20 inset-y-20">
          {filteredProjects.map((project, index) => {
            const rawLeft = (project.monto / maxMonto) * 100;
            const rawBottom = ((project.avance - minAvance) / (maxAvance - minAvance)) * 100;

            const jitterX = ((index % 5) - 2) * 1.5;
            const jitterY = (((index * 7) % 5) - 2) * 1.5;

            const left = Math.min(Math.max(rawLeft + jitterX, 0), 100);
            const bottom = Math.min(Math.max(rawBottom + jitterY, 0), 100);

            return (
              <div
                key={project.id}
                className={`absolute transition-all duration-1000 ease-out ${activeCardId === project.id ? 'z-[100]' : 'hover:z-50'}`}
                style={{
                  left: `${left}%`,
                  bottom: `${bottom}%`,
                  transform: `translate(-50%, 50%) scale(${Math.max(0.2, 1 / zoom)})`,
                }}
              >
                <FlipCard 
                  project={project} 
                  zoom={zoom} 
                  isFlipped={activeCardId === project.id}
                  onToggle={() => setActiveCardId(activeCardId === project.id ? null : project.id)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* AXES (Fixed) */}
      <div className="absolute left-4 top-1/2 -rotate-90 origin-center text-xs font-black tracking-widest text-brand-primary opacity-40 uppercase whitespace-nowrap pointer-events-none z-10">
        Impacto Alcanzado (%)
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-black tracking-widest text-brand-primary/30 uppercase pointer-events-none z-10">
        Monto de Inversión ($)
      </div>

      {/* Axis Markers */}
      <div className="absolute left-[70px] top-20 bottom-20 flex flex-col justify-between text-[8px] font-bold text-brand-primary/40 py-1 pointer-events-none z-10 items-end">
        <span>{Math.round(getYValue(padding / dimensions.height))}%</span>
        <span>{Math.round(getYValue((padding + (dimensions.height - 2 * padding) * 0.25) / dimensions.height))}%</span>
        <span>{Math.round(getYValue(0.5))}%</span>
        <span>{Math.round(getYValue((padding + (dimensions.height - 2 * padding) * 0.75) / dimensions.height))}%</span>
        <span>{Math.round(getYValue((dimensions.height - padding) / dimensions.height))}%</span>
      </div>
      <div className="absolute bottom-[70px] left-20 right-20 flex justify-between text-[8px] font-bold text-brand-primary/40 px-1 pointer-events-none z-10">
        <span>Baja Inversión</span>
        <span>Inversión Media</span>
        <span>Alta Inversión</span>
      </div>
    </div>
  );
}
