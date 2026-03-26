import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-landing-section-header',
  imports: [TranslateModule, NgClass],
  templateUrl: './landing-section-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingSectionHeader {
  badgeKey = input.required<string>();
  titleKey = input.required<string>();
  titleHighlightKey = input<string>();
  descriptionKey = input<string>();
  descriptionParams = input<Record<string, unknown>>();
  descriptionClass = input<string>();
}
