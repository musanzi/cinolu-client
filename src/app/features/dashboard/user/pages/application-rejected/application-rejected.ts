import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  CircleCheckBig,
  CircleX,
  Clock3,
  FileText,
  Heart,
  Info,
  LayoutDashboard,
  Lightbulb,
  LucideAngularModule,
  StarOff,
  User
} from 'lucide-angular';

@Component({
  selector: 'app-mentor-application-rejected',
  imports: [RouterModule, LucideAngularModule],
  templateUrl: './application-rejected.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MentorApplicationRejected {
  readonly icons = {
    cancel: CircleX,
    checkCircle: CircleCheckBig,
    dashboard: LayoutDashboard,
    description: FileText,
    favorite: Heart,
    info: Info,
    lightbulb: Lightbulb,
    person: User,
    schedule: Clock3,
    starBorder: StarOff
  };
}
