"use client";

import { useState, useRef, useEffect } from "react";
import FlipCard from "@/components/FlipCard";
import { projects } from "@/data/projects";

export default function Home() {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Verde', 'Amarillo', 'Rojo', 'Gris', 'Azul']);

  // Calculate project counts per status
  const statusCounts = projects.reduce((acc, project) => {
    acc[project.estatus] = (acc[project.estatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  
  const containerRef = useRef<HTMLDivElement>(null);

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
  const realMaxMonto = Math.max(...projects.map(p => p.monto));
  const maxMonto = Math.ceil(realMaxMonto / 5000) * 5000 + 5000;
  const realMaxAvance = Math.max(...projects.map(p => p.avance));
  const realMinAvance = Math.min(...projects.map(p => p.avance));
  const minAvance = Math.floor(realMinAvance / 10) * 10 - 10;
  const maxAvance = Math.ceil(realMaxAvance / 10) * 10 + 10;

  const filteredProjects = projects.filter(p => selectedStatuses.includes(p.estatus));

  // Auto-centering effect when filters change
  useEffect(() => {
    if (filteredProjects.length === 0 || dimensions.width === 0) {
      if (filteredProjects.length === 0) {
        setZoom(1);
        setOffset({ x: 0, y: 0 });
      }
      return;
    }

    // Calculate bounds in percent space
    // Using same logic as the render mapping to find exact center
    const bounds = filteredProjects.reduce((acc, p, index) => {
      const rawLeft = (p.monto / maxMonto) * 100;
      const rawBottom = ((p.avance - minAvance) / (maxAvance - minAvance)) * 100;
      
      const jitterX = ((index % 5) - 2) * 1.5;
      const jitterY = (((index * 7) % 5) - 2) * 1.5;

      const left = Math.min(Math.max(rawLeft + jitterX, 0), 100);
      const bottom = Math.min(Math.max(rawBottom + jitterY, 0), 100);

      return {
        minX: Math.min(acc.minX, left),
        maxX: Math.max(acc.maxX, left),
        minY: Math.min(acc.minY, bottom),
        maxY: Math.max(acc.maxY, bottom)
      };
    }, { minX: 100, maxX: 0, minY: 100, maxY: 0 });

    const centerPercentX = (bounds.minX + bounds.maxX) / 2;
    const centerPercentY = (bounds.minY + bounds.maxY) / 2;

    // Conversion to pixel space relative to container
    const targetX = padding + (centerPercentX / 100) * (dimensions.width - 2 * padding);
    const targetY = dimensions.height - (padding + (centerPercentY / 100) * (dimensions.height - 2 * padding));

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    // Zoom calculation to fit bounds comfortably
    const rangeX = Math.max(bounds.maxX - bounds.minX, 15); // Min range to avoid infinite zoom
    const rangeY = Math.max(bounds.maxY - bounds.minY, 15);
    
    const zoomX = (100 * 0.5) / rangeX; // Occupy 50% of viewport
    const zoomY = (100 * 0.5) / rangeY;
    
    // Cap zoom for auto-centering
    const nextZoom = Math.min(Math.max(Math.min(zoomX, zoomY), 0.8), 3);
    
    setZoom(nextZoom);
    setOffset({
      x: (centerX - targetX) * nextZoom,
      y: (centerY - targetY) * nextZoom
    });
  }, [selectedStatuses, dimensions]);

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };


  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    const handleClickOutside = () => setActiveCardId(null);
    
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("click", handleClickOutside);
    
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const padding = 80; // Correspondiente a p-20 (20 * 4px)

  // Helper to map screen position to data value
  const getDataValue = (screenPos: number, isX: boolean) => {
    const size = isX ? dimensions.width : dimensions.height;
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
    // percent is distance from top of the main container (0 to 1)
    return getDataValue(percent * dimensions.height, false);
  };

  const getXValue = (percent: number) => {
    // percent is distance from left of the main container (0 to 1)
    return getDataValue(percent * dimensions.width, true);
  };

  return (
    <div className="min-h-screen p-8 bg-background select-none">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black text-brand-primary tracking-tighter">
            Getagile
          </h1>
          <p className="text-brand-secondary mt-1 uppercase tracking-[0.3em] text-[10px] font-bold">
            Ecosistema de Innovación & Impacto
          </p>
        </div>
        
        <div className="flex gap-8 items-center">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-zinc-100">
            <button 
              onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 font-bold transition-colors"
            >
              −
            </button>
            <span className="text-[10px] font-black w-12 text-center text-brand-primary">
              {Math.round(zoom * 100)}%
            </span>
            <button 
              onClick={() => setZoom(prev => Math.min(10, prev + 0.2))}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 font-bold transition-colors"
            >
              +
            </button>
            <button 
              onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}
              className="px-3 py-1 text-[8px] font-black uppercase tracking-widest hover:bg-zinc-100 rounded-lg transition-colors border-l border-zinc-100 ml-1"
            >
              Reset
            </button>
          </div>

          <div className="flex gap-4 items-center">
            {/* Legend / Status Filter */}
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-zinc-100 gap-1">
              {[
                { id: 'Verde', label: 'Saludable', color: 'bg-emerald-500' },
                { id: 'Amarillo', label: 'Riesgo', color: 'bg-amber-400' },
                { id: 'Rojo', label: 'Crítico', color: 'bg-rose-500' },
                { id: 'Gris', label: 'Planeación', color: 'bg-slate-400' },
                { id: 'Azul', label: 'Soporte', color: 'bg-blue-500' },
              ].map((status) => (
                <button
                  key={status.id}
                  onClick={() => toggleStatus(status.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                    selectedStatuses.includes(status.id)
                      ? 'bg-zinc-50 opacity-100'
                      : 'opacity-30 grayscale'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${status.color}`}></span>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">
                      {status.label}
                    </span>
                    <span className="text-[8px] font-black text-brand-secondary/50 mt-0.5">
                      {statusCounts[status.id] || 0} Proyectos
                    </span>
                  </div>
                </button>
              ))}
              <div className="w-[1px] bg-zinc-100 mx-1"></div>
              <button
                onClick={() => {
                  if (selectedStatuses.length === 5) setSelectedStatuses([]);
                  else setSelectedStatuses(['Verde', 'Amarillo', 'Rojo', 'Gris', 'Azul']);
                }}
                className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest hover:bg-zinc-50 rounded-lg transition-colors text-brand-secondary"
              >
                {selectedStatuses.length === 5 ? 'Ninguno' : 'Todos'}
              </button>
            </div>
          </div>

        </div>
      </header>

      <div className="flex justify-center mb-10">
        <p className="text-[10px] font-bold text-brand-primary/40 uppercase tracking-[0.2em] bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-brand-primary/5">
          {filteredProjects.length} {filteredProjects.length === 1 ? 'Proyecto visualizado' : 'Proyectos visualizados'} • Arrastra para navegar • Usa zoom para separar
        </p>
      </div>

      <main 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`relative max-w-8xl mx-auto h-[800px] border-l-2 border-b-2 border-brand-primary/10 mt-0 mb-20 bg-zinc-50/50 backdrop-blur-sm rounded-tr-3xl shadow-sm overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {/* Overflow hidden is key here to keep zoomed content inside the box */}
        
        {/* Content wrapper that responds to zoom and offset */}
          {/* Container for everything that scales and pans */}
          <div 
            className="absolute inset-0 transition-transform ease-out"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transformOrigin: '50% 50%',
              transitionDuration: isDragging ? '50ms' : '700ms'
            }}
          >
            {/* Dynamic Hierarchical Grid - Expanded to prevent cut-off during pan */}
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
                  ${(dimensions.width - 160) / 32}px ${(dimensions.height - 160) / 32}px,
                  ${(dimensions.width - 160) / 32}px ${(dimensions.height - 160) / 32}px,
                  ${(dimensions.width - 160) / 16}px ${(dimensions.height - 160) / 16}px,
                  ${(dimensions.width - 160) / 16}px ${(dimensions.height - 160) / 16}px,
                  ${(dimensions.width - 160) / 8}px ${(dimensions.height - 160) / 8}px,
                  ${(dimensions.width - 160) / 8}px ${(dimensions.height - 160) / 8}px,
                  ${(dimensions.width - 160) / 4}px ${(dimensions.height - 160) / 4}px,
                  ${(dimensions.width - 160) / 4}px ${(dimensions.height - 160) / 4}px
                `,
                backgroundPosition: 'calc(1000% + 80px) calc(1000% + 80px)',
                transition: 'opacity 0.3s ease-out'
              }}
            ></div>
  
            {/* Chart Content Area (where projects live) */}
            <div className="absolute inset-x-20 inset-y-20">
              {filteredProjects.map((project, index) => {

              const rawLeft = (project.monto / maxMonto) * 100;
              const rawBottom = ((project.avance - minAvance) / (maxAvance - minAvance)) * 100;

              // Stable Jitter
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
                    // Aggressive inverse scale: cards shrink more at high zoom to create space
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

        {/* AXES (Outside wrapper so they stay fixed) */}
        {/* Y-Axis Label */}
        <div className="absolute left-4 top-1/2 -rotate-90 origin-center text-xs font-black tracking-widest text-brand-primary opacity-40 uppercase whitespace-nowrap pointer-events-none z-10">
          Impacto Alcanzado (%)
        </div>

        {/* X-Axis Label */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-black tracking-widest text-brand-primary/30 uppercase pointer-events-none z-10">
          Monto de Inversión ($)
        </div>

        {/* Axis Markers - Aligned with the data container (inset-20) */}
        <div className="absolute left-[70px] top-20 bottom-20 flex flex-col justify-between text-[8px] font-bold text-brand-primary/40 py-1 pointer-events-none z-10 items-end">
          <span>{Math.round(getYValue(padding / dimensions.height))}%</span>
          <span>{Math.round(getYValue((padding + (dimensions.height - 2 * padding) * 0.25) / dimensions.height))}%</span>
          <span>{Math.round(getYValue(0.5))}%</span>
          <span>{Math.round(getYValue((padding + (dimensions.height - 2 * padding) * 0.75) / dimensions.height))}%</span>
          <span>{Math.round(getYValue((dimensions.height - padding) / dimensions.height))}%</span>
        </div>
        <div className="absolute bottom-[70px] left-20 right-20 flex justify-between text-[8px] font-bold text-brand-primary/40 px-1 pointer-events-none z-10">
          <span>${Math.round(getXValue(padding / dimensions.width)).toLocaleString()}</span>
          <span>${Math.round(getXValue((padding + (dimensions.width - 2 * padding) * 0.25) / dimensions.width)).toLocaleString()}</span>
          <span>${Math.round(getXValue(0.5)).toLocaleString()}</span>
          <span>${Math.round(getXValue((padding + (dimensions.width - 2 * padding) * 0.75) / dimensions.width)).toLocaleString()}</span>
          <span>${Math.round(getXValue((dimensions.width - padding) / dimensions.width)).toLocaleString()}</span>
        </div>
      </main>
      
    </div>
  );
}

