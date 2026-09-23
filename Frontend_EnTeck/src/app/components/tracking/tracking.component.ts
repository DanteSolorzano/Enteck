import { Component, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ServiceOrderService, ServiceOrder } from '../../services/service-order.service';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tracking-container">
      <div class="tracking-content">
        <h2>📋 Mis Órdenes de Servicio</h2>
        <p class="subtitle">Aquí puedes ver el estado de todas tus reparaciones.</p>

        <!-- Loading State -->
        @if (loading()) {
          <div class="loading">
            <span class="spinner"></span> Cargando órdenes...
          </div>
        }

        <!-- Error State -->
        @if (error()) {
          <div class="error-msg">
            ❌ Error al cargar las órdenes. Por favor intenta más tarde.
          </div>
        }

        <!-- Orders List -->
        @if (!loading() && orders().length > 0) {
          <div class="orders-list">
            @for (order of orders(); track order.id) {
              <div class="order-card" [ngClass]="'status-' + order.estado.toLowerCase()">
                <div class="order-header">
                  <div class="order-info">
                    <h3>{{ order.marca }} {{ order.modelo }}</h3>
                    <p class="problem">{{ order.problema }}</p>
                  </div>
                  <div class="order-id">ID: {{ order.id }}</div>
                </div>

                <div class="order-details">
                  <div class="detail-row">
                    <span class="label">Estado:</span>
                    <span class="status-badge" [ngClass]="'badge-' + order.estado.toLowerCase()">
                      {{ getStatusText(order.estado) }}
                    </span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Recibido:</span>
                    <span>{{ formatDate(order.fechaRecibido) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">ETA:</span>
                    <span>{{ formatDate(order.eta) }}</span>
                  </div>
                </div>

                <div class="progress-bar">
                  <div class="progress-fill" [style.width]="getProgress(order.estado) + '%'"></div>
                </div>
              </div>
            }
          </div>
        } @else if (!loading() && orders().length === 0) {
          <div class="no-orders">
            <span style="font-size: 40px;">📭</span>
            <p>No tienes órdenes de servicio en este momento.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .tracking-container { padding: 40px 20px; background: #f4f7f6; min-height: 100vh; }
    .tracking-content { max-width: 900px; margin: 0 auto; }
    
    h2 { margin: 0 0 10px 0; color: #333; }
    .subtitle { color: #666; margin-bottom: 30px; font-size: 14px; }

    /* Loading */
    .loading { 
      text-align: center; padding: 40px; 
      background: white; 
      border-radius: 12px; 
      color: #007bff; 
      font-weight: bold;
    }
    .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 10px;
      vertical-align: middle;
    }

    /* Error */
    .error-msg { 
      color: #d32f2f; 
      background: #ffebee; 
      padding: 20px; 
      border-radius: 8px; 
      text-align: center;
      font-weight: bold;
    }

    /* Orders List */
    .orders-list { display: grid; gap: 20px; }
    
    .order-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      border-left: 4px solid #ccc;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .order-card:hover { transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0,0,0,0.1); }

    .order-card.status-pending { border-left-color: #ff9800; }
    .order-card.status-in-progress { border-left-color: #007bff; }
    .order-card.status-completed { border-left-color: #28a745; }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }
    .order-info h3 { margin: 0; color: #333; font-size: 18px; }
    .order-info .problem { margin: 5px 0 0 0; color: #666; font-size: 14px; }
    .order-id { background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #666; }

    .order-details { margin-bottom: 15px; }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    .detail-row .label { font-weight: 600; color: #555; }
    .detail-row span { color: #666; }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }
    .badge-pending { background: #fff3e0; color: #e65100; }
    .badge-in-progress { background: #e3f2fd; color: #0d47a1; }
    .badge-completed { background: #e8f5e9; color: #1b5e20; }

    .progress-bar { height: 6px; background: #e0e0e0; border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; background: #28a745; transition: width 0.5s ease; }

    /* No Orders */
    .no-orders {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 12px;
      color: #999;
    }
    .no-orders p { margin: 20px 0 0 0; font-size: 16px; }

    @keyframes spin { 100% { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class TrackingComponent implements OnInit {
  orders = signal<ServiceOrder[]>([]);
  loading = signal(false);
  error = signal('');

  private authService = inject(AuthService);
  private serviceOrderService = inject(ServiceOrderService);

  ngOnInit(): void {
    this.loadOrders();
  }

  private loadOrders(): void {
    const userId = this.authService.getCookie('userId');
    if (!userId) {
      this.error.set('No user session found');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.serviceOrderService.getClientOrders(userId).subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load orders:', err);
        this.error.set('Failed to load orders. Please try again.');
        this.loading.set(false);
      }
    });
  }

  getStatusText(estado: string): string {
    const statusMap: { [key: string]: string } = {
      'Pending': 'Pendiente',
      'In Progress': 'En Proceso',
      'Completed': 'Completado',
      'Cancelled': 'Cancelado'
    };
    return statusMap[estado] || estado;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
      return date.toLocaleDateString('es-ES', options);
    } catch {
      return dateStr;
    }
  }

  getProgress(estado: string): number {
    const progressMap: { [key: string]: number } = {
      'Pending': 30,
      'In Progress': 60,
      'Completed': 100,
      'Cancelled': 0
    };
    return progressMap[estado] || 0;
  }
}