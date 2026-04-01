import { Component, inject, signal, ChangeDetectionStrategy, effect, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthStore } from '@core/auth/auth.store';
import { IUser, UserStatus } from '@shared/models/entities.models';
import { UpdateInfoStore } from '@features/dashboard/shared/store/update-info.store';
import { UpdateInfoDto } from '@features/dashboard/shared/dto/update-info.dto';
import { FileUpload } from '@shared/components/file-upload/file-upload';
import { ApiImgPipe } from '@shared/pipes';
import { FormManager } from '@shared/components/form-manager/form-manager';
import { SelectComponent, type UiSelectOption } from '@shared/ui';
import {
  Badge,
  BadgeCheck,
  Building2,
  Cake,
  CheckCircle,
  CircleX,
  Clock3,
  FileText,
  Globe,
  GraduationCap,
  Info,
  LayoutDashboard,
  LucideAngularModule,
  Mail,
  Network,
  Phone,
  Rocket,
  Save,
  SquarePen,
  Star,
  User,
  Users,
  VenusAndMars,
  X
} from 'lucide-angular';

@Component({
  selector: 'app-profile',
  imports: [
    ReactiveFormsModule,
    RouterModule,
    FileUpload,
    ApiImgPipe,
    FormManager,
    LucideAngularModule,
    SelectComponent
  ],
  providers: [UpdateInfoStore],
  templateUrl: './profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilePage {
  authStore = inject(AuthStore);
  updateInfoStore = inject(UpdateInfoStore);
  fb = inject(FormBuilder);
  router = inject(Router);

  icons = {
    badge: Badge,
    birthDate: Cake,
    cancel: CircleX,
    checkCircle: CheckCircle,
    city: Building2,
    close: X,
    country: Globe,
    dashboard: LayoutDashboard,
    description: FileText,
    edit: SquarePen,
    email: Mail,
    gender: VenusAndMars,
    info: Info,
    network: Network,
    phone: Phone,
    profile: User,
    rocketLaunch: Rocket,
    save: Save,
    schedule: Clock3,
    school: GraduationCap,
    star: Star,
    users: Users,
    verified: BadgeCheck
  };

  isEditing = signal(false);
  isEditingInterests = signal(false);

  user = computed(() => this.authStore.user());
  hasMentorProfile = computed(() => !!this.user()?.mentor_profile);
  mentorStatus = computed(() => this.user()?.mentor_profile?.status || null);
  statusOptions: UiSelectOption[] = [
    { label: 'Entrepreneur', value: UserStatus.ENTREPRENEUR },
    { label: 'Investor', value: UserStatus.INVESTOR },
    { label: 'Partner', value: UserStatus.PARTNER },
    { label: 'Other', value: UserStatus.OTHER }
  ];

  profileForm = this.fb.group({
    name: ['', Validators.required],
    biography: [''],
    status: [null as UserStatus | null],
    phone_number: [''],
    city: [''],
    country: [''],
    gender: [''],
    birth_date: [null as Date | null]
  });

  constructor() {
    effect(() => {
      const user = this.user();
      if (user) {
        if (!this.isEditing()) {
          this.profileForm.patchValue(
            {
              name: user.name,
              biography: user.biography || '',
              status: user.status ?? null,
              phone_number: user.phone_number || '',
              city: user.city || '',
              country: user.country || '',
              gender: user.gender || '',
              birth_date: user.birth_date ? new Date(user.birth_date) : null
            },
            { emitEvent: false }
          );
          this.profileForm.disable();
        }
      }
    });
  }

  toggleEdit() {
    this.isEditing.update((v) => !v);
    if (this.isEditing()) {
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
    }
  }

  getUploadUrl(): string {
    return 'users/me/profile-image';
  }

  handleLoaded(): void {
    this.authStore.getProfile();
  }

  saveProfile() {
    if (this.profileForm.invalid || !this.user()) return;

    const user = this.user()!;
    const formValue = this.profileForm.getRawValue();

    const payload: UpdateInfoDto = {
      email: user.email ?? '',
      address: (user as IUser & { address?: string }).address ?? '',
      phone_number: formValue.phone_number ?? '',
      gender: formValue.gender ?? '',
      name: formValue.name ?? user.name ?? '',
      birth_date: formValue.birth_date ? new Date(formValue.birth_date) : (user.birth_date ?? new Date()),
      country: formValue.country ?? '',
      city: formValue.city ?? '',
      biography: formValue.biography ?? '',
      status: formValue.status ?? null
    };

    this.updateInfoStore.updateInfo(payload);

    this.isEditing.set(false);
    this.profileForm.disable();
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.profileForm.disable();

    const user = this.user();
    if (user) {
      this.profileForm.patchValue({
        name: user.name,
        biography: user.biography || '',
        status: user.status ?? null,
        phone_number: user.phone_number || '',
        city: user.city || '',
        country: user.country || '',
        gender: user.gender || '',
        birth_date: user.birth_date ? new Date(user.birth_date) : null
      });
    }
  }

  applyAsMentor() {
    this.router.navigate(['/dashboard/user/mentor/apply']);
  }

  goToMentorDashboard() {
    this.router.navigate(['/dashboard/mentor']);
  }
}
