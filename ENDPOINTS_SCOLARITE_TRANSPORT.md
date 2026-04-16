# Endpoints — Modules Scolarité & Transport

## BASE URL : `http://localhost:3000`

---

## MODULE SCOLARITÉ — `/scolarite`

### Configuration tarifaire

| Méthode | URL | Description | Body |
|---|---|---|---|
| `GET` | `/scolarite/config` | Lister toutes les configs | — |
| `GET` | `/scolarite/config/:id` | Obtenir une config par ID | — |
| `POST` | `/scolarite/config` | Créer une config | voir ci-dessous |
| `PUT` | `/scolarite/config/:id` | Modifier une config | voir ci-dessous |
| `DELETE` | `/scolarite/config/:id` | Supprimer une config | — |

**POST / PUT `/scolarite/config`**
```json
{
  "anneeAcademique": "2025-2026",
  "montantTotal": 350000,
  "montantInscription": 100000,
  "description": "Frais L1 ASSRI",
  "isActive": true,
  "filiereId": "uuid-filiere",
  "niveauId": "uuid-niveau"
}
```

---

### Suivi scolarité par étudiant

| Méthode | URL | Description | Body |
|---|---|---|---|
| `GET` | `/scolarite/etudiants` | Lister toutes les scolarités (admin) | — |
| `GET` | `/scolarite/etudiants/:id` | Obtenir une scolarité par ID | — |
| `GET` | `/scolarite/user/:userId` | Scolarités d'un étudiant | — |
| `GET` | `/scolarite/user/:userId/dashboard` | **Dashboard complet** (scolarités + versements) | — |
| `POST` | `/scolarite/etudiants` | Assigner une scolarité à un étudiant | voir ci-dessous |
| `DELETE` | `/scolarite/etudiants/:id` | Supprimer une scolarité étudiant | — |

**POST `/scolarite/etudiants`**
```json
{
  "userId": "uuid-etudiant",
  "scolariteConfigId": "uuid-config",
  "notes": "Optionnel"
}
```

**Réponse `GET /scolarite/user/:userId/dashboard`**
```json
{
  "scolarites": [
    {
      "id": "uuid",
      "anneeAcademique": "2025-2026",
      "montantTotal": "350000",
      "montantPaye": "200000",
      "statut": "en_cours",
      "user": { "..." : "..." },
      "scolariteConfig": { "..." : "..." }
    }
  ],
  "versements": [
    {
      "id": "uuid",
      "montant": "100000",
      "datePaiement": "2025-10-01",
      "motif": "Versement inscription",
      "createdAt": "..."
    }
  ]
}
```

> **Statuts possibles :** `en_cours` | `solde` | `en_retard`

---

### Versements scolarité

| Méthode | URL | Description | Body |
|---|---|---|---|
| `GET` | `/scolarite/versements/scolarite/:scolariteEtudiantId` | Versements d'une scolarité | — |
| `GET` | `/scolarite/versements/user/:userId` | Tous les versements scolarité d'un étudiant | — |
| `POST` | `/scolarite/versements` | Enregistrer un versement | voir ci-dessous |

**POST `/scolarite/versements`**
```json
{
  "scolariteEtudiantId": "uuid-scolarite-etudiant",
  "montant": 50000,
  "datePaiement": "2026-01-15",
  "motif": "Versement 2ème trimestre"
}
```

> ⚠️ Erreur `400` si le montant dépasse le restant dû. Le `montantPaye` et le `statut` sont mis à jour automatiquement.

---
---

## MODULE TRANSPORT — `/transport`

### Configuration tarifaire

| Méthode | URL | Description | Body |
|---|---|---|---|
| `GET` | `/transport/config` | Lister toutes les configs | — |
| `GET` | `/transport/config/:id` | Obtenir une config par ID | — |
| `POST` | `/transport/config` | Créer une config | voir ci-dessous |
| `PUT` | `/transport/config/:id` | Modifier une config | voir ci-dessous |
| `DELETE` | `/transport/config/:id` | Supprimer une config | — |

**POST / PUT `/transport/config`**
```json
{
  "anneeAcademique": "2025-2026",
  "montantMensuel": 15000,
  "montantAnnuel": 150000,
  "description": "Ligne campus - centre ville",
  "isActive": true
}
```

---

### Abonnements transport

| Méthode | URL | Description | Body |
|---|---|---|---|
| `GET` | `/transport/abonnements` | Lister tous les abonnements (admin) | — |
| `GET` | `/transport/abonnements/:id` | Obtenir un abonnement par ID | — |
| `GET` | `/transport/user/:userId` | Abonnements d'un étudiant | — |
| `GET` | `/transport/user/:userId/dashboard` | **Dashboard complet** (abonnements + versements) | — |
| `POST` | `/transport/abonnements` | Créer un abonnement pour un étudiant | voir ci-dessous |
| `DELETE` | `/transport/abonnements/:id` | Supprimer un abonnement | — |

**POST `/transport/abonnements`**
```json
{
  "userId": "uuid-etudiant",
  "transportConfigId": "uuid-config",
  "typeAbonnement": "mensuel",
  "notes": "Optionnel"
}
```

> **Types d'abonnement :** `mensuel` | `annuel`  
> Le `montantTotal` est calculé automatiquement depuis la config.

**Réponse `GET /transport/user/:userId/dashboard`**
```json
{
  "abonnements": [
    {
      "id": "uuid",
      "anneeAcademique": "2025-2026",
      "typeAbonnement": "annuel",
      "montantTotal": "150000",
      "montantPaye": "100000",
      "statut": "actif",
      "user": { "..." : "..." },
      "transportConfig": { "..." : "..." }
    }
  ],
  "versements": [
    {
      "id": "uuid",
      "montant": "75000",
      "datePaiement": "2025-10-01",
      "moisConcerne": null,
      "motif": "Versement transport 1",
      "createdAt": "..."
    }
  ]
}
```

> **Statuts possibles :** `actif` | `inactif` | `solde`

---

### Versements transport

| Méthode | URL | Description | Body |
|---|---|---|---|
| `GET` | `/transport/versements/abonnement/:transportAbonnementId` | Versements d'un abonnement | — |
| `GET` | `/transport/versements/user/:userId` | Tous les versements transport d'un étudiant | — |
| `POST` | `/transport/versements` | Enregistrer un versement | voir ci-dessous |

**POST `/transport/versements`**
```json
{
  "transportAbonnementId": "uuid-abonnement",
  "montant": 15000,
  "datePaiement": "2026-02-01",
  "moisConcerne": "Février 2026",
  "motif": "Abonnement mensuel"
}
```

> ⚠️ Erreur `400` si le montant dépasse le restant dû. Le `montantPaye` et le `statut` sont mis à jour automatiquement.

---

## Résumé — Endpoints utiles côté étudiant

| Usage | Endpoint |
|---|---|
| Voir ma scolarité + mes versements | `GET /scolarite/user/{userId}/dashboard` |
| Voir mon transport + mes versements | `GET /transport/user/{userId}/dashboard` |
| Voir mes versements scolarité uniquement | `GET /scolarite/versements/user/{userId}` |
| Voir mes versements transport uniquement | `GET /transport/versements/user/{userId}` |

---

> La documentation Swagger complète est disponible sur `/api`.
