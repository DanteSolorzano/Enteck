import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { Observable } from 'rxjs';

export interface SignupRequest {
  Nombre: string;
  Telefono: string;
  Correo: string;
  Contrasena: string;
  Direccion?: string;
}

export interface LoginRequest {
  Correo: string;
  Contrasena: string;
}

export interface AuthResponse {
  id: string;
  correo: string;
  nombre: string;
}

export interface LoginResponse {
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:5190/api/auth';

  currentUser = signal<AuthResponse | null>(null);
  isLoggedIn = signal(false);

  signup(data: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, data);
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data);
  }

  logout(): void {
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    localStorage.removeItem('currentUser');
    this.deleteCookie('userId');
  }

  setCurrentUser(user: AuthResponse): void {
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
    // Store the user ID in a cookie
    this.setCookie('userId', user.id, 7); // Cookie expires in 7 days
  }

  loadStoredUser(): void {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      const user = JSON.parse(stored);
      this.currentUser.set(user);
      this.isLoggedIn.set(true);
    }
  }

  // Cookie management methods
  private setCookie(name: string, value: string, days: number = 7): void {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
  }

  private deleteCookie(name: string): void {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length);
      }
    }
    return null;
  }
}
