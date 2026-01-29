"use client";

import { useState, useRef, useEffect } from "react";
import ProjectTable from "@/components/ProjectTable";
import ProjectMatrix from "@/components/ProjectMatrix";
import ProjectChart from "@/components/ProjectChart";
import { projects } from "@/data/projects";

export default function Home() {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Verde', 'Amarillo', 'Rojo', 'Gris', 'Azul']);
  const [viewMode, setViewMode] = useState<'chart' | 'table' | 'matrix'>('matrix');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredProjects = projects.filter(p => {
    const matchesStatus = selectedStatuses.includes(p.estatus);
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      p.id.toLowerCase().includes(query) || 
      p.nombre.toLowerCase().includes(query) || 
      p.nombreCorto.toLowerCase().includes(query) || 
      p.po.toLowerCase().includes(query);
    
    return matchesStatus && matchesSearch;
  });

  const padding = 80;

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
    const rangeX = Math.max(bounds.maxX - bounds.minX, 15);
    const rangeY = Math.max(bounds.maxY - bounds.minY, 15);
    
    const zoomX = (100 * 0.5) / rangeX;
    const zoomY = (100 * 0.5) / rangeY;
    
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
    if (e.button !== 0) return;
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

  return (
    <div className="min-h-screen p-8 bg-background select-none" ref={containerRef}>
      <header className="mb-12 space-y-8">
        {/* Row 1: Logo & View Controls */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black text-brand-primary tracking-tighter">
              Getagile
            </h1>
            <p className="text-brand-secondary mt-1 uppercase tracking-[0.3em] text-[10px] font-bold">
              Ecosistema de Innovación & Impacto
            </p>
          </div>
          
          <div className="flex gap-4 items-center">
            {/* View Toggle */}
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-zinc-100 gap-1">
              <button 
                onClick={() => setViewMode('chart')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  viewMode === 'chart' 
                    ? 'bg-zinc-50 text-brand-primary' 
                    : 'opacity-40 hover:opacity-100 text-brand-secondary'
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest">Gráfica</span>
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  viewMode === 'table' 
                    ? 'bg-zinc-50 text-brand-primary' 
                    : 'opacity-40 hover:opacity-100 text-brand-secondary'
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest">Tabla</span>
              </button>
              <button 
                onClick={() => setViewMode('matrix')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  viewMode === 'matrix' 
                    ? 'bg-zinc-50 text-brand-primary' 
                    : 'opacity-40 hover:opacity-100 text-brand-secondary'
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest">Matriz</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Filters & Search */}
        <div className="flex justify-between items-center bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-zinc-100/50 shadow-sm">
          <div className="flex gap-4 items-center">
            {/* Legend / Status Filter */}
            <div className="flex bg-white/50 p-1 rounded-xl gap-1">
              {[
                { id: 'Verde', label: 'Saludable', color: 'bg-emerald-500' },
                { id: 'Amarillo', label: 'Riesgo', color: 'bg-amber-400' },
                { id: 'Rojo', label: 'Crítico', color: 'bg-rose-500' },
                { id: 'Gris', label: 'Hold', color: 'bg-slate-400' },
              ].map((status) => (
                <button
                  key={status.id}
                  onClick={() => toggleStatus(status.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                    selectedStatuses.includes(status.id)
                      ? 'bg-white shadow-sm opacity-100'
                      : 'opacity-30 grayscale'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${status.color}`}></span>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">
                      {status.label}
                    </span>
                    <span className="text-[8px] font-black text-brand-secondary/50 mt-0.5">
                      {statusCounts[status.id] || 0} Productos
                    </span>
                  </div>
                </button>
              ))}
              <div className="w-[1px] bg-zinc-200/50 mx-1"></div>
              <button
                onClick={() => {
                  if (selectedStatuses.length === 5) setSelectedStatuses([]);
                  else setSelectedStatuses(['Verde', 'Amarillo', 'Rojo', 'Gris', 'Azul']);
                }}
                className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest hover:bg-white rounded-lg transition-colors text-brand-secondary"
              >
                {selectedStatuses.length === 5 ? 'Ninguno' : 'Todos'}
              </button>
            </div>

            {/* Zoom Controls (Only show in chart mode) */}
            {viewMode === 'chart' && (
              <div className=" ml-4 flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-zinc-100 h-[38px]">
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
            )}
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-zinc-100 min-w-[340px] group transition-all duration-300 focus-within:ring-4 focus-within:ring-brand-primary/5 focus-within:border-brand-primary/20">
            <svg 
              className="w-4 h-4 text-brand-secondary/40 group-focus-within:text-brand-primary transition-colors" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text"
              placeholder="Buscar por ID, Producto o PO..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-bold text-brand-primary placeholder:text-brand-secondary/30 w-full"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-zinc-100 text-brand-secondary/40 hover:text-brand-primary transition-all"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex justify-center mb-10">
        <p className="text-[10px] font-bold text-brand-primary/40 uppercase tracking-[0.2em] bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-brand-primary/5">
          {filteredProjects.length} {filteredProjects.length === 1 ? 'Producto visualizado' : 'Productos visualizados'} 
          {viewMode === 'chart' && ' • Arrastra para navegar • Usa zoom para separar'}
        </p>
      </div>

      <main className="max-w-8xl mx-auto mb-20">
        {viewMode === 'chart' ? (
          <ProjectChart 
            filteredProjects={filteredProjects}
            zoom={zoom}
            offset={offset}
            activeCardId={activeCardId}
            setActiveCardId={setActiveCardId}
            isDragging={isDragging}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
        ) : viewMode === 'table' ? (
          <ProjectTable projects={filteredProjects} />
        ) : (
          <ProjectMatrix projects={filteredProjects} />
        )}
      </main>

      <footer className="mt-20 py-12 border-t border-zinc-100 flex flex-col items-center gap-8">
        <div className="flex items-center justify-center opacity-70 grayscale hover:grayscale-0 transition-all duration-700">
          <img 
            src="/logos.png" 
            alt="Grupo Educativo Tecnológico de Monterrey Logos" 
            className="h-20 w-auto object-contain"
          />
        </div>
        <p className="text-[10px] font-bold text-brand-secondary/30 uppercase tracking-[0.2em]">
          Getagile © 2026 • Impulsando el futuro de la educación e innovación
        </p>
      </footer>
      
    </div>
  );
}

