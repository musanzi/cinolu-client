import { afterNextRender, Component, ChangeDetectionStrategy, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BookOpen, GraduationCap, LucideAngularModule, MoveRight, Users } from 'lucide-angular';
import { LandingSectionHeader } from '../landing-section-header/landing-section-header';

@Component({
  selector: 'app-onestop',
  imports: [RouterLink, LucideAngularModule, TranslateModule, LandingSectionHeader],
  templateUrl: './onestop.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Onestop {
  private readonly platformId = inject(PLATFORM_ID);

  readonly ready = signal(false);
  categoryKeys = ['formation', 'financement', 'mentorat', 'incubation', 'acceleration'];
  icons = {
    moveRight: MoveRight,
    users: Users,
    bookOpen: BookOpen,
    graduationCap: GraduationCap
  };

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      this.ready.set(true);
      return;
    }
    afterNextRender(() => {
      setTimeout(() => this.ready.set(true), 800);
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByCategoryKey(index: number, key: string): string {
    return key;
  }
}
