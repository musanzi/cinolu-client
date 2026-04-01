import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ResourceCategory } from '@shared/models/entities.models';
import { LucideAngularModule, Upload, X } from 'lucide-angular';

export type ResourceFormMode = 'create' | 'update';

export interface ResourceFormValue {
  title: string;
  description: string;
  category: ResourceCategory;
  projectId?: string;
  phaseId?: string;
}

@Component({
  selector: 'app-resource-form',
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './resource-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResourceForm implements OnInit, OnChanges {
  @Input() mode: ResourceFormMode = 'create';
  @Input() contextProjectId?: string; // When set, the form is used in project context (no project selector)
  @Input() initialValue?: ResourceFormValue;
  @Input() isLoading = false;

  @Output() submitForm = new EventEmitter<{ value: ResourceFormValue; file?: File }>();
  @Output() cancelForm = new EventEmitter<void>();

  private _fb = inject(FormBuilder);

  form!: FormGroup;
  selectedFile = signal<File | null>(null);

  readonly icons = {
    close: X,
    upload: Upload
  };

  readonly categories: { value: ResourceCategory; label: string }[] = [
    { value: ResourceCategory.GUIDE, label: 'Guide' },
    { value: ResourceCategory.TEMPLATE, label: 'Template' },
    { value: ResourceCategory.LEGAL, label: 'Légal' },
    { value: ResourceCategory.PITCH, label: 'Pitch' },
    { value: ResourceCategory.FINANCIAL, label: 'Financier' },
    { value: ResourceCategory.REPORT, label: 'Rapport' },
    { value: ResourceCategory.OTHER, label: 'Autre' }
  ];

  ngOnInit(): void {
    const projectId = this.contextProjectId || this.initialValue?.projectId || '';

    this.form = this._fb.group({
      title: [this.initialValue?.title || '', [Validators.required, Validators.minLength(3)]],
      description: [this.initialValue?.description || '', [Validators.required, Validators.minLength(10)]],
      category: [this.initialValue?.category || ResourceCategory.OTHER, [Validators.required]],
      projectId: [projectId, [Validators.required]],
      phaseId: [this.initialValue?.phaseId || '']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.form) return;

    if (changes['initialValue']?.currentValue) {
      this.form.patchValue({
        title: this.initialValue?.title || '',
        description: this.initialValue?.description || '',
        category: this.initialValue?.category || ResourceCategory.OTHER,
        projectId: this.initialValue?.projectId || this.contextProjectId || '',
        phaseId: this.initialValue?.phaseId || ''
      });
    }

    if (changes['contextProjectId'] && this.contextProjectId) {
      this.form.get('projectId')?.setValue(this.contextProjectId);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile.set(input.files[0]);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.mode === 'create' && !this.selectedFile()) {
      alert('Veuillez sélectionner un fichier');
      return;
    }

    const value: ResourceFormValue = this.form.getRawValue();

    this.submitForm.emit({
      value,
      file: this.selectedFile() || undefined
    });
  }

  onCancel(): void {
    this.cancelForm.emit();
  }

  getFieldError(fieldName: string): string | null {
    const field = this.form.get(fieldName);
    if (!field || !field.touched || !field.errors) return null;

    if (field.errors['required']) return 'Ce champ est requis';
    if (field.errors['minlength']) {
      const min = field.errors['minlength'].requiredLength;
      return `Minimum ${min} caractères requis`;
    }
    return 'Champ invalide';
  }
}
