import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthCard } from '../../components/auth-card/auth-card';
import { SignUpStore } from '../../store/sign-up.store';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-angular';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '@shared/ui';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.html',
  providers: [SignUpStore],
  imports: [
    ButtonComponent,
    RouterLink,
    ReactiveFormsModule,
    AuthCard,
    CommonModule,
    LucideAngularModule,
    TranslateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignUp {
  #formBuilder: FormBuilder = inject(FormBuilder);
  #route = inject(ActivatedRoute);
  form: FormGroup;
  store = inject(SignUpStore);
  ref = this.#route.snapshot.queryParams['ref'] || null;
  showPassword = signal(false);
  showPasswordConfirm = signal(false);

  icons = {
    mail: Mail,
    lock: Lock,
    arrowRight: ArrowRight,
    eye: Eye,
    eyeOff: EyeOff
  };

  constructor() {
    this.form = this.#formBuilder.group(
      {
        email: ['', [Validators.email, Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        password_confirm: ['', [Validators.required, Validators.minLength(6)]]
      },
      {
        validators: this.passwordMatchValidator
      }
    );
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const passwordConfirm = control.get('password_confirm');

    if (!password || !passwordConfirm) {
      return null;
    }

    if (!passwordConfirm.touched) {
      return null;
    }

    if (password.value !== passwordConfirm.value) {
      passwordConfirm.setErrors({ ...passwordConfirm.errors, passwordMismatch: true });
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

  onSignUp(): void {
    if (this.form.invalid) return;

    const { email, password } = this.form.getRawValue();

    this.store.signUp({
      email,
      password,
      referral_code: this.ref
    });
  }

  togglePasswordVisibility(field: 'password' | 'passwordConfirm'): void {
    if (field === 'password') {
      this.showPassword.update((value) => !value);
      return;
    }

    this.showPasswordConfirm.update((value) => !value);
  }
}
