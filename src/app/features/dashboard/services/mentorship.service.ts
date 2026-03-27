import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  IParticipation,
  IProject,
  IProjectParticipationReview,
  ParticipationReviewStatus
} from '@shared/models/entities.models';

export interface MentorParticipationsFilter {
  page?: number;
  q?: string;
  phaseId?: string;
  status?: ParticipationReviewStatus;
}

export interface CreateParticipationReviewPayload {
  phaseId: string;
  score: number;
  message?: string;
  notifyParticipant?: boolean;
}

export interface UpdateParticipationReviewPayload {
  reviewId: string;
  score: number;
  message?: string;
  notifyParticipant?: boolean;
}

export type ParticipationReviewPayload = CreateParticipationReviewPayload | UpdateParticipationReviewPayload;

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
    if (filter.status) params = params.set('status', filter.status);

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

  submitParticipationReview(
    participationId: string,
    payload: ParticipationReviewPayload
  ): Observable<IProjectParticipationReview> {
    if ('reviewId' in payload && payload.reviewId) {
      const { reviewId, ...body } = payload;
      return this._http
        .patch<{ data: IProjectParticipationReview }>(`projects/participations/${participationId}/review/${reviewId}`, body)
        .pipe(map((res) => res.data));
    }

    return this._http
      .post<{ data: IProjectParticipationReview }>(`projects/participations/${participationId}/review`, payload)
      .pipe(map((res) => res.data));
  }
}
