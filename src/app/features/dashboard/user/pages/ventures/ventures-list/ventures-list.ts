import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VenturesStore } from '@features/dashboard/shared/store/ventures.store';
import { ProductsStore } from '@features/dashboard/shared/store/products.store';
import { ApiImgPipe } from '@shared/pipes/api-img.pipe';
import {
  Building2,
  Briefcase,
  Eye,
  EyeOff,
  LucideAngularModule,
  Package,
  Pencil,
  Plus,
  Tag,
  Trash2,
  TrendingUp
} from 'lucide-angular';

@Component({
  selector: 'app-ventures-list',
  imports: [RouterModule, ApiImgPipe, DecimalPipe, LucideAngularModule],
  templateUrl: './ventures-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VenturesUnified implements OnInit {
  venturesStore = inject(VenturesStore);
  productsStore = inject(ProductsStore);

  icons = {
    add: Plus,
    business: Briefcase,
    category: Tag,
    delete: Trash2,
    edit: Pencil,
    eyeOff: EyeOff,
    package: Package,
    project: Building2,
    trendingUp: TrendingUp,
    view: Eye
  };

  activeTab = signal<'ventures' | 'products'>('ventures');

  ngOnInit() {
    this.venturesStore.loadAllVentures();
    this.productsStore.loadAllProducts();
  }

  switchTab(tab: 'ventures' | 'products') {
    this.activeTab.set(tab);
  }

  deleteVenture(id: string, name: string) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) {
      this.venturesStore.deleteVenture({ id });
    }
  }

  deleteProduct(id: string, name: string) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) {
      this.productsStore.deleteProduct(id);
    }
  }
}
