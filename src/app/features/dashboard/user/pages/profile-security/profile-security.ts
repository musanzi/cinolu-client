import { Component, inject, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import {
  ArrowRight,
  Check,
  CircleAlert,
  CircleCheckBig,
  Eye,
  EyeOff,
  LockKeyhole,
  LucideAngularModule,
  RefreshCw,
  RotateCcwKey,
  Shield,
  Sparkles
} from 'lucide-angular';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { UpdatePasswordStore } from '@features/dashboard/shared/store/update-password.store';

@Component({
  selector: 'app-profile-security',

  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './profile-security.html',
  providers: [UpdatePasswordStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileSecurity {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  store = inject(UpdatePasswordStore);

  readonly icons = {
    arrowRight: ArrowRight,
    check: Check,
    checkCircle: CircleCheckBig,
    error: CircleAlert,
    lock: LockKeyhole,
    lockReset: RotateCcwKey,
    refresh: RefreshCw,
    security: Shield,
    sparkles: Sparkles,
    visibility: Eye,
    visibilityOff: EyeOff
  };

  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  form: FormGroup;

  constructor() {
    this.form = this.formBuilder.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        newPasswordConfirm: ['', [Validators.required, Validators.minLength(6)]]
      },
      {
        validators: this.passwordMatchValidator
      }
    );

    effect(() => {
      if (this.store.success()) {
        this.form.reset();
        this.showCurrentPassword.set(false);
        this.showNewPassword.set(false);
        this.showConfirmPassword.set(false);
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword');
    const passwordConfirm = control.get('newPasswordConfirm');

    if (!password || !passwordConfirm) {
      return null;
    }

    if (!password.value || !passwordConfirm.value) {
      return null;
    }

    if (password.value !== passwordConfirm.value) {
      if (passwordConfirm.touched) {
        passwordConfirm.setErrors({ ...passwordConfirm.errors, passwordMismatch: true });
      }
      return { passwordMismatch: true };
    } else {
      if (passwordConfirm.hasError('passwordMismatch')) {
        const errors = { ...passwordConfirm.errors };
        delete errors['passwordMismatch'];
        passwordConfirm.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
    }

    return null;
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current') {
      this.showCurrentPassword.update((v) => !v);
    } else if (field === 'new') {
      this.showNewPassword.update((v) => !v);
    } else {
      this.showConfirmPassword.update((v) => !v);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const { newPassword, newPasswordConfirm } = this.form.value;
    this.store.updatePassword({
      password: newPassword,
      password_confirm: newPasswordConfirm
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/profile']);
  }
}
