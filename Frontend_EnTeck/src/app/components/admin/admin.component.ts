import { Component, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface User {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
}

interface ServiceOrder {
  id: number;
  marca: string;
  modelo: string;
  problema: string;
  estado: string;
  fechaRecibido: string;
  eta: string;
  idCliente: number;
}

interface ClientMap {
  [key: number]: User;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-container">
      <!-- Left Navigation -->
      <div class="sidebar">
        <div class="logo-section">
          <span style="font-size: 24px;">⚙️</span>
          <h2 style="margin: 0; color: #fff;">Admin</h2>
        </div>
        
        <nav class="nav-menu">
          <button 
            (click)="setActiveTab('add-user')"
            [class.active]="activeTab() === 'add-user'"
            class="nav-btn">
            <span>➕</span> Agregar Usuario
          </button>
          <button 
            (click)="setActiveTab('delete-user')"
            [class.active]="activeTab() === 'delete-user'"
            class="nav-btn">
            <span>🗑️</span> Eliminar Usuario
          </button>
          <button 
            (click)="setActiveTab('orders')"
            [class.active]="activeTab() === 'orders'"
            class="nav-btn">
            <span>📋</span> Órdenes de Servicio
          </button>
        </nav>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        
        <!-- Add User Section -->
        @if (activeTab() === 'add-user') {
          <div class="section">
            <h1>Agregar Nuevo Usuario</h1>
            
            @if (addUserLoading()) {
              <div class="loading">
                <span class="spinner"></span> Creando usuario...
              </div>
            } @else if (addUserError()) {
              <div class="error-message">
                <p>{{ addUserError() }}</p>
                <button (click)="clearAddUserError()">Cerrar</button>
              </div>
            } @else if (addUserSuccess()) {
              <div class="success-message">
                <p>✅ Usuario creado exitosamente</p>
                <button (click)="resetAddUserForm()">Agregar otro usuario</button>
              </div>
            } @else {
              <form (ngSubmit)="submitAddUser()" class="form">
                <div class="form-group">
                  <label>Nombre Completo</label>
                  <input type="text" [(ngModel)]="addUserForm.nombre" name="nombre" required placeholder="Juan Pérez">
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Email</label>
                    <input type="email" [(ngModel)]="addUserForm.correo" name="correo" required placeholder="juan@example.com">
                  </div>
                  <div class="form-group">
                    <label>Contraseña</label>
                    <input type="password" [(ngModel)]="addUserForm.contrasena" name="contrasena" required placeholder="••••••••">
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Teléfono</label>
                    <input type="tel" [(ngModel)]="addUserForm.telefono" name="telefono" required placeholder="+34 600 000 000">
                  </div>
                  <div class="form-group">
                    <label>Dirección</label>
                    <input type="text" [(ngModel)]="addUserForm.direccion" name="direccion" required placeholder="Calle Principal 123">
                  </div>
                </div>

                <button type="submit" class="submit-btn" [disabled]="!isAddUserFormValid()">
                  Crear Usuario
                </button>
              </form>
            }
          </div>
        }

        <!-- Delete User Section -->
        @if (activeTab() === 'delete-user') {
          <div class="section">
            <h1>Eliminar Usuario</h1>
            
            @if (deleteUserLoading()) {
              <div class="loading">
                <span class="spinner"></span> Cargando usuarios...
              </div>
            } @else if (deleteUserError()) {
              <div class="error-message">
                <p>{{ deleteUserError() }}</p>
                <button (click)="clearDeleteUserError()">Cerrar</button>
              </div>
            } @else {
              <div class="users-list">
                @if (users().length > 0) {
                  @for (user of users(); track user.id) {
                    <div class="user-card">
                      <div class="user-info">
                        <h3>{{ user.nombre }}</h3>
                        <p class="email">{{ user.correo }}</p>
                        <p class="phone">📱 {{ user.telefono }}</p>
                        <p class="address">📍 {{ user.direccion }}</p>
                      </div>
                      <button class="delete-btn" (click)="deleteUser(user.id)" title="Eliminar usuario">
                        Eliminar
                      </button>
                    </div>
                  }
                } @else {
                  <div class="no-data">
                    <p>No hay usuarios en la base de datos</p>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Service Orders Section -->
        @if (activeTab() === 'orders') {
          <div class="section">
            <h1>Órdenes de Servicio</h1>
            
            @if (ordersLoading()) {
              <div class="loading">
                <span class="spinner"></span> Cargando órdenes...
              </div>
            } @else if (ordersError()) {
              <div class="error-message">
                <p>{{ ordersError() }}</p>
                <button (click)="clearOrdersError()">Cerrar</button>
              </div>
            } @else {
              <div class="orders-list">
                @if (orders().length > 0) {
                  @for (order of orders(); track order.id) {
                    <div class="order-card">
                      <div class="order-header">
                        <div>
                          <h3>{{ order.marca }} {{ order.modelo }}</h3>
                          <p class="problem">{{ order.problema }}</p>
                        </div>
                        <span class="order-id">ID: {{ order.id }}</span>
                      </div>
                      
                      <div class="order-details">
                        <div class="detail-row">
                          <span class="label">Cliente ID:</span>
                          <span>{{ order.idCliente }}</span>
                        </div>
                        <div class="detail-row">
                          <span class="label">Estado:</span>
                          <span class="status-badge" [ngClass]="'badge-' + order.estado.toLowerCase()">
                            {{ order.estado }}
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
                        <div class="detail-row" style="margin-top: 15px;">
                          <button 
                            (click)="sendWhatsAppMessage(order)"
                            style="padding: 10px 20px; background: #25D366; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 8px; transition: background 0.3s;">
                            📱 Enviar WhatsApp
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                } @else {
                  <div class="no-data">
                    <p>No hay órdenes de servicio en la base de datos</p>
                  </div>
                }
              </div>
            }
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      display: flex;
      min-height: 100vh;
      background: #f4f7f6;
    }

    /* Sidebar */
    .sidebar {
      width: 250px;
      background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
      padding: 20px;
      box-shadow: 2px 0 10px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #00e5ff;
    }

    .logo-section h2 {
      font-size: 20px;
    }

    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .nav-btn {
      padding: 12px 15px;
      background: transparent;
      color: #ccc;
      border: 1px solid #444;
      border-radius: 8px;
      cursor: pointer;
      text-align: left;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .nav-btn:hover {
      background: #333;
      color: #00e5ff;
      border-color: #00e5ff;
    }

    .nav-btn.active {
      background: #00e5ff;
      color: #1a1a1a;
      border-color: #00e5ff;
    }

    /* Main Content */
    .main-content {
      flex: 1;
      padding: 40px;
      overflow-y: auto;
    }

    .section h1 {
      color: #333;
      margin-bottom: 30px;
      font-size: 28px;
    }

    /* Form Styles */
    .form {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      max-width: 600px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    label {
      font-weight: 600;
      color: #444;
      font-size: 14px;
    }

    input {
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 15px;
      transition: border 0.3s;
      background: #f9f9f9;
    }

    input:focus {
      border-color: #007bff;
      background: white;
      outline: none;
    }

    .submit-btn {
      padding: 12px 30px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.3s;
      margin-top: 10px;
    }

    .submit-btn:hover:not(:disabled) {
      background: #0056b3;
    }

    .submit-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    /* Loading, Error, Success Messages */
    .loading {
      text-align: center;
      padding: 40px;
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

    .error-message {
      background: #ffebee;
      color: #c62828;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #d32f2f;
      margin-bottom: 20px;
    }

    .error-message button {
      margin-top: 10px;
      padding: 8px 15px;
      background: transparent;
      border: 1px solid #c62828;
      color: #c62828;
      border-radius: 4px;
      cursor: pointer;
    }

    .success-message {
      background: #e8f5e9;
      color: #1b5e20;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #28a745;
      margin-bottom: 20px;
    }

    .success-message button {
      margin-top: 10px;
      padding: 8px 15px;
      background: #28a745;
      border: none;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }

    /* Users List */
    .users-list {
      display: grid;
      gap: 20px;
    }

    .user-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .user-info h3 {
      margin: 0 0 10px 0;
      color: #333;
    }

    .user-info p {
      margin: 5px 0;
      color: #666;
      font-size: 14px;
    }

    .email {
      font-weight: 500;
      color: #007bff;
    }

    .delete-btn {
      padding: 8px 20px;
      background: #ff4444;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      transition: background 0.3s;
    }

    .delete-btn:hover {
      background: #cc0000;
    }

    /* Orders List */
    .orders-list {
      display: grid;
      gap: 20px;
    }

    .order-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      border-left: 4px solid #007bff;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }

    .order-header h3 {
      margin: 0;
      color: #333;
    }

    .problem {
      margin: 5px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    .order-id {
      background: #f5f5f5;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      color: #666;
    }

    .order-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
    }

    .label {
      font-weight: 600;
      color: #555;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }

    .badge-pending { background: #fff3e0; color: #e65100; }
    .badge-in-progress { background: #e3f2fd; color: #0d47a1; }
    .badge-completed { background: #e8f5e9; color: #1b5e20; }

    .no-data {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 12px;
      color: #999;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .admin-container {
        flex-direction: column;
      }

      .sidebar {
        width: 100%;
        height: auto;
        position: static;
      }

      .nav-menu {
        flex-direction: row;
        flex-wrap: wrap;
      }

      .main-content {
        padding: 20px;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .user-card, .order-card {
        flex-direction: column;
        align-items: flex-start;
      }

      .delete-btn {
        align-self: flex-end;
        margin-top: 15px;
      }
    }
  `]
})
export class AdminComponent implements OnInit {
  private httpClient = inject(HttpClient);

  activeTab = signal<'add-user' | 'delete-user' | 'orders'>('add-user');

  // Add User States
  addUserForm = { nombre: '', correo: '', contrasena: '', telefono: '', direccion: '' };
  addUserLoading = signal(false);
  addUserError = signal('');
  addUserSuccess = signal(false);

  // Delete User States
  users = signal<User[]>([]);
  deleteUserLoading = signal(false);
  deleteUserError = signal('');

  // Orders States
  orders = signal<ServiceOrder[]>([]);
  ordersLoading = signal(false);
  ordersError = signal('');
  clientsMap = signal<ClientMap>({});

  ngOnInit(): void {
    this.loadUsers();
    this.loadOrders();
  }

  setActiveTab(tab: 'add-user' | 'delete-user' | 'orders'): void {
    this.activeTab.set(tab);
    if (tab === 'delete-user') {
      this.loadUsers();
    } else if (tab === 'orders') {
      this.loadOrders();
    }
  }

  /* ADD USER METHODS */
  isAddUserFormValid(): boolean {
    return !!(this.addUserForm.nombre && this.addUserForm.correo && 
              this.addUserForm.contrasena && this.addUserForm.telefono && 
              this.addUserForm.direccion);
  }

  submitAddUser(): void {
    if (!this.isAddUserFormValid() || this.addUserLoading()) return;

    this.addUserLoading.set(true);
    this.addUserError.set('');

    const payload = {
      nombre: this.addUserForm.nombre,
      telefono: this.addUserForm.telefono,
      correo: this.addUserForm.correo,
      contrasena: this.addUserForm.contrasena,
      direccion: this.addUserForm.direccion
    };

    this.httpClient.post('http://localhost:5190/api/auth/signup', payload).subscribe({
      next: () => {
        this.addUserLoading.set(false);
        this.addUserSuccess.set(true);
      },
      error: (err) => {
        console.error('Failed to create user:', err);
        this.addUserError.set('Error al crear el usuario. Intenta de nuevo.');
        this.addUserLoading.set(false);
      }
    });
  }

  resetAddUserForm(): void {
    this.addUserForm = { nombre: '', correo: '', contrasena: '', telefono: '', direccion: '' };
    this.addUserSuccess.set(false);
  }

  clearAddUserError(): void {
    this.addUserError.set('');
  }

  /* DELETE USER METHODS */
  private loadUsers(): void {
    this.deleteUserLoading.set(true);
    this.deleteUserError.set('');

    this.httpClient.get<User[]>('http://localhost:5190/api/clients').subscribe({
      next: (data) => {
        this.users.set(data);
        this.deleteUserLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.deleteUserError.set('Error al cargar los usuarios');
        this.deleteUserLoading.set(false);
      }
    });
  }

  deleteUser(userId: number): void {
    this.httpClient.delete(`http://localhost:5190/api/clients/${userId}`).subscribe({
      next: () => {
        // Remove user from the list
        this.users.set(this.users().filter(u => u.id !== userId));
      },
      error: (err) => {
        console.error('Failed to delete user:', err);
        this.deleteUserError.set('Error al eliminar el usuario');
      }
    });
  }

  clearDeleteUserError(): void {
    this.deleteUserError.set('');
  }

  /* ORDERS METHODS */
  private loadOrders(): void {
    this.ordersLoading.set(true);
    this.ordersError.set('');

    // Load clients first to create a map
    this.httpClient.get<User[]>('http://localhost:5190/api/clients').subscribe({
      next: (clients) => {
        const clientMap: ClientMap = {};
        clients.forEach(client => {
          clientMap[client.id] = client;
        });
        this.clientsMap.set(clientMap);

        // Then load orders
        this.httpClient.get<ServiceOrder[]>('http://localhost:5190/api/service-order').subscribe({
          next: (data) => {
            this.orders.set(data);
            this.ordersLoading.set(false);
          },
          error: (err) => {
            console.error('Failed to load orders:', err);
            this.ordersError.set('Error al cargar las órdenes');
            this.ordersLoading.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Failed to load clients:', err);
        this.ordersError.set('Error al cargar la información de clientes');
        this.ordersLoading.set(false);
      }
    });
  }

  clearOrdersError(): void {
    this.ordersError.set('');
  }

  getClientPhone(clientId: number): string {
    const client = this.clientsMap()[clientId];
    return client ? client.telefono : '';
  }

  getWhatsAppLink(order: ServiceOrder): string {
    const client = this.clientsMap()[order.idCliente];
    if (!client) return '';

    const phoneNumber = client.telefono.replace(/\D/g, ''); // Remove non-digit characters
    const message = `Tu ${order.modelo} esta en proceso de servicio, te avisaremos tan pronto este terminado!`;
    const encodedMessage = encodeURIComponent(message);

    return `https://wa.me/${phoneNumber}/?text=${encodedMessage}`;
  }

  sendWhatsAppMessage(order: ServiceOrder): void {
    const link = this.getWhatsAppLink(order);
    if (link) {
      window.open(link, '_blank');
    }
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
}