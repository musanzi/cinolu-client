import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IParticipation, IProject } from '@shared/models/entities.models';

export interface MentorParticipationsFilter {
  page?: number;
  q?: string;
  phaseId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MentorshipService {
  private _http = inject(HttpClient);

  getMentoredProjects(): Observable<IProject[]> {
    return this._http.get<{ data: IProject[] }>('projects/me/mentored-projects').pipe(map((res) => res.data));
  }

  getMentoredProject(projectSlug: string): Observable<IProject> {
    return this._http.get<{ data: IProject }>(`projects/by-slug/${projectSlug}`).pipe(map((res) => res.data));
  }

  getMentoredProjectParticipations(
    projectId: string,
    filter: MentorParticipationsFilter = {}
  ): Observable<[IParticipation[], number]> {
    let params = new HttpParams();
    if (filter.page) params = params.set('page', String(filter.page));
    if (filter.q) params = params.set('q', filter.q);
    if (filter.phaseId) params = params.set('phaseId', filter.phaseId);

    return this._http
      .get<{
        data: [IParticipation[], number];
      }>(`projects/id/${projectId}/participations`, { params })
      .pipe(map((res) => res.data));

    // projects/id/:projectId/participations
  }

  getMentoredProjectParticipation(participationId: string): Observable<IParticipation> {
    return this._http
      .get<{ data: IParticipation }>(`projects/participations/${participationId}`)
      .pipe(map((res) => res.data));
  }
}
