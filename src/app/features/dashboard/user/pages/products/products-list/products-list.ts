import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductsStore } from '@features/dashboard/shared/store/products.store';
import { Briefcase, LucideAngularModule, Package, Pencil, Plus, Trash2 } from 'lucide-angular';

@Component({
  selector: 'app-products-list',
  imports: [RouterModule, DecimalPipe, LucideAngularModule],
  templateUrl: './products-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductsList implements OnInit {
  productsStore = inject(ProductsStore);

  icons = {
    add: Plus,
    business: Briefcase,
    delete: Trash2,
    edit: Pencil,
    package: Package
  };

  ngOnInit() {
    this.productsStore.loadAllProducts();
  }

  deleteProduct(id: string, name: string) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) {
      this.productsStore.deleteProduct(id);
    }
  }
}
