import { Component, effect, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VenturesStore } from '@features/dashboard/shared/store/ventures.store';
import { IVenture, IImage } from '@shared/models/entities.models';
import { FileUpload } from '@shared/components/file-upload/file-upload';
import { ApiImgPipe } from '@shared/pipes/api-img.pipe';
import { VentureGalleryStore } from '@features/dashboard/shared/store/venture-gallery.store';
import { FormManager, StepConfig } from '@shared/components/form-manager/form-manager';
import { BriefcaseBusiness, CircleAlert, Info, LucideAngularModule, SquarePen, X } from 'lucide-angular';

@Component({
  selector: 'app-venture-form',
  providers: [VentureGalleryStore],
  imports: [ReactiveFormsModule, FileUpload, ApiImgPipe, NgOptimizedImage, FormManager, LucideAngularModule],
  templateUrl: './venture-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VentureForm implements OnInit {
  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  venturesStore = inject(VenturesStore);

  isEditMode = signal(false);
  currentSlug: string | null = null;
  venture = signal<IVenture | null>(null);
  coverPreview = signal<string | null>(null);
  galleryImages = signal<IImage[]>([]);
  galleryStore = inject(VentureGalleryStore);
  showCoverUpload = signal(true);
  showLogoUpload = signal(true);

  readonly icons = {
    addBusiness: BriefcaseBusiness,
    close: X,
    edit: SquarePen,
    error: CircleAlert,
    info: Info
  };

  sectors = [
    'Agriculture',
    'Technologie',
    'Santé',
    'Éducation',
    'Finance',
    'Commerce',
    'Services',
    'Industrie',
    'Autre'
  ];

  stages = ['Idée', 'Prototype', 'MVP', 'Croissance', 'Expansion', 'Maturité'];

  // Configuration stepper : 3 étapes logiques pour 12 champs
  stepConfig: StepConfig[] = [
    { label: 'Informations essentielles', controls: ['name', 'description', 'email', 'phone_number'] },
    {
      label: 'Profil & Marché',
      controls: ['sector', 'stage', 'location', 'founded_at', 'target_market', 'problem_solved']
    },
    { label: 'Présence en ligne', controls: ['website', 'linkedin_url'] }
  ];

  form = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    problem_solved: ['', Validators.required],
    target_market: ['', Validators.required],
    email: ['', Validators.email],
    phone_number: [''],
    website: [''],
    linkedin_url: [''],
    sector: [''],
    founded_at: [''],
    location: [''],
    stage: ['']
  });

  constructor() {
    effect(() => {
      const selectedVenture = this.venturesStore.selectedVenture();
      if (selectedVenture && this.isEditMode()) {
        this.venture.set(selectedVenture);
        this.form.patchValue(
          {
            name: selectedVenture.name || '',
            description: selectedVenture.description || '',
            problem_solved: selectedVenture.problem_solved || '',
            target_market: selectedVenture.target_market || '',
            email: selectedVenture.email || '',
            phone_number: selectedVenture.phone_number || '',
            website: selectedVenture.website || '',
            linkedin_url: selectedVenture.linkedin_url || '',
            sector: selectedVenture.sector || '',
            founded_at: selectedVenture.founded_at
              ? new Date(selectedVenture.founded_at).toISOString().split('T')[0]
              : '',
            location: selectedVenture.location || '',
            stage: selectedVenture.stage || ''
          },
          { emitEvent: false }
        );

        if (selectedVenture.cover) {
          this.coverPreview.set(selectedVenture.cover);
          this.showCoverUpload.set(false);
        } else {
          this.coverPreview.set(null);
          this.showCoverUpload.set(true);
        }

        if (selectedVenture.logo) {
          this.showLogoUpload.set(false);
        } else {
          this.showLogoUpload.set(true);
        }

        if (selectedVenture.gallery && selectedVenture.gallery.length > 0) {
          this.galleryImages.set(selectedVenture.gallery);
        }
      }
    });

    effect(() => {
      const gallery = this.galleryStore.images();
      if (gallery) {
        this.galleryImages.set(gallery);
      }
    });
  }

  ngOnInit() {
    this.currentSlug = this.route.snapshot.paramMap.get('slug');
    if (this.currentSlug) {
      this.isEditMode.set(true);
      this.venturesStore.loadVentureBySlug(this.currentSlug);
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
      this.venturesStore.updateVenture({
        slug: this.currentSlug,
        data: formData as Partial<IVenture>,
        onSuccess: () => this.router.navigate(['/dashboard/user/ventures'])
      });
    } else {
      this.venturesStore.createVenture({
        data: formData as Partial<IVenture>
      });
    }
  }

  handleLogoLoaded(): void {
    if (this.currentSlug) {
      this.venturesStore.loadVentureBySlug(this.currentSlug);
      setTimeout(() => {
        const updatedVenture = this.venturesStore.selectedVenture();
        if (updatedVenture?.logo) {
          this.showLogoUpload.set(false);
        }
      }, 1000);
    }
  }

  handleCoverLoaded(): void {
    if (this.currentSlug) {
      this.venturesStore.loadVentureBySlug(this.currentSlug);
      setTimeout(() => {
        const updatedVenture = this.venturesStore.selectedVenture();
        if (updatedVenture?.cover) {
          this.showCoverUpload.set(false);
          this.coverPreview.set(updatedVenture.cover);
        }
      }, 1000);
    }
  }

  handleGalleryLoaded(): void {
    if (this.currentSlug) {
      this.venturesStore.loadVentureBySlug(this.currentSlug);
      setTimeout(() => {
        this.galleryStore.loadAll(this.currentSlug!);
      }, 500);
    }
  }

  getCoverUploadUrl(): string {
    const ventureId = this.venture()?.id;
    if (!ventureId) {
      return '';
    }
    return `ventures/id/${ventureId}/cover/`;
  }

  getLogoUploadUrl(): string {
    const ventureId = this.venture()?.id;
    if (!ventureId) {
      return '';
    }
    return `ventures/id/${ventureId}/logo/`;
  }

  getGalleryUploadUrl(): string {
    const ventureId = this.venture()?.id;
    if (!ventureId) {
      return '';
    }
    const url = `ventures/id/${ventureId}/gallery`;
    return url;
  }

  removeGalleryImage(imageId: string | number): void {
    const id = String(imageId);
    this.galleryStore.delete(id);
  }

  cancel() {
    this.router.navigate(['/dashboard/user/ventures']);
  }
}
