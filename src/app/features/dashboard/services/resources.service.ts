import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IResource, ResourcesFilter, CreateResourceDto, UpdateResourceDto } from '@shared/models/entities.models';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResourcesService {
  private _http = inject(HttpClient);

  getResourcesByProject(projectId: string, filter: ResourcesFilter = {}): Observable<[IResource[], number]> {
    let params = new HttpParams();
    if (filter.page) params = params.set('page', String(filter.page));
    if (filter.limit) params = params.set('limit', String(filter.limit));
    if (filter.category) params = params.set('category', filter.category);

    return this._http
      .get<{ data: [IResource[], number] }>(`resources/project/${projectId}`, { params })
      .pipe(map((res) => res.data));
  }

  getResourcesByPhase(phaseId: string, filter: ResourcesFilter = {}): Observable<[IResource[], number]> {
    let params = new HttpParams();
    if (filter.page) params = params.set('page', String(filter.page));
    if (filter.limit) params = params.set('limit', String(filter.limit));
    if (filter.category) params = params.set('category', filter.category);

    return this._http
      .get<{ data: [IResource[], number] }>(`resources/phase/${phaseId}`, { params })
      .pipe(map((res) => res.data));
  }

  createResource(dto: CreateResourceDto, file: File): Observable<IResource> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', dto.title);
    formData.append('description', dto.description);
    formData.append('category', dto.category);
    if (dto.projectId) formData.append('project_id', dto.projectId);
    if (dto.phaseId) formData.append('phase_id', dto.phaseId);

    return this._http.post<{ data: IResource }>('resources', formData).pipe(map((res) => res.data));
  }

  updateResource(id: string, dto: UpdateResourceDto): Observable<IResource> {
    return this._http.patch<{ data: IResource }>(`resources/${id}`, dto).pipe(map((res) => res.data));
  }

  updateResourceFile(id: string, file: File): Observable<IResource> {
    const formData = new FormData();
    formData.append('file', file);

    return this._http.patch<{ data: IResource }>(`resources/file/${id}`, formData).pipe(map((res) => res.data));
  }

  deleteResource(id: string): Observable<void> {
    return this._http.delete<void>(`resources/${id}`);
  }

  getResourceFileUrl(resource: IResource): string {
    return `${environment.apiUrl}${resource.file}`;
  }

  getFileExtension(resource: IResource): string {
    const parts = resource.file.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE';
  }

  isPreviewable(resource: IResource): boolean {
    const ext = this.getFileExtension(resource).toLowerCase();
    return ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext);
  }
}
