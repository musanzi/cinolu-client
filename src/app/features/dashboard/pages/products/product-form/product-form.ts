import { Component, effect, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { VenturesStore } from '../../../store/ventures.store';
import { IProduct, IImage } from '@shared/models/entities.models';
import { ProductsStore } from '@features/dashboard/store/products.store';
import { FileUpload } from '@shared/components/file-upload/file-upload';
import { ApiImgPipe } from '../../../../../shared/pipes/api-img.pipe';
import { ProductGalleryStore } from '@features/dashboard/store/product-gallery.store';
import { FormManager } from '@shared/components/form-manager/form-manager';
import { Image, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-product-form',
  providers: [ProductGalleryStore],
  imports: [ReactiveFormsModule, FileUpload, ApiImgPipe, NgOptimizedImage, FormManager, LucideAngularModule],
  templateUrl: './product-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductForm implements OnInit {
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  productsStore = inject(ProductsStore);
  venturesStore = inject(VenturesStore);

  isEditMode = signal(false);
  currentSlug: string | null = null;
  product = signal<IProduct | null>(null);
  galleryImages = signal<IImage[]>([]);
  galleryStore = inject(ProductGalleryStore);

  icons = {
    image: Image
  };

  form = this.fb.group({
    ventureId: ['', Validators.required],
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]]
  });

  constructor() {
    effect(() => {
      const product = this.productsStore.selectedProduct();
      if (product && this.isEditMode() && !this.productsStore.isLoading()) {
        this.product.set(product);
        this.form.patchValue(
          {
            ventureId: product.venture?.id || '',
            name: product.name || '',
            description: product.description || '',
            price: product.price || 0
          },
          { emitEvent: false }
        );

        if (product.gallery && product.gallery.length > 0) {
          this.galleryImages.set(product.gallery);
        }
      }
    });

    // Sync gallery images with the ProductGalleryStore
    effect(() => {
      const gallery = this.galleryStore.images();
      if (gallery) {
        this.galleryImages.set(gallery);
      }
    });
  }
  ngOnInit() {
    this.venturesStore.loadAllVentures();
    this.currentSlug = this.route.snapshot.paramMap.get('slug');
    if (this.currentSlug) {
      this.isEditMode.set(true);
      this.productsStore.loadProductBySlug(this.currentSlug);
      this.galleryStore.loadAll(this.currentSlug);
    }
  }
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = this.form.value;

    if (this.isEditMode() && this.currentSlug) {
      this.productsStore.updateProduct({
        slug: this.currentSlug,
        data: formData as Partial<IProduct>
      });
    } else {
      this.productsStore.createProduct(formData as Partial<IProduct> & { ventureId: string });
    }
  }

  handleGalleryLoaded(): void {
    if (this.currentSlug) {
      this.productsStore.loadProductBySlug(this.currentSlug);
      this.galleryStore.loadAll(this.currentSlug);
    }
  }

  getGalleryUploadUrl(): string {
    const productId = this.product()?.id;
    return productId ? `products/id/${productId}/gallery` : '';
  }

  removeGalleryImage(imageId: string | number): void {
    const id = String(imageId);
    this.galleryStore.delete(id);
  }

  cancel() {
    this.productsStore.resetSelection();
  }
}
