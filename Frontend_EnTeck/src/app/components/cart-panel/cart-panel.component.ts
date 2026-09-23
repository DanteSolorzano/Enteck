import { Component, ChangeDetectionStrategy, inject, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-panel.component.html',
  styleUrl: './cart-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartPanelComponent {
  // Inyección del servicio
  protected cartService = inject(CartService);
  
  // Output para cerrar el carrito
  @Output() closeCart = new EventEmitter<void>();
  
  protected isLoading = signal(false);
  protected errorMessage = signal('');

  // Método para cerrar
  close() {
    this.closeCart.emit();
  }

  protected checkout() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    // Llamamos al método simulado del servicio
    this.cartService.checkout().subscribe({
      next: () => {
        this.isLoading.set(false);
        alert('✅ ¡Pedido realizado con éxito!\n\n(En una app real, aquí irías a la pasarela de pagos)');
        this.cartService.clearCart();
        this.close();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Error al procesar el pedido.');
        console.error(err);
      }
    });
  }
}