import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiImgPipe } from '@shared/pipes/api-img.pipe';
import { MentorshipStore } from '@features/dashboard/shared/store/mentorship.store';
import {
  CalendarDays,
  CircleCheckBig,
  Clock3,
  FolderOpen,
  GraduationCap,
  LucideAngularModule,
  Users
} from 'lucide-angular';

@Component({
  selector: 'app-mentored-projects',
  imports: [RouterLink, ApiImgPipe, CommonModule, LucideAngularModule],
  templateUrl: './mentored-projects.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MentoredProjects implements OnInit {
  mentorshipStore = inject(MentorshipStore);

  readonly icons = {
    calendar: CalendarDays,
    checkCircle: CircleCheckBig,
    folder: FolderOpen,
    group: Users,
    schedule: Clock3,
    school: GraduationCap
  };

  ngOnInit(): void {
    this.mentorshipStore.loadMentoredProjects();
  }

  getProjectStatus(project: { started_at: Date; ended_at: Date }): 'active' | 'future' | 'past' {
    const now = new Date();
    const start = new Date(project.started_at);
    const end = new Date(project.ended_at);
    if (start > now) return 'future';
    if (end < now) return 'past';
    return 'active';
  }
}
