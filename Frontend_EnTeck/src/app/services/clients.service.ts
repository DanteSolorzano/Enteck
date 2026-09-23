import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { Observable } from 'rxjs';

export interface Client {
  id: number;
  nombre: string;
  telefono: string;
  correo: string;
  direccion: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:5190/api/clients';

  currentClient = signal<Client | null>(null);

  getClient(userId: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${userId}`);
  }

  setCurrentClient(client: Client): void {
    this.currentClient.set(client);
  }

  logout(): void {
    this.currentClient.set(null);
  }
}
