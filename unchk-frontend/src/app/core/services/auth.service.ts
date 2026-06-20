import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, motDePasse: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, motDePasse }).pipe(
      tap(res => {
        localStorage.setItem('unchk_token', res.token);
        localStorage.setItem('unchk_user', JSON.stringify(res));
        this.currentUserSubject.next(res);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('unchk_token');
    localStorage.removeItem('unchk_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('unchk_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRole(): string {
    return this.currentUserSubject.value?.role || '';
  }

  /** Rôle normalisé en minuscules. */
  private roleNorm(): string {
    return (this.currentUserSubject.value?.role || '').toLowerCase().trim();
  }

  /**
   * Contrôle d'accès fin par rôle.
   * @param resource ex: 'etudiants', 'budgets', 'partenaires', 'documents'...
   * @param action 'read' | 'write'
   */
  can(resource: string, action: 'read' | 'write' = 'read'): boolean {
    const role = this.roleNorm();
    if (role === 'admin') return true; // l'admin a tous les droits

    const ECRITURE: Record<string, string[]> = {
      etudiants:          ['administratif'],
      formations:         ['administratif'],
      formateurs:         ['administratif'],
      documents:          ['administratif', 'enseignant'],
      'comptes-rendus':   ['administratif', 'enseignant'],
      'emplois-du-temps': ['administratif', 'enseignant'],
      insertions:         ['administratif', 'insertion'],
      partenaires:        ['administratif', 'insertion'],
      budgets:            ['administratif']
    };

    const LECTURE: Record<string, string[]> = {
      etudiants:          ['administratif', 'enseignant', 'insertion', 'etudiant', 'tuteur'],
      formations:         ['administratif', 'enseignant', 'insertion', 'etudiant', 'tuteur'],
      formateurs:         ['administratif', 'enseignant', 'tuteur'],
      documents:          ['administratif', 'enseignant', 'insertion', 'etudiant', 'tuteur'],
      'comptes-rendus':   ['administratif', 'enseignant', 'insertion', 'tuteur'],
      'emplois-du-temps': ['administratif', 'enseignant', 'etudiant', 'tuteur'],
      insertions:         ['administratif', 'insertion'],
      partenaires:        ['administratif', 'insertion'],
      budgets:            ['administratif']
    };

    const table = action === 'write' ? ECRITURE : LECTURE;
    const autorises = table[resource];
    return !!autorises && autorises.includes(role);
  }

  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  /** Met à jour localement les informations du profil affiché. */
  updateProfile(partial: Partial<AuthResponse>): void {
    const current = this.currentUserSubject.value;
    if (!current) return;
    const updated = { ...current, ...partial };
    localStorage.setItem('unchk_user', JSON.stringify(updated));
    this.currentUserSubject.next(updated);
  }

  private getStoredUser(): AuthResponse | null {
    const u = localStorage.getItem('unchk_user');
    return u ? JSON.parse(u) : null;
  }
}
