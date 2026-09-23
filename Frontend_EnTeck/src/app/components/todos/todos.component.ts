import { Component, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { MenuItem } from '../../models/menu-item.model';
import { MatCard, MatCardContent, MatCardTitle, MatCardSubtitle } from '@angular/material/card';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductDetailDialogComponent } from '../product-detail-dialog/product-detail-dialog.component';

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [
    CommonModule,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatCardSubtitle,
    MatProgressSpinner,
    MatDialogModule
  ],
  templateUrl: './todos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodosComponent implements OnInit {
  protected readonly menuItems = signal<MenuItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  private readonly http = inject(HttpClient);
  private readonly dialog = inject(MatDialog);

  ngOnInit() {
    this.fetchMenu();
  }

  protected openProductDetail(item: MenuItem) {
    this.dialog.open(ProductDetailDialogComponent, {
      data: item,
      width: '600px',
      maxWidth: '90vw'
    });
  }

  private fetchMenu() {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<MenuItem[]>('http://127.0.0.1:5276/menu').subscribe({
      next: (data) => {
        this.menuItems.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }
}

