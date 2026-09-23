export interface MenuItem {
  // Nota: Mantenemos el nombre "MenuItem" por ahora para no romper
  // tus otros archivos .ts, pero conceptualmente es un "EnTeckItem"
  id: number;
  categoria: string;       // Ej: "Pantallas", "Cargadores", "Microsoldadura"
  nombre: string;
  descripcion: string;     // Ej: "Display OLED calidad original..."
  modeloCompatible: string; // NUEVO: Ej: "iPhone 11, 12, 13"
  precio: number;
  stock: number;           // NUEVO: Cantidad disponible
  imagenUrl: string;
  esServicio: boolean;     // NUEVO: True si es mano de obra, False si es producto físico
}