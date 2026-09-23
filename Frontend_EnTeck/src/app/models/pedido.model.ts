import { MenuItem } from './menu-item.model';

export interface PedidoProducto {
  id: number;
  cantidad: number;
  producto: MenuItem;
}

export interface Pedido {
  id: number;
  fecha: string;
  total: number;
  productos: PedidoProducto[];
}
