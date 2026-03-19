import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  signal,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ResourceCategory } from '@shared/models/entities.models';
import { X, Upload, LucideAngularModule } from 'lucide-angular';

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
export class ResourceForm implements OnInit {
  @Input() mode: 'create' | 'update' = 'create';
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
    this.form = this._fb.group({
      title: [this.initialValue?.title || '', [Validators.required, Validators.minLength(3)]],
      description: [this.initialValue?.description || '', [Validators.required, Validators.minLength(10)]],
      category: [this.initialValue?.category || ResourceCategory.OTHER, [Validators.required]],
      projectId: [this.initialValue?.projectId || ''],
      phaseId: [this.initialValue?.phaseId || '']
    });
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

    const value: ResourceFormValue = this.form.value;

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
