// src/app/shared/models/models.ts

export interface Utilisateur {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  motDePasse?: string;
  actif?: boolean;
  dateCreation?: string;
}

export interface Etudiant {
  id?: number;
  utilisateur?: Utilisateur;
  ine: string;
  dateNaissance?: string;
  formation?: Formation;
  promo?: string;
  anneeDebut?: number;
  anneeSortie?: number;
  diplomes?: string;
  autresFormations?: string;
}

export interface Formation {
  id?: number;
  intitule: string;
  type?: string;
  niveau?: string;
  dateDebut?: string;
  dateFin?: string;
  montant?: number;
  financement?: string;
  nbFormesH?: number;
  nbFormesF?: number;
}

export interface Formateur {
  id?: number;
  utilisateur?: Utilisateur;
  statut: string;
  specialite?: string;
  datePriseFonction?: string;
}

export interface Document {
  id?: number;
  type: string;
  titre: string;
  contenu?: string;
  auteur?: Utilisateur;
  visibiliteRole?: string;
  fichierNom?: string;
  fichierType?: string;
  dateCreation?: string;
}

export interface CompteRendu {
  id?: number;
  typeReunion: string;
  date: string;
  lieu?: string;
  participants?: string;
  contenu?: string;
  auteur?: Utilisateur;
  fichierNom?: string;
  fichierType?: string;
  dateCreation?: string;
}

export interface Insertion {
  id?: number;
  etudiant?: Etudiant;
  type: string;
  dateInsertion?: string;
  employeur?: string;
  poste?: string;
}

export interface StatsInsertion {
  total: number;
  autoEmploi: number;
  salarie: number;
}

export interface AuthResponse {
  token: string;
  role: string;
  nom: string;
  prenom: string;
  email: string;
}

export interface Budget {
  id?: number;
  libelle: string;
  type: string;            // projet | realise | note_orientation
  annee?: number;
  montantPrevu?: number;
  montantRealise?: number;
  description?: string;
  dateCreation?: string;
}

export interface Partenaire {
  id?: number;
  nom: string;
  type?: string;           // entreprise | institution | ong | universite | autre
  domaine?: string;
  contact?: string;
  email?: string;
  telephone?: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: string;         // actif | inactif
  dateCreation?: string;
}

export interface EmploiDuTemps {
  id?: number;
  formation?: Formation;
  jour: string;            // Lundi..Samedi
  heureDebut?: string;
  heureFin?: string;
  matiere?: string;
  type?: string;           // cours | devoir | examen | tutorat
  formateur?: Formateur;
  salle?: string;
}
