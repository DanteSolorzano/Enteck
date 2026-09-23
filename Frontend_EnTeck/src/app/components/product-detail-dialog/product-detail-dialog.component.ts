import { Component, Inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { MenuItem } from '../../models/menu-item.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './product-detail-dialog.component.html',
  styleUrl: './product-detail-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailDialogComponent {
  // Señal para la cantidad seleccionada
  protected readonly quantity = signal(1);
  
  // Inyección del servicio de carrito
  private readonly cartService = inject(CartService);

  constructor(
    public dialogRef: MatDialogRef<ProductDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MenuItem
  ) {}

  // Aumentar cantidad (respetando stock si es producto físico)
  protected increaseQuantity() {
    // Si es servicio ilimitado O si hay stock suficiente
    if (this.data.esServicio || this.quantity() < this.data.stock) {
      this.quantity.update(q => q + 1);
    }
  }

  // Disminuir cantidad
  protected decreaseQuantity() {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  // Agregar al carrito y cerrar modal
  protected addToCart() {
    this.cartService.addItem(this.data, this.quantity());
    this.dialogRef.close();
  }
  
  // Cerrar manualmente
  protected close() {
    this.dialogRef.close();
  }
}