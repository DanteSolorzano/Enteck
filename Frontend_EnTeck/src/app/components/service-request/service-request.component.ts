import { Component, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ClientsService } from '../../services/clients.service';

@Component({
  selector: 'app-service-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="request-container">
      <div class="form-card">
        <div class="header">
          <h2>🛠️ Cotiza tu Reparación</h2>
          <p>¿No encuentras lo que buscas? Describe tu problema y te contactamos.</p>
        </div>

        @if (loading()) {
          <div class="loading">
            <span class="spinner"></span> Enviando solicitud...
          </div>
        } @else if (error()) {
          <div class="error-message">
            <div class="icon">❌</div>
            <h3>Error al enviar</h3>
            <p>{{ error() }}</p>
            <button (click)="clearError()">Intentar de nuevo</button>
          </div>
        } @else if (sent()) {
          <div class="success-message">
            <div class="icon">🎉</div>
            <h3>¡Solicitud Enviada!</h3>
            <p>Un técnico de EnTeck analizará tu caso y te contactará en menos de 24 horas.</p>
            <button (click)="reset()">Nueva Solicitud</button>
          </div>
        } @else {
          <form (ngSubmit)="submit()">
            <div class="form-group">
              <label>Tu Nombre</label>
              <input type="text" [value]="clientName()" disabled placeholder="Cargando...">
              <small style="color: #999; margin-top: 4px;">Obtenido de tu perfil</small>
            </div>

            <div class="row">
              <div class="form-group">
                <label>Marca del Dispositivo</label>
                <input type="text" [(ngModel)]="data.brand" name="brand" required placeholder="Ej: Samsung, iPhone, Xiaomi">
              </div>
              <div class="form-group">
                <label>Modelo</label>
                <input type="text" [(ngModel)]="data.model" name="model" required placeholder="Ej: Galaxy S21, 13 Pro">
              </div>
            </div>

            <div class="form-group">
              <label>Describe el problema</label>
              <textarea [(ngModel)]="data.issue" name="issue" rows="4" required placeholder="Ej: Se cayó al agua, no enciende, la pantalla tiene manchas..."></textarea>
            </div>

            <button type="submit" class="submit-btn" [disabled]="!isValid() || loading()">
              Enviar Solicitud
            </button>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .request-container { padding: 40px 20px; background: #fff; min-height: 60vh; display: flex; justify-content: center; }
    .form-card { width: 100%; max-width: 600px; }
    
    .header { text-align: center; margin-bottom: 30px; }
    .header h2 { color: #1a1a1a; margin-bottom: 10px; }
    .header p { color: #666; }

    form { display: flex; flex-direction: column; gap: 20px; }
    
    .row { display: flex; gap: 20px; }
    .row .form-group { flex: 1; }

    .form-group { display: flex; flex-direction: column; gap: 8px; }
    label { font-weight: 600; font-size: 14px; color: #444; }
    input, textarea { padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 15px; transition: border 0.3s; background: #f9f9f9; width: 100%; box-sizing: border-box; }
    input:focus, textarea:focus { border-color: #007bff; background: #fff; outline: none; }

    .submit-btn { padding: 15px; background: #007bff; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: background 0.3s; margin-top: 10px; }
    .submit-btn:hover:not(:disabled) { background: #0056b3; }
    .submit-btn:disabled { background: #ccc; cursor: not-allowed; }

    /* Loading */
    .loading { text-align: center; padding: 40px; background: #f9f9f9; border-radius: 12px; color: #007bff; font-weight: bold; }
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

    /* Mensaje Error */
    .error-message { text-align: center; padding: 40px; background: #ffebee; border-radius: 12px; border: 1px solid #ef5350; }
    .error-message .icon { font-size: 50px; margin-bottom: 20px; }
    .error-message p { color: #c62828; margin-bottom: 20px; }
    .error-message button { padding: 10px 20px; border: 1px solid #ef5350; background: white; color: #ef5350; border-radius: 20px; cursor: pointer; }

    /* Mensaje Éxito */
    .success-message { text-align: center; padding: 40px; background: #f0f9ff; border-radius: 12px; border: 1px solid #b3e5fc; }
    .success-message .icon { font-size: 50px; margin-bottom: 20px; }
    .success-message button { margin-top: 20px; padding: 10px 20px; border: 1px solid #007bff; background: white; color: #007bff; border-radius: 20px; cursor: pointer; }
    
    @keyframes spin { 100% { transform: rotate(360deg); } }
    @media (max-width: 600px) { .row { flex-direction: column; gap: 20px; } }
  `]
})
export class ServiceRequestComponent implements OnInit {
  sent = signal(false);
  loading = signal(false);
  error = signal('');
  clientName = signal('');

  data = { brand: '', model: '', issue: '' };

  private httpClient = inject(HttpClient);
  private authService = inject(AuthService);
  private clientsService = inject(ClientsService);

  ngOnInit(): void {
    this.loadClientData();
  }

  private loadClientData(): void {
    const userId = this.authService.getCookie('userId');
    if (!userId) {
      this.error.set('No user session found');
      return;
    }

    this.clientsService.getClient(userId).subscribe({
      next: (client) => {
        this.clientName.set(client.nombre);
      },
      error: (err) => {
        console.error('Failed to load client data:', err);
        this.error.set('Could not load your profile information');
      }
    });
  }

  isValid(): boolean {
    return !!this.data.brand && !!this.data.model && !!this.data.issue;
  }

  submit(): void {
    if (!this.isValid() || this.loading()) return;

    const userId = this.authService.getCookie('userId');
    if (!userId) {
      this.error.set('User session expired. Please login again.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const now = new Date();
    const eta = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    const payload = {
      idCliente: parseInt(userId),
      marca: this.data.brand,
      modelo: this.data.model,
      problema: this.data.issue,
      estado: 'Pending',
      eta: eta.toISOString()
    };

    this.httpClient.post('http://localhost:5190/api/service-order', payload).subscribe({
      next: () => {
        this.sent.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to submit service order:', err);
        this.error.set('Error sending request. Please try again.');
        this.loading.set(false);
      }
    });
  }

  reset(): void {
    this.data = { brand: '', model: '', issue: '' };
    this.sent.set(false);
    this.error.set('');
  }

  clearError(): void {
    this.error.set('');
  }
}