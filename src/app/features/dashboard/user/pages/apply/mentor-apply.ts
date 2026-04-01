import { Component, inject, OnInit, signal, ChangeDetectionStrategy, effect } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthStore } from '@core/auth/auth.store';
import { MentorApplicationState } from '@core/auth/mentor-application.state';
import { MentorProfileStore } from '@features/dashboard/shared/store/mentor-profile.store';
import { FormManager } from '@shared/components/form-manager/form-manager';
import { CreateExperienceDto } from '@shared/models';
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  GraduationCap,
  Info,
  LucideAngularModule,
  Plus,
  SearchCheck,
  Send,
  Star,
  User,
  X
} from 'lucide-angular';

@Component({
  selector: 'app-mentor-apply',
  imports: [ReactiveFormsModule, RouterModule, FormManager, LucideAngularModule],
  templateUrl: './mentor-apply.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MentorApply implements OnInit {
  authStore = inject(AuthStore);
  mentorApplyState = inject(MentorApplicationState);
  readonly mentorProfileStore = inject(MentorProfileStore);
  fb = inject(FormBuilder);
  router = inject(Router);

  currentStep = signal(1);
  maxSteps = 3;

  readonly icons = {
    add: Plus,
    arrowBack: ArrowLeft,
    business: Building,
    calendar: CalendarDays,
    chevronLeft: ChevronLeft,
    chevronRight: ChevronRight,
    close: X,
    error: CircleAlert,
    event: Calendar,
    info: Info,
    manageSearch: SearchCheck,
    person: User,
    schedule: Clock3,
    school: GraduationCap,
    send: Send,
    star: Star,
    work: BriefcaseBusiness
  };

  applicationForm = this.fb.group({
    years_experience: [0, [Validators.required, Validators.min(0)]],
    expertises: [[] as string[], Validators.required],
    experiences: this.fb.array([])
  });

  availableExpertises = this.mentorProfileStore.expertises;

  readonly mentorApply = this.mentorApplyState;

  constructor() {
    effect(() => {
      if (this.mentorApplyState.shouldRedirectToMentorDashboard()) {
        this.router.navigate(['/dashboard/mentor']);
      }
    });

    effect(() => {
      const readonly = this.mentorApplyState.isFormReadonly();
      if (readonly) {
        this.applicationForm.disable({ emitEvent: false });
      } else {
        this.applicationForm.enable({ emitEvent: false });
      }
    });
  }

  ngOnInit() {
    this.mentorProfileStore.loadExpertises();

    if (this.experiences.length === 0) {
      this.addExperience();
    }
  }

  get experiences(): FormArray {
    return this.applicationForm.get('experiences') as FormArray;
  }

  createExperienceFormGroup() {
    const group = this.fb.group({
      company_name: ['', Validators.required],
      job_title: ['', Validators.required],
      is_current: [false],
      start_date: [null as string | null, Validators.required],
      end_date: [null as string | null]
    });

    group.get('is_current')?.valueChanges.subscribe((isCurrent) => {
      const endDateControl = group.get('end_date');
      if (isCurrent) {
        endDateControl?.disable();
        endDateControl?.setValue(null);
      } else {
        endDateControl?.enable();
      }
    });

    return group;
  }

  addExperience() {
    if (this.mentorApplyState.isFormReadonly()) return;
    this.experiences.push(this.createExperienceFormGroup());
  }

  removeExperience(index: number) {
    if (this.mentorApplyState.isFormReadonly()) return;
    if (this.experiences.length > 1) {
      this.experiences.removeAt(index);
    }
  }

  toggleExpertise(expertiseId: string) {
    if (this.mentorApplyState.isFormReadonly()) return;
    const currentExpertises = this.applicationForm.get('expertises')?.value || [];
    const index = currentExpertises.indexOf(expertiseId);

    if (index > -1) {
      currentExpertises.splice(index, 1);
    } else {
      currentExpertises.push(expertiseId);
    }

    this.applicationForm.patchValue({ expertises: currentExpertises });
  }

  isExpertiseSelected(expertiseId: string): boolean {
    const currentExpertises = this.applicationForm.get('expertises')?.value || [];
    return currentExpertises.includes(expertiseId);
  }

  nextStep() {
    if (this.mentorApplyState.isFormReadonly()) return;
    if (this.currentStep() < this.maxSteps) {
      if (this.currentStep() === 1 && !this.applicationForm.get('years_experience')?.valid) {
        return;
      }
      if (
        this.currentStep() === 2 &&
        (!this.applicationForm.get('expertises')?.valid || this.applicationForm.get('expertises')?.value?.length === 0)
      ) {
        return;
      }
      this.currentStep.set(this.currentStep() + 1);
    }
  }

  previousStep() {
    if (this.mentorApplyState.isFormReadonly()) return;
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  submitApplication() {
    if (!this.mentorApplyState.canSubmitApplication()) return;
    if (this.applicationForm.invalid) {
      Object.keys(this.applicationForm.controls).forEach((key) => {
        const control = this.applicationForm.get(key);
        if (control?.invalid) {
          console.warn(`  - ${key}:`, control.errors);
        }
      });
      return;
    }
    const formValue = this.applicationForm.getRawValue();

    interface ExperienceFormValue {
      company_name: string;
      job_title: string;
      is_current: boolean;
      start_date: string | null;
      end_date?: string | null;
    }

    const experiences: CreateExperienceDto[] = ((formValue.experiences as ExperienceFormValue[]) || [])
      .filter((exp) => exp.company_name && exp.job_title && exp.start_date) // Filtrer les expériences valides
      .map((exp: ExperienceFormValue) => {
        const experience: CreateExperienceDto = {
          company_name: exp.company_name.trim(),
          job_title: exp.job_title.trim(),
          is_current: exp.is_current || false,
          start_date: new Date(exp.start_date!).toISOString(),
          end_date: exp.is_current || !exp.end_date ? null : new Date(exp.end_date).toISOString()
        };
        return experience;
      });

    const payload = {
      years_experience: Number(formValue.years_experience) || 0,
      expertises: (formValue.expertises || []).filter((id) => id && id.trim()),
      experiences
    };

    this.mentorProfileStore.createProfile({
      data: payload,
      onSuccess: () => {
        this.authStore.getProfile();
        this.router.navigate(['/dashboard/user/mentor/application-pending']);
      }
    });
  }

  getProgressPercentage(): number {
    return (this.currentStep() / this.maxSteps) * 100;
  }
}
