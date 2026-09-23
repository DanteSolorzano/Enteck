import { Component, signal, inject, OnInit, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, SignupRequest, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-container">
      <!-- LOGIN / REGISTRO FORM -->
      <div class="auth-card fade-in">
        <h2>{{ isRegistering() ? 'Crear Cuenta' : 'Iniciar Sesión' }}</h2>
        <p class="subtitle">
          {{ isRegistering() ? 'Regístrate para ver el estatus de tus equipos.' : 'Ingresa para ver tus reparaciones.' }}
        </p>

        @if (errorMessage()) {
          <div class="error-message">{{ errorMessage() }}</div>
        }

        <form (ngSubmit)="onSubmit()">
          
          <!-- Campos Extra solo para Registro -->
          @if (isRegistering()) {
            <div class="form-group slide-down">
              <label>Nombre Completo</label>
              <input type="text" [(ngModel)]="registerData.name" name="name" placeholder="Ej: Ana López" required [disabled]="isLoading()">
            </div>
            <div class="form-group slide-down">
              <label>Teléfono Celular</label>
              <input type="tel" [(ngModel)]="registerData.phone" name="phone" placeholder="10 dígitos" required [disabled]="isLoading()">
            </div>
            <div class="form-group slide-down">
              <label>Dirección (Opcional)</label>
              <input type="text" [(ngModel)]="registerData.address" name="address" placeholder="Tu dirección" [disabled]="isLoading()">
            </div>
          }

          <div class="form-group">
            <label>Correo Electrónico</label>
            <input type="email" [(ngModel)]="authData.email" name="email" placeholder="cliente@correo.com" required [disabled]="isLoading()">
          </div>

          <div class="form-group">
            <label>Contraseña</label>
            <input type="password" [(ngModel)]="authData.password" name="password" placeholder="******" required [disabled]="isLoading()">
          </div>

          <button type="submit" class="submit-btn" [disabled]="isLoading()">
            @if (isLoading()) {
              <span>Procesando...</span>
            } @else {
              <span>{{ isRegistering() ? 'Registrarse' : 'Ingresar' }}</span>
            }
          </button>
        </form>

        <div class="toggle-link">
          <p>
            {{ isRegistering() ? '¿Ya tienes cuenta?' : '¿Eres nuevo en EnTeck?' }}
            <a (click)="toggleMode()">
              {{ isRegistering() ? 'Inicia Sesión aquí' : 'Regístrate aquí' }}
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; padding: 40px 20px; background: #f4f7f6; min-height: 100vh; }
    
    /* Tarjeta */
    .auth-card { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); width: 100%; max-width: 450px; }

    h2 { margin: 0 0 10px 0; color: #333; }
    .subtitle { color: #666; margin-bottom: 30px; font-size: 14px; }

    /* Error Message */
    .error-message { background: #ffebee; color: #c62828; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; border-left: 4px solid #c62828; }

    /* Formulario */
    .form-group { margin-bottom: 15px; }
    label { display: block; font-weight: 600; font-size: 13px; color: #555; margin-bottom: 5px; }
    input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box; transition: border 0.3s; }
    input:focus { border-color: #007bff; outline: none; }
    input:disabled { background-color: #f5f5f5; cursor: not-allowed; }

    .submit-btn { width: 100%; padding: 14px; background: #1a1a1a; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 16px; cursor: pointer; margin-top: 10px; transition: background 0.3s; }
    .submit-btn:hover:not(:disabled) { background: #333; }
    .submit-btn:disabled { background: #999; cursor: not-allowed; }

    .toggle-link { text-align: center; margin-top: 20px; font-size: 14px; }
    .toggle-link a { color: #007bff; font-weight: bold; cursor: pointer; text-decoration: underline; }

    /* Animaciones */
    .fade-in { animation: fadeIn 0.5s ease; }
    .slide-down { animation: slideDown 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AuthComponent implements OnInit {
  private authService = inject(AuthService);

  // Output event to notify parent when user logs in
  loginSuccess = output<void>();

  // Estados de vista
  isRegistering = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  // Datos de formularios
  authData = { email: '', password: '' };
  registerData = { name: '', phone: '', address: '' };

  ngOnInit(): void {
    this.authService.loadStoredUser();
  }

  toggleMode() {
    this.isRegistering.set(!this.isRegistering());
    this.errorMessage.set('');
    this.authData = { email: '', password: '' };
    this.registerData = { name: '', phone: '', address: '' };
  }

  onSubmit() {
    this.errorMessage.set('');
    this.isLoading.set(true);

    if (this.isRegistering()) {
      this.handleSignup();
    } else {
      this.handleLogin();
    }
  }

  private handleSignup() {
    const signupData: SignupRequest = {
      Nombre: this.registerData.name,
      Telefono: this.registerData.phone,
      Correo: this.authData.email,
      Contrasena: this.authData.password,
      Direccion: this.registerData.address
    };

    this.authService.signup(signupData).subscribe({
      next: (response) => {
        this.authService.setCurrentUser(response);
        this.isLoading.set(false);
        this.isRegistering.set(false);
        this.authData = { email: '', password: '' };
        this.registerData = { name: '', phone: '', address: '' };
        this.loginSuccess.emit();
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Error en el registro. Intenta nuevamente.');
      }
    });
  }

  private handleLogin() {
    const loginData: LoginRequest = {
      Correo: this.authData.email,
      Contrasena: this.authData.password
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        // Fetch the user data after login
        this.authService.setCurrentUser({
          id: response.id,
          correo: this.authData.email,
          nombre: 'Cliente EnTeck'
        });
        this.isLoading.set(false);
        this.authData = { email: '', password: '' };
        this.loginSuccess.emit();
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set('Correo o contraseña incorrectos.');
      }
    });
  }
}