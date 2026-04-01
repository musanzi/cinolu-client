import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Rocket, Share2, Award } from 'lucide-angular';

@Component({
  selector: 'app-referral-cta-card',

  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './referral-cta-card.html'
})
export class ReferralCtaCard {
  readonly icons = {
    rocket: Rocket,
    share: Share2,
    award: Award
  };
}
