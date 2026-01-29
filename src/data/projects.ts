export interface Project {
  id: string;
  nombre: string;
  tipo: 'Producto' | 'Componente';
  linea: string;
  simbolo: string;
  nombreCorto: string;
  estatus: 'Verde' | 'Amarillo' | 'Rojo' | 'Gris';
  avance: number; // percentage
  monto: number; // $ investment
  equipos: string[];
}

export const projects: Project[] = [
  {
    id: "TL01",
    nombre: "Plataformas de Aprendizaje y Evaluación",
    tipo: "Producto",
    linea: "Aprendizaje y Enseñanza",
    simbolo: "Ae",
    nombreCorto: "Aprendizaje",
    estatus: "Verde",
    avance: 27.22,
    monto: 150000,
    equipos: ["Core Team", "EdTech Dev"]
  },
  {
    id: "TL03",
    nombre: "Programas y experiencias formativas",
    tipo: "Producto",
    linea: "Aprendizaje y Enseñanza",
    simbolo: "Pf",
    nombreCorto: "Programas",
    estatus: "Verde",
    avance: 55.92,
    monto: 85000,
    equipos: ["Academic Ops"]
  },
  {
    id: "TL04",
    nombre: "Producto de analíticas de Teaching and Learning",
    tipo: "Producto",
    linea: "Aprendizaje y Enseñanza",
    simbolo: "At",
    nombreCorto: "Analíticas T&L",
    estatus: "Gris",
    avance: 38.88,
    monto: 120000,
    equipos: ["Data Insights"]
  },
  {
    id: "TL05",
    nombre: "Inteligencia Artificial y Tecnologías Emergentes",
    tipo: "Componente",
    linea: "Aprendizaje y Enseñanza",
    simbolo: "Ie",
    nombreCorto: "IA y Emergentes",
    estatus: "Amarillo",
    avance: 15.00,
    monto: 200000,
    equipos: ["R&D Labs", "AI Engineering"]
  },
  {
    id: "TL06",
    nombre: "Ecosistema de Microcredenciales",
    tipo: "Producto",
    linea: "Aprendizaje y Enseñanza",
    simbolo: "Mc",
    nombreCorto: "Microcredenciales",
    estatus: "Rojo",
    avance: 85.00,
    monto: 60000,
    equipos: ["Certification Team"]
  }
];
