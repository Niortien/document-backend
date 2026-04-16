# Endpoints — Module Scolarité (avec Échéancier)

## BASE URL : `http://localhost:3000`

---

## 1. CONFIGURATION SCOLARITÉ

> Définit les tarifs par année / filière / niveau.

### `GET /scolarite/config`
Lister toutes les configurations.

**Réponse 200**
```json
[
  {
    "id": "uuid",
    "anneeAcademique": "2025-2026",
    "montantTotal": 350000,
    "montantInscription": 100000,
    "description": "Frais L1 ASSRI",
    "isActive": true,
    "filiere": { "id": "uuid", "name": "ASSRI", "code": "ASSRI" },
    "niveau": { "id": "uuid", "name": "Licence 1" },
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
]
```

---

### `GET /scolarite/config/:id`
Obtenir une configuration par ID.

---

### `POST /scolarite/config`
Créer une configuration de scolarité.

**Body**
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

### `PUT /scolarite/config/:id`
Modifier une configuration.

**Body** — mêmes champs que POST (tous optionnels)

---

### `DELETE /scolarite/config/:id`
Supprimer une configuration. Réponse `204 No Content`.

---
---

## 2. PLAN DE PAIEMENT (ÉCHÉANCIER)

> Définit le nombre de versements, les montants et les dates limites pour une configuration.
> Ces données servent de modèle : elles sont **auto-copiées** sur chaque étudiant lors de l'assignation.

### `GET /scolarite/echeancier/config/:configId`
Obtenir le plan de paiement complet d'une configuration.

**Réponse 200**
```json
[
  {
    "id": "uuid",
    "scolariteConfigId": "uuid-config",
    "numero": 1,
    "libelle": "Inscription",
    "montant": 100000,
    "dateEcheance": "2025-10-31",
    "estInscription": true,
    "notes": null
  },
  {
    "id": "uuid",
    "scolariteConfigId": "uuid-config",
    "numero": 2,
    "libelle": "1er versement",
    "montant": 125000,
    "dateEcheance": "2026-01-31",
    "estInscription": false,
    "notes": null
  },
  {
    "id": "uuid",
    "scolariteConfigId": "uuid-config",
    "numero": 3,
    "libelle": "2ème versement",
    "montant": 125000,
    "dateEcheance": "2026-04-30",
    "estInscription": false,
    "notes": null
  }
]
```

---

### `POST /scolarite/echeancier`
Ajouter une échéance au plan de paiement. À appeler autant de fois que de versements prévus.

**Body**
```json
{
  "scolariteConfigId": "uuid-config",
  "numero": 1,
  "libelle": "Inscription",
  "montant": 100000,
  "dateEcheance": "2025-10-31",
  "estInscription": true,
  "notes": "Obligatoire pour valider l'inscription"
}
```

> ⚠️ Le `numero` doit être unique pour une même config. `estInscription` est optionnel (défaut `false`).

---

### `DELETE /scolarite/echeancier/:id`
Supprimer une échéance du plan. Réponse `204 No Content`.

---
---

## 3. SCOLARITÉ ÉTUDIANT

> Représente la scolarité d'un étudiant pour une année. Les échéances sont **générées automatiquement** depuis le plan de la config.

### `GET /scolarite/etudiants`
Lister toutes les scolarités (vue admin).

---

### `GET /scolarite/etudiants/:id`
Obtenir une scolarité par son ID.

**Réponse 200**
```json
{
  "id": "uuid",
  "anneeAcademique": "2025-2026",
  "montantTotal": "350000",
  "montantPaye": "100000",
  "statut": "en_cours",
  "user": { "id": "uuid", "firstName": "Amadou", "lastName": "Diallo" },
  "scolariteConfig": { "id": "uuid", "anneeAcademique": "2025-2026" },
  "notes": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

> **Statuts :** `en_cours` | `solde` | `en_retard`

---

### `GET /scolarite/user/:userId`
Toutes les scolarités d'un étudiant.

---

### `GET /scolarite/user/:userId/dashboard` ⭐
**Tableau de bord temps réel** — données complètes pour afficher la page scolarité de l'étudiant.

**Réponse 200**
```json
{
  "scolarites": [
    {
      "id": "uuid-scolarite",
      "anneeAcademique": "2025-2026",
      "montantTotal": "350000",
      "montantPaye": "200000",
      "statut": "en_cours",
      "user": { "..." : "..." },
      "scolariteConfig": { "..." : "..." },
      "echeances": [
        {
          "id": "uuid-echeance-1",
          "numero": 1,
          "libelle": "Inscription",
          "montantDu": "100000",
          "montantPaye": "100000",
          "dateLimite": "2025-10-31",
          "statut": "paye",
          "echeancierScolarite": { "..." : "..." }
        },
        {
          "id": "uuid-echeance-2",
          "numero": 2,
          "libelle": "1er versement",
          "montantDu": "125000",
          "montantPaye": "100000",
          "dateLimite": "2026-01-31",
          "statut": "partiel"
        },
        {
          "id": "uuid-echeance-3",
          "numero": 3,
          "libelle": "2ème versement",
          "montantDu": "125000",
          "montantPaye": "0",
          "dateLimite": "2026-04-30",
          "statut": "en_attente"
        }
      ]
    }
  ],
  "versements": [
    {
      "id": "uuid",
      "montant": "100000",
      "datePaiement": "2025-10-01",
      "motif": "Versement inscription",
      "echeanceEtudiantId": "uuid-echeance-1",
      "createdAt": "..."
    },
    {
      "id": "uuid",
      "montant": "100000",
      "datePaiement": "2025-12-15",
      "motif": "Versement 2",
      "echeanceEtudiantId": "uuid-echeance-2",
      "createdAt": "..."
    }
  ]
}
```

> **Statuts d'échéance :** `en_attente` | `partiel` | `paye` | `en_retard`

---

### `POST /scolarite/etudiants`
Assigner une scolarité à un étudiant.
Les échéances du plan sont **copiées et générées automatiquement** pour cet étudiant.

**Body**
```json
{
  "userId": "uuid-etudiant",
  "scolariteConfigId": "uuid-config",
  "notes": "Optionnel"
}
```

**Réponse 201** — la scolarité créée (les échéances sont accessibles via le dashboard)

> ⚠️ Erreur `400` si l'étudiant a déjà une scolarité pour la même année académique.

---

### `DELETE /scolarite/etudiants/:id`
Supprimer la scolarité d'un étudiant. Réponse `204 No Content`.

---
---

## 4. ÉCHÉANCES ÉTUDIANT

> Les échéances sont générées automatiquement à l'assignation. Ces endpoints servent à les consulter.

### `GET /scolarite/echeances/etudiant/:scolariteEtudiantId`
Toutes les échéances d'une scolarité étudiant, triées par numéro.

**Réponse 200**
```json
[
  {
    "id": "uuid",
    "numero": 1,
    "libelle": "Inscription",
    "montantDu": "100000",
    "montantPaye": "100000",
    "dateLimite": "2025-10-31",
    "statut": "paye"
  },
  {
    "id": "uuid",
    "numero": 2,
    "libelle": "1er versement",
    "montantDu": "125000",
    "montantPaye": "0",
    "dateLimite": "2026-01-31",
    "statut": "en_attente"
  }
]
```

---

### `GET /scolarite/echeances/user/:userId`
Toutes les échéances scolarité d'un utilisateur (toutes années), triées par date limite.

---
---

## 5. VERSEMENTS SCOLARITÉ

### `GET /scolarite/versements/scolarite/:scolariteEtudiantId`
Historique des versements d'une scolarité, du plus récent au plus ancien.

---

### `GET /scolarite/versements/user/:userId`
Historique complet de tous les versements scolarité d'un utilisateur.

---

### `POST /scolarite/versements`
Enregistrer un versement de scolarité.

**Body**
```json
{
  "scolariteEtudiantId": "uuid-scolarite-etudiant",
  "echeanceEtudiantId": "uuid-echeance",
  "montant": 100000,
  "datePaiement": "2025-10-01",
  "motif": "Versement inscription"
}
```

> `echeanceEtudiantId` est **optionnel** mais recommandé pour lier le versement à une échéance précise.

**Réponse 201**
```json
{
  "versement": {
    "id": "uuid",
    "montant": 100000,
    "datePaiement": "2025-10-01",
    "motif": "Versement inscription",
    "echeanceEtudiantId": "uuid-echeance"
  },
  "scolarite": {
    "id": "uuid",
    "montantPaye": "100000",
    "statut": "en_cours"
  },
  "echeance": {
    "id": "uuid",
    "montantPaye": "100000",
    "statut": "paye"
  }
}
```

> ⚠️ Erreur `400` si le montant dépasse le restant dû (global ou sur l'échéance ciblée).

---
---

## RÉSUMÉ FLUX COMPLET

```
[ADMIN]
  1. POST /scolarite/config          → Créer la config (tarifs)
  2. POST /scolarite/echeancier      → Définir le plan : N fois (1 par versement prévu)
  3. POST /scolarite/etudiants       → Assigner l'étudiant → échéances auto-générées

[ADMIN — enregistrer un paiement]
  4. POST /scolarite/versements      → Indiquer le montant + l'échéance ciblée

[ÉTUDIANT — suivi temps réel]
  5. GET  /scolarite/user/:userId/dashboard → Voir scolarité + échéances + versements
```

---

## TABLEAU RÉCAPITULATIF

| Méthode | Endpoint | Rôle |
|---|---|---|
| `GET` | `/scolarite/config` | Lister les configs |
| `POST` | `/scolarite/config` | Créer une config |
| `PUT` | `/scolarite/config/:id` | Modifier une config |
| `DELETE` | `/scolarite/config/:id` | Supprimer une config |
| `GET` | `/scolarite/echeancier/config/:configId` | Plan de paiement d'une config |
| `POST` | `/scolarite/echeancier` | Ajouter une échéance au plan |
| `DELETE` | `/scolarite/echeancier/:id` | Supprimer une échéance du plan |
| `GET` | `/scolarite/etudiants` | Lister toutes les scolarités (admin) |
| `GET` | `/scolarite/etudiants/:id` | Détail d'une scolarité |
| `GET` | `/scolarite/user/:userId` | Scolarités d'un étudiant |
| `GET` | `/scolarite/user/:userId/dashboard` | ⭐ Dashboard complet temps réel |
| `POST` | `/scolarite/etudiants` | Assigner une scolarité à un étudiant |
| `DELETE` | `/scolarite/etudiants/:id` | Supprimer une scolarité |
| `GET` | `/scolarite/echeances/etudiant/:scolariteEtudiantId` | Échéances d'une scolarité |
| `GET` | `/scolarite/echeances/user/:userId` | Toutes les échéances d'un étudiant |
| `GET` | `/scolarite/versements/scolarite/:scolariteEtudiantId` | Versements d'une scolarité |
| `GET` | `/scolarite/versements/user/:userId` | Versements d'un étudiant |
| `POST` | `/scolarite/versements` | Enregistrer un versement |
