import { Component, inject, OnInit, signal, effect, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { AuthStore } from '@core/auth/auth.store';
import { MentorProfileStore } from '@features/dashboard/shared/store/mentor-profile.store';
import { CreateExperienceDto, IExpertise, IExperience, IMentorProfile } from '@shared/models';
import { ToastrService } from '@core/services/toast/toastr.service';
import {
  LucideAngularModule,
  LucideIconData,
  Badge,
  SquarePen,
  BriefcaseBusiness,
  Brain,
  CircleCheckBig,
  SearchCheck,
  BookOpenText,
  Plus,
  Trash2,
  FileText,
  Eye,
  RefreshCw,
  FileUp,
  X,
  Save,
  CircleAlert,
  BadgeCheck,
  Clock3,
  CircleX,
  Info
} from 'lucide-angular';

@Component({
  selector: 'app-mentor-profile',
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './mentor-profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MentorProfile implements OnInit {
  private fb = inject(FormBuilder);
  private toast = inject(ToastrService);

  authStore = inject(AuthStore);
  profileStore = inject(MentorProfileStore);

  isEditMode = signal(false);
  selectedExpertises = signal<string[]>([]);
  expertiseFilter = signal('');
  isExpertiseDropdownOpen = signal(false);

  readonly icons = {
    badge: Badge,
    edit: SquarePen,
    work: BriefcaseBusiness,
    psychology: Brain,
    checkCircle: CircleCheckBig,
    manageSearch: SearchCheck,
    historyEdu: BookOpenText,
    add: Plus,
    delete: Trash2,
    description: FileText,
    visibility: Eye,
    sync: RefreshCw,
    uploadFile: FileUp,
    close: X,
    save: Save,
    error: CircleAlert
  };

  selectedExpertiseObjects = computed(() => {
    const ids = this.selectedExpertises();
    return this.profileStore.expertises().filter((e) => ids.includes(e.id));
  });

  filteredExpertises = computed(() => {
    const term = this.normalizeSearch(this.expertiseFilter());
    if (!term) return this.profileStore.expertises();

    return this.profileStore.expertises().filter((expertise) => this.normalizeSearch(expertise.name).includes(term));
  });

  profileForm = this.fb.group({
    years_experience: [0, [Validators.required, Validators.min(0)]],
    expertises: [[] as string[]],
    experiences: this.fb.array([])
  });

  constructor() {
    this.profileStore.loadExpertises();

    effect(() => {
      const profile = this.profileStore.profile();
      if (profile && !this.isEditMode()) {
        this.populateForm(profile);
      }
    });

    effect(() => {
      const profile = this.profileStore.profile();
      if (!profile) return;

      if (!profile.cv && !this.isEditMode()) {
        this.enableEditMode();
        queueMicrotask(() => {
          const cvSection = document.getElementById('mentor-upload-cv-section');
          cvSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    });
  }

  ngOnInit(): void {
    this.authStore.getProfile();
    this.profileStore.loadProfileFromMe();
  }

  get experiencesArray(): FormArray {
    return this.profileForm.get('experiences') as FormArray;
  }

  populateForm(profile: IMentorProfile): void {
    const expertiseIds = profile.expertises?.map((exp: IExpertise) => exp.id) || [];
    this.selectedExpertises.set(expertiseIds);

    this.profileForm.patchValue(
      {
        years_experience: profile.years_experience || 0,
        expertises: expertiseIds
      },
      { emitEvent: false }
    );

    this.experiencesArray.clear();
    if (profile.experiences && profile.experiences.length > 0) {
      profile.experiences.forEach((exp: IExperience) => {
        this.experiencesArray.push(this.createExperienceFormGroup(exp));
      });
    }
  }

  createExperienceFormGroup(experience?: Partial<IExperience>) {
    const isCurrent = experience?.is_current || false;
    const startDate = this.formatDateForInput(experience?.start_date);
    const endDate = isCurrent ? null : this.formatDateForInput(experience?.end_date) || null;

    const group = this.fb.group({
      id: [experience?.id || null],
      company_name: [experience?.company_name || '', Validators.required],
      job_title: [experience?.job_title || '', Validators.required],
      start_date: [startDate, Validators.required],
      end_date: [
        {
          value: endDate,
          disabled: isCurrent
        }
      ],
      is_current: [isCurrent]
    });
    return group;
  }

  private formatDateForInput(dateValue?: Date | string | null): string {
    if (!dateValue) return '';

    if (typeof dateValue === 'string') {
      const yyyyMmDd = dateValue.match(/^\d{4}-\d{2}-\d{2}/);
      if (yyyyMmDd) return yyyyMmDd[0];
    }

    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) return '';

    return parsedDate.toISOString().split('T')[0];
  }

  addExperience(): void {
    this.experiencesArray.push(this.createExperienceFormGroup());
  }

  removeExperience(index: number): void {
    this.experiencesArray.removeAt(index);
  }

  toggleExpertise(expertiseId: string): void {
    const current = this.selectedExpertises();
    if (current.includes(expertiseId)) {
      this.selectedExpertises.set(current.filter((id) => id !== expertiseId));
    } else {
      this.selectedExpertises.set([...current, expertiseId]);
    }
    this.profileForm.patchValue({ expertises: this.selectedExpertises() });
  }

  isExpertiseSelected(expertiseId: string): boolean {
    return this.selectedExpertises().includes(expertiseId);
  }

  onExpertisesChange(event: Event): void {
    const values = Array.from((event.target as HTMLSelectElement).selectedOptions).map((option) => option.value);
    this.selectedExpertises.set(values);
    this.profileForm.patchValue({ expertises: values });
  }

  toggleCurrentPosition(index: number): void {
    const experienceGroup = this.experiencesArray.at(index);
    const endDateControl = experienceGroup.get('end_date');
    const isCurrent = experienceGroup.get('is_current')?.value;

    if (isCurrent) {
      // Si c'est le poste actuel, effacer la date de fin et désactiver le champ
      experienceGroup.patchValue({ end_date: null });
      endDateControl?.disable();
    } else {
      // Si ce n'est plus le poste actuel, réactiver le champ
      endDateControl?.enable();
    }
  }

  updateExpertiseFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value || '';
    this.expertiseFilter.set(value);
  }

  toggleExpertiseDropdown(): void {
    this.isExpertiseDropdownOpen.update((isOpen) => !isOpen);
  }

  closeExpertiseDropdown(): void {
    this.isExpertiseDropdownOpen.set(false);
  }

  clearExpertiseFilter(): void {
    this.expertiseFilter.set('');
  }

  private normalizeSearch(value: string): string {
    return value
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  enableEditMode(): void {
    this.isEditMode.set(true);
    this.experiencesArray.controls.forEach((control) => {
      const isCurrent = control.get('is_current')?.value;
      const endDateControl = control.get('end_date');
      if (isCurrent) {
        endDateControl?.disable();
      } else {
        endDateControl?.enable();
      }
    });
  }

  cancelEdit(): void {
    this.isEditMode.set(false);
    const profile = this.profileStore.profile();
    if (profile) {
      this.populateForm(profile);
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.toast.showError('Veuillez remplir tous les champs requis');
      return;
    }

    const user = this.authStore.user();
    const profileId = user?.mentor_profile?.id;

    if (!profileId) {
      this.toast.showError('Profil mentor non trouvé');
      return;
    }

    const formValue = this.profileForm.getRawValue();
    const experiences: CreateExperienceDto[] = (
      (formValue.experiences || []) as {
        id?: string;
        company_name: string;
        job_title: string;
        start_date: string;
        end_date?: string | null;
        is_current: boolean;
      }[]
    ).map((exp) => ({
      ...(exp.id ? { id: exp.id } : {}),
      company_name: exp.company_name,
      job_title: exp.job_title,
      start_date: exp.start_date,
      end_date: exp.is_current ? null : exp.end_date || null,
      is_current: exp.is_current
    }));

    const updateDto = {
      years_experience: formValue.years_experience || 0,
      expertises: formValue.expertises || [],
      experiences: experiences
    };

    this.profileStore.updateProfile({
      id: profileId,
      dto: updateDto
    });
    setTimeout(() => {
      this.profileStore.loadProfileFromMe();
      this.isEditMode.set(false);
    }, 500);
  }

  handleCVUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const user = this.authStore.user();
    const profileId = user?.mentor_profile?.id;

    if (!profileId) {
      this.toast.showError('Profil mentor non trouvé');
      return;
    }

    if (file.type !== 'application/pdf') {
      this.toast.showError('Seuls les fichiers PDF sont acceptés');
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      this.toast.showError('Le fichier ne doit pas dépasser 1 MB');
      return;
    }

    this.profileStore.uploadCV({ id: profileId, file });

    // Recharger le profil après l'upload
    setTimeout(() => {
      this.profileStore.loadProfileFromMe();
    }, 1000);
  }

  getStatusBadgeClass(): string {
    const profile = this.profileStore.profile();
    if (!profile) return '';

    switch (profile.status) {
      case 'approved':
        return 'dashboard-badge-success';
      case 'pending':
        return 'dashboard-badge-warning';
      case 'rejected':
        return 'dashboard-badge-danger';
      default:
        return 'dashboard-badge-neutral';
    }
  }

  getStatusLabel(): string {
    const profile = this.profileStore.profile();
    if (!profile) return '';

    switch (profile.status) {
      case 'approved':
        return 'Approuvé';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Rejeté';
      default:
        return '';
    }
  }

  getStatusIcon(): LucideIconData {
    const profile = this.profileStore.profile();
    if (!profile) return Info;

    switch (profile.status) {
      case 'approved':
        return BadgeCheck;
      case 'pending':
        return Clock3;
      case 'rejected':
        return CircleX;
      default:
        return Info;
    }
  }
}
