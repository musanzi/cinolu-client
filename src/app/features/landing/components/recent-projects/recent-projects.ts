import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, MoveUpRight, ArrowRight } from 'lucide-angular';
import { RecentProjectsStore } from '../../../projects/store/recent-projects.store';
import { ProgramCardSkeletonComponent } from '../../../projects/components/project-card-skeleton/project-card-skeleton';
import { ProjectCard } from '../../../projects/components/project-card/project-card';
import { FadeInOnScrollDirective } from '../../../../shared/directives/animations-on-scroll.directive';
import { IProject } from '../../../../shared/models';
import { TranslateModule } from '@ngx-translate/core';
import { LandingSectionHeader } from '../landing-section-header/landing-section-header';
import { CardsCarousel } from '../cards-carousel/cards-carousel';

@Component({
  selector: 'app-recent-projects',
  providers: [RecentProjectsStore],
  imports: [
    ProjectCard,
    RouterModule,
    LucideAngularModule,
    ProgramCardSkeletonComponent,
    FadeInOnScrollDirective,
    TranslateModule,
    LandingSectionHeader,
    CardsCarousel
  ],
  templateUrl: './recent-projects.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentProjects {
  store = inject(RecentProjectsStore);
  icons = {
    moveUpRight: MoveUpRight,
    moveRight: ArrowRight
  };

  constructor() {
    this.store.loadProjects();
  }

  trackByProjectId(_index: number, project: IProject): string {
    return project.id;
  }
}
