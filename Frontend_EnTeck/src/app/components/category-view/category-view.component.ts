import { Component, Input, Output, EventEmitter, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MenuItem } from '../../models/menu-item.model';
import { MatDialog } from '@angular/material/dialog';
import { ProductDetailDialogComponent } from '../product-detail-dialog/product-detail-dialog.component';

@Component({
  selector: 'app-category-view',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './category-view.component.html',
  styles: [`
    /* Estilos Generales */
    :host { display: block; min-height: 500px; }
    .center-msg { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; text-align: center; }
    
    /* Grid y Layout */
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 2rem; margin-bottom: 2rem; }
    
    /* Tarjeta del Producto */
    .product-card {
      display: flex; flex-direction: column; cursor: pointer;
      background: white; border-radius: 12px; overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    
    /* ANIMACIÓN HOVER (Aquí está la magia) */
    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 20px rgba(0, 123, 255, 0.15);
      border-color: #007bff;
    }

    /* Imagen */
    .image-container {
      width: 100%; height: 200px; background: #f8f9fa;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden; position: relative; border-bottom: 1px solid #eee;
    }
    .image-container img { width: 100%; height: 100%; object-fit: cover; }

    /* Badges */
    .badge { position: absolute; font-size: 10px; font-weight: bold; padding: 4px 8px; border-radius: 4px; }
    .service-badge { top: 10px; right: 10px; background: rgba(0, 123, 255, 0.9); color: white; backdrop-filter: blur(4px); }
    .out-of-stock { top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; color: #555; }

    /* Textos */
    .card-content { flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; padding: 1.2rem; }
    .card-title { margin: 0 0 0.5rem 0; font-size: 1.1rem; font-weight: 700; line-height: 1.2; }
    .card-subtitle { margin: 0 0 1rem 0; font-size: 0.85rem; color: #666; }
    .card-subtitle strong { color: #333; background: #eee; padding: 2px 6px; border-radius: 4px; margin-left: 4px; }
    
    /* Footer de la tarjeta */
    .card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 1rem; border-top: 1px solid #f0f0f0; }
    .price { font-size: 1.25em; font-weight: 800; color: #333; }
    .add-btn { background: #007bff; color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; transition: background 0.2s; }
    .add-btn:hover { background: #0056b3; }
    
    /* Botón Volver */
    .back-btn { padding: 0.6rem 1.2rem; background: white; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s ease; font-weight: 600; color: #555; }
    .back-btn:hover { background: #f5f5f5; }
  `]
})
export class CategoryViewComponent {
  @Input() categoryName: string | null = null;
  @Input() searchQuery: string = '';
  @Output() backClicked = new EventEmitter<void>();

  private dialog = inject(MatDialog);

  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // --- BASE DE DATOS LOCAL (INVENTARIO) ---
  private allItems = signal<MenuItem[]>([
      {
        id: 1,
        nombre: 'Cambio de Pantalla iPhone 11',
        categoria: 'Servicios',
        descripcion: 'Display calidad OLED con TrueTone programado.',
        modeloCompatible: 'iPhone 11',
        precio: 1200,
        stock: 100,
        imagenUrl: 'https://m.media-amazon.com/images/I/61s7s+eXwWL.jpg',
        esServicio: true
      },
      {
        id: 2,
        nombre: 'Desbloqueo Cuenta Google',
        categoria: 'Servicios',
        descripcion: 'Eliminación de bloqueo FRP por servidor.',
        modeloCompatible: 'Samsung / Moto / Xiaomi',
        precio: 350,
        stock: 100,
        imagenUrl: 'https://i.ytimg.com/vi/W5QzGZgGg6g/hqdefault.jpg',
        esServicio: true
      },
      {
        id: 4,
        nombre: 'Funda Uso Rudo Survivor',
        categoria: 'Fundas',
        descripcion: 'Protección grado militar, doble capa.',
        modeloCompatible: 'Samsung A54',
        precio: 250,
        stock: 5,
        imagenUrl: 'https://m.media-amazon.com/images/I/71wPw0q0kHL._AC_SL1500_.jpg',
        esServicio: false
      },
      {
        id: 6,
        nombre: 'Cubo Carga Rápida 20W',
        categoria: 'Cargadores',
        descripcion: 'Entrada USB-C. Carga tu equipo al 50% en 30 mins.',
        modeloCompatible: 'Universal USB-C',
        precio: 220,
        stock: 8,
        imagenUrl: 'https://m.media-amazon.com/images/I/51f8I6+2+FL._AC_SX466_.jpg',
        esServicio: false
      }
      // Puedes agregar más productos aquí si quieres
  ]);

  filteredItems = computed(() => {
    let items = this.allItems();
    if (this.categoryName && this.categoryName !== 'Todos') {
      items = items.filter(item => 
        item.categoria.toLowerCase() === this.categoryName?.toLowerCase()
      );
    }
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      items = items.filter(item => 
        item.nombre.toLowerCase().includes(query) || 
        item.modeloCompatible.toLowerCase().includes(query)
      );
    }
    return items;
  });

  goBack() {
    this.backClicked.emit();
  }

  openProductDetail(item: MenuItem) {
    this.dialog.open(ProductDetailDialogComponent, {
      data: item,
      width: '800px',
      maxWidth: '90vw'
    });
  }
}