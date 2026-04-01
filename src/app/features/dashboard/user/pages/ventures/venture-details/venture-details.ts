import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { NgOptimizedImage, DecimalPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VenturesStore } from '@features/dashboard/shared/store/ventures.store';
import { ProductsStore } from '@features/dashboard/shared/store/products.store';
import { ApiImgPipe } from '@shared/pipes/api-img.pipe';
import {
  LucideAngularModule,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Edit,
  Target,
  Users,
  ShoppingBag,
  Package,
  Briefcase,
  Lightbulb,
  Trash2,
  Plus,
  MapPin,
  Handshake,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  Link,
  BriefcaseBusiness
} from 'lucide-angular';
import type { IImage } from '@shared/models';

@Component({
  selector: 'app-venture-details',
  imports: [RouterModule, ApiImgPipe, NgOptimizedImage, DecimalPipe, DatePipe, LucideAngularModule],
  templateUrl: './venture-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VentureDetails implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  venturesStore = inject(VenturesStore);
  productsStore = inject(ProductsStore);

  lightboxOpen = signal(false);
  lightboxImages = signal<IImage[]>([]);
  lightboxIndex = signal(0);

  icons = {
    briefcase: Briefcase,
    businessCenter: BriefcaseBusiness,
    chevronLeft: ChevronLeft,
    chevronRight: ChevronRight,
    connect: Handshake,
    delete: Trash2,
    edit: Edit,
    email: Mail,
    externalLink: ExternalLink,
    eye: Eye,
    language: Globe,
    lightbulb: Lightbulb,
    link: Link,
    location: MapPin,
    package: Package,
    phone: Phone,
    plus: Plus,
    shoppingBag: ShoppingBag,
    target: Target,
    users: Users,
    x: X
  };

  openLightbox(images: IImage[], index: number): void {
    this.lightboxImages.set(images);
    this.lightboxIndex.set(index);
    this.lightboxOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
    document.body.style.overflow = '';
  }

  nextLightboxImage(): void {
    const current = this.lightboxIndex();
    const total = this.lightboxImages().length;
    this.lightboxIndex.set((current + 1) % total);
  }

  previousLightboxImage(): void {
    const current = this.lightboxIndex();
    const total = this.lightboxImages().length;
    this.lightboxIndex.set((current - 1 + total) % total);
  }

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.venturesStore.loadVentureBySlug(slug);
    }
  }

  editVenture() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.router.navigate(['/dashboard/user/ventures/edit', slug]);
    }
  }

  goBack() {
    this.router.navigate(['/dashboard/user/ventures']);
  }

  deleteProduct(id: string, name: string) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) {
      this.productsStore.deleteProduct(id);
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
