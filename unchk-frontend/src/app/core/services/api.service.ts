import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Etudiant, Formation, Formateur,
  Document, CompteRendu, Insertion, StatsInsertion,
  Budget, Partenaire, EmploiDuTemps
} from '../../shared/models/models';

const BASE = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class EtudiantService {
  constructor(private http: HttpClient) {}
  getAll(): Observable<Etudiant[]>          { return this.http.get<Etudiant[]>(`${BASE}/etudiants`); }
  getById(id: number): Observable<Etudiant> { return this.http.get<Etudiant>(`${BASE}/etudiants/${id}`); }
  create(e: Etudiant): Observable<Etudiant> { return this.http.post<Etudiant>(`${BASE}/etudiants`, e); }
  update(id: number, e: Etudiant): Observable<Etudiant> { return this.http.put<Etudiant>(`${BASE}/etudiants/${id}`, e); }
  delete(id: number): Observable<void>      { return this.http.delete<void>(`${BASE}/etudiants/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class FormationService {
  constructor(private http: HttpClient) {}
  getAll(): Observable<Formation[]>           { return this.http.get<Formation[]>(`${BASE}/formations`); }
  getById(id: number): Observable<Formation>  { return this.http.get<Formation>(`${BASE}/formations/${id}`); }
  create(f: Formation): Observable<Formation> { return this.http.post<Formation>(`${BASE}/formations`, f); }
  update(id: number, f: Formation): Observable<Formation> { return this.http.put<Formation>(`${BASE}/formations/${id}`, f); }
  delete(id: number): Observable<void>        { return this.http.delete<void>(`${BASE}/formations/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class FormateurService {
  constructor(private http: HttpClient) {}
  getAll(): Observable<Formateur[]>             { return this.http.get<Formateur[]>(`${BASE}/formateurs`); }
  getById(id: number): Observable<Formateur>    { return this.http.get<Formateur>(`${BASE}/formateurs/${id}`); }
  create(f: Formateur): Observable<Formateur>   { return this.http.post<Formateur>(`${BASE}/formateurs`, f); }
  update(id: number, f: Formateur): Observable<Formateur> { return this.http.put<Formateur>(`${BASE}/formateurs/${id}`, f); }
  delete(id: number): Observable<void>          { return this.http.delete<void>(`${BASE}/formateurs/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class DocumentService {
  constructor(private http: HttpClient) {}
  getAll(): Observable<Document[]>            { return this.http.get<Document[]>(`${BASE}/documents`); }
  getById(id: number): Observable<Document>   { return this.http.get<Document>(`${BASE}/documents/${id}`); }
  create(d: Document): Observable<Document>   { return this.http.post<Document>(`${BASE}/documents`, d); }
  update(id: number, d: Document): Observable<Document> { return this.http.put<Document>(`${BASE}/documents/${id}`, d); }
  uploadFichier(id: number, fichier: File): Observable<Document> {
    const fd = new FormData(); fd.append('fichier', fichier);
    return this.http.post<Document>(`${BASE}/documents/${id}/fichier`, fd);
  }
  downloadFichier(id: number): Observable<Blob> { return this.http.get(`${BASE}/documents/${id}/fichier`, { responseType: 'blob' }); }
  delete(id: number): Observable<void>        { return this.http.delete<void>(`${BASE}/documents/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class CompteRenduService {
  constructor(private http: HttpClient) {}
  getAll(): Observable<CompteRendu[]>               { return this.http.get<CompteRendu[]>(`${BASE}/comptes-rendus`); }
  getById(id: number): Observable<CompteRendu>      { return this.http.get<CompteRendu>(`${BASE}/comptes-rendus/${id}`); }
  create(c: CompteRendu): Observable<CompteRendu>   { return this.http.post<CompteRendu>(`${BASE}/comptes-rendus`, c); }
  update(id: number, c: CompteRendu): Observable<CompteRendu> { return this.http.put<CompteRendu>(`${BASE}/comptes-rendus/${id}`, c); }
  uploadFichier(id: number, fichier: File): Observable<CompteRendu> {
    const fd = new FormData(); fd.append('fichier', fichier);
    return this.http.post<CompteRendu>(`${BASE}/comptes-rendus/${id}/fichier`, fd);
  }
  downloadFichier(id: number): Observable<Blob> { return this.http.get(`${BASE}/comptes-rendus/${id}/fichier`, { responseType: 'blob' }); }
  delete(id: number): Observable<void>              { return this.http.delete<void>(`${BASE}/comptes-rendus/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class InsertionService {
  constructor(private http: HttpClient) {}
  getAll(): Observable<Insertion[]>             { return this.http.get<Insertion[]>(`${BASE}/insertions`); }
  getStats(): Observable<StatsInsertion>        { return this.http.get<StatsInsertion>(`${BASE}/insertions/stats`); }
  create(i: Insertion): Observable<Insertion>  { return this.http.post<Insertion>(`${BASE}/insertions`, i); }
  update(id: number, i: Insertion): Observable<Insertion> { return this.http.put<Insertion>(`${BASE}/insertions/${id}`, i); }
  delete(id: number): Observable<void>         { return this.http.delete<void>(`${BASE}/insertions/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class BudgetService {
  constructor(private http: HttpClient) {}
  getAll(): Observable<Budget[]>            { return this.http.get<Budget[]>(`${BASE}/budgets`); }
  getById(id: number): Observable<Budget>   { return this.http.get<Budget>(`${BASE}/budgets/${id}`); }
  create(b: Budget): Observable<Budget>     { return this.http.post<Budget>(`${BASE}/budgets`, b); }
  update(id: number, b: Budget): Observable<Budget> { return this.http.put<Budget>(`${BASE}/budgets/${id}`, b); }
  delete(id: number): Observable<void>      { return this.http.delete<void>(`${BASE}/budgets/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class PartenaireService {
  constructor(private http: HttpClient) {}
  getAll(): Observable<Partenaire[]>           { return this.http.get<Partenaire[]>(`${BASE}/partenaires`); }
  getById(id: number): Observable<Partenaire>  { return this.http.get<Partenaire>(`${BASE}/partenaires/${id}`); }
  create(p: Partenaire): Observable<Partenaire> { return this.http.post<Partenaire>(`${BASE}/partenaires`, p); }
  update(id: number, p: Partenaire): Observable<Partenaire> { return this.http.put<Partenaire>(`${BASE}/partenaires/${id}`, p); }
  delete(id: number): Observable<void>         { return this.http.delete<void>(`${BASE}/partenaires/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class EmploiDuTempsService {
  constructor(private http: HttpClient) {}
  getAll(): Observable<EmploiDuTemps[]>           { return this.http.get<EmploiDuTemps[]>(`${BASE}/emplois-du-temps`); }
  getById(id: number): Observable<EmploiDuTemps>  { return this.http.get<EmploiDuTemps>(`${BASE}/emplois-du-temps/${id}`); }
  create(e: EmploiDuTemps): Observable<EmploiDuTemps> { return this.http.post<EmploiDuTemps>(`${BASE}/emplois-du-temps`, e); }
  update(id: number, e: EmploiDuTemps): Observable<EmploiDuTemps> { return this.http.put<EmploiDuTemps>(`${BASE}/emplois-du-temps/${id}`, e); }
  delete(id: number): Observable<void>            { return this.http.delete<void>(`${BASE}/emplois-du-temps/${id}`); }
}
