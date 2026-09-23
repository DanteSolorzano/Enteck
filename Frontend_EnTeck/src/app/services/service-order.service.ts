import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ServiceOrder {
  id: number;
  marca: string;
  modelo: string;
  problema: string;
  estado: string;
  fechaRecibido: string;
  eta: string;
  idCliente: number;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceOrderService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:5190/api/service-order';

  getClientOrders(userId: string): Observable<ServiceOrder[]> {
    return this.http.get<ServiceOrder[]>(`${this.apiUrl}/client/${userId}`);
  }
}
