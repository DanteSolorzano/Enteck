import { Injectable, signal } from '@angular/core';
import { MenuItem } from '../models/menu-item.model';
import { delay, of } from 'rxjs';

export interface CartItem {
  product: MenuItem;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Estado reactivo del carrito
  private readonly cartItems = signal<CartItem[]>([]);
  
  // Exponemos una versión de solo lectura
  readonly items = this.cartItems.asReadonly();

  // Agregar item
  addItem(product: MenuItem, quantity: number = 1) {
    const current = this.cartItems();
    const existingIndex = current.findIndex(ci => ci.product.id === product.id);
    
    if (existingIndex >= 0) {
      // Si ya existe, validamos stock y sumamos
      const updated = [...current];
      const existingItem = updated[existingIndex];
      
      let newQuantity = existingItem.quantity + quantity;
      
      // Tope de stock (si no es servicio)
      if (!product.esServicio && newQuantity > product.stock) {
        newQuantity = product.stock;
      }

      updated[existingIndex] = { ...existingItem, quantity: newQuantity };
      this.cartItems.set(updated);
    } else {
      // Si es nuevo
      this.cartItems.set([...current, { product, quantity }]);
    }
  }

  // Eliminar item
  removeItem(productId: number) {
    this.cartItems.set(this.cartItems().filter(item => item.product.id !== productId));
  }

  // Actualizar cantidad (+/-)
  updateQuantity(productId: number, quantity: number) {
    const currentItems = this.cartItems();
    const item = currentItems.find(i => i.product.id === productId);

    if (!item) return;

    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    // Validar Stock
    if (!item.product.esServicio && quantity > item.product.stock) {
      return; // No subir más allá del stock
    }
    
    const updated = currentItems.map(i =>
      i.product.id === productId ? { ...i, quantity } : i
    );
    this.cartItems.set(updated);
  }

  clearCart() {
    this.cartItems.set([]);
  }

  getTotal(): number {
    return this.cartItems().reduce((sum, item) => sum + (item.product.precio * item.quantity), 0);
  }

  getItemCount(): number {
    return this.cartItems().reduce((sum, item) => sum + item.quantity, 0);
  }

  // SIMULACIÓN DE COMPRA (Mock)
  checkout() {
    // En lugar de llamar a una API real que falla, simulamos una espera de 1.5s
    // y devolvemos "true" como éxito.
    return of(true).pipe(delay(1500));
  }
}