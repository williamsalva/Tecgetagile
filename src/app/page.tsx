import FlipCard from "@/components/FlipCard";
import { projects } from "@/data/projects";

export default function Home() {
  // Find max values for normalization
  const maxMonto = Math.max(...projects.map(p => p.monto), 100000);
  const maxAvance = 100; // Always 100%

  return (
    <div className="min-h-screen p-8 bg-background">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black text-brand-primary tracking-tighter">
            Tecgetagile
          </h1>
          <p className="text-brand-secondary mt-1 uppercase tracking-[0.3em] text-[10px] font-bold">
            Ecosistema de Innovación & Impacto
          </p>
        </div>
        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-brand-secondary/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Saludable
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Riesgo
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Crítico
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto h-[700px] border-l-2 border-b-2 border-brand-primary/20 mt-12 mb-20 bg-white/30 backdrop-blur-sm rounded-tr-3xl">
        {/* Y-Axis Label */}
        <div className="absolute -left-16 top-1/2 -rotate-90 origin-center text-xs font-black tracking-widest text-brand-primary opacity-40 uppercase whitespace-nowrap">
          Impacto Alcanzado (%)
        </div>

        {/* X-Axis Label */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-xs font-black tracking-widest text-brand-primary opacity-40 uppercase">
          Monto de Inversión ($)
        </div>

        {/* Grid Lines */}
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="border-t border-r border-brand-primary/5"></div>
          ))}
        </div>

        {/* Coordinate Points (FlipCards) */}
        <div className="absolute inset-0 p-12">
          {projects.map((project) => {
            // Calculate relative positions
            // X: Monto (Left to Right)
            // Y: Avance (Bottom to Top)
            const left = (project.monto / maxMonto) * 100;
            const bottom = (project.avance / maxAvance) * 100;

            return (
              <div
                key={project.id}
                className="absolute transition-all duration-1000 ease-out hover:z-50"
                style={{
                  left: `${left}%`,
                  bottom: `${bottom}%`,
                  transform: "translate(-50%, 50%)", // Center the card on the point
                }}
              >
                <FlipCard project={project} />
              </div>
            );
          })}
        </div>

        {/* Axis Markers */}
        <div className="absolute -left-2 top-0 h-full flex flex-col justify-between text-[8px] font-bold text-brand-primary/40 py-1 ">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>
        <div className="absolute -bottom-6 left-0 w-full flex justify-between text-[8px] font-bold text-brand-primary/40 px-1">
          <span>$0</span>
          <span>${(maxMonto * 0.25).toLocaleString()}</span>
          <span>${(maxMonto * 0.5).toLocaleString()}</span>
          <span>${(maxMonto * 0.75).toLocaleString()}</span>
          <span>${maxMonto.toLocaleString()}</span>
        </div>
      </main>
    </div>
  );
}

