# Analyse des Changements API - Module Ressources
**Date:** 19 mars 2026 - Session 2

## 📊 Changements Détectés

### 1. Controller (`resources.controller.ts`)

#### ✅ Changement: Endpoint `GET /resources/phase/:phaseId` est maintenant public
```diff
  @Get('phase/:phaseId')
+ @Public()
  findByPhase(@Param('phaseId') phaseId: string, @Query() query: FilterResourcesDto)
```

**Impact Frontend:**
- ✅ Déjà géré correctement - Pas d'authentification nécessaire pour cet endpoint
- Le service frontend fonctionne déjà sans token pour cet endpoint

#### ✅ Changement: Réorganisation de l'ordre des méthodes
- `POST /resources` déplacé après `PATCH /resources/file/:id`
- **Impact:** Aucun (ordre cosmétique uniquement)

---

### 2. Service (`resources.service.ts`)

#### ⚠️ Changement Important: Gestion stricte de project_id et phase_id

**Avant:**
```typescript
project: dto.project_id ? { id: dto.project_id } : null,
phase: dto.phase_id ? { id: dto.phase_id } : null
```

**Après:**
```typescript
project: { id: dto.project_id },
phase: { id: dto.phase_id }
```

**Impact Frontend:**
- ⚠️ `project_id` et `phase_id` sont maintenant **REQUIS** dans le DTO
- Si `undefined`, cela passera `{ id: undefined }` qui peut causer une erreur SQL
- **Action requise:** Vérifier la gestion des champs optionnels dans le frontend

#### ✅ Changement: Alias QueryBuilder cohérents
```diff
- .createQueryBuilder('resource')
+ .createQueryBuilder('r')
```

**Impact:** Aucun sur le frontend (changement interne)

#### ✅ Changement: Suppression du filtre `is_published`
```diff
- .andWhere('resource.is_published = :isPublished', { isPublished: true })
```

**Impact Frontend:**
- ✅ Plus besoin de gérer un état de publication
- Toutes les ressources sont désormais visibles (pas de draft)

---

### 3. Entity (`resource.entity.ts`)

#### ✅ Aucun changement structurel détecté
- Pas de nouveaux champs
- Relations restent optionnelles (`nullable: true`)
- Pas de champ `tags` dans l'entity (⚠️ contradiction avec le frontend)

---

### 4. DTOs

#### `CreateResourceDto`
```typescript
{
  title: string;           // @IsNotEmpty
  description: string;     // @IsNotEmpty
  category: ResourceCategory;  // @IsEnum
  project_id?: string;     // @IsUUID @IsOptional
  phase_id?: string;       // @IsUUID @IsOptional
}
```

#### `UpdateResourceDto`
- Utilise `PartialType(CreateResourceDto)` → tous les champs deviennent optionnels

---

## ⚠️ Problèmes Identifiés

### 1. **Absence du champ `tags` dans l'API**

**Frontend:**
```typescript
interface IResource {
  tags?: string[];  // ❌ N'existe PAS dans l'API
}
```

**API Entity:**
```typescript
@Entity()
export class Resource {
  // ❌ Pas de colonne tags
}
```

**Impact:**
- Le frontend envoie des tags mais l'API les ignore
- Besoin de clarifier : est-ce une feature future ?

---

### 2. **Gestion des champs project_id/phase_id optionnels**

**API actuelle:**
```typescript
// Service assigne toujours un objet, même si undefined
project: { id: dto.project_id },  // ⚠️ Si project_id = undefined → { id: undefined }
```

**Frontend:**
```typescript
// Le DTO peut envoyer project_id = undefined
projectId: event.value.projectId || undefined,  // ✅ Mais pourrait être omis
```

**Risque:**
- Si `project_id` n'est pas fourni, TypeORM pourrait essayer d'insérer `NULL` ou une référence invalide
- Besoin de vérifier le comportement réel

---

## 🔧 Actions Requises Frontend

### 1. ✅ Supprimer la gestion des tags (feature non supportée)

**Fichiers à modifier:**
- `shared/models/entities.models.ts` - Retirer `tags` de `IResource`
- `CreateResourceDto` - Retirer `tags`
- `UpdateResourceDto` - Retirer `tags`
- `ResourceCard` - Retirer l'affichage des tags
- `ResourceForm` - Retirer le champ tags
- `ResourceFilters` - Retirer le filtre par tags

---

### 2. ⚠️ Vérifier la gestion des champs optionnels

**Option A: Rendre project_id/phase_id obligatoires**
```typescript
// Une ressource DOIT être liée à un projet OU une phase
interface CreateResourceDto {
  projectId: string;  // Required
  phaseId?: string;   // Optional
}
```

**Option B: Gérer côté API**
- Demander à l'équipe backend de gérer `dto.project_id ? { id: dto.project_id } : null`
- Ou clarifier les règles métier

---

### 3. ✅ Adapter les DTOs Frontend

**Avant:**
```typescript
interface CreateResourceDto {
  title: string;
  description: string;
  category: ResourceCategory;
  tags?: string[];        // ❌ À supprimer
  projectId?: string;
  phaseId?: string;
}
```

**Après:**
```typescript
interface CreateResourceDto {
  title: string;
  description: string;
  category: ResourceCategory;
  projectId?: string;     // Clarifier si obligatoire
  phaseId?: string;
}
```

---

## 📋 Plan d'Action

### Phase 1: Nettoyage des Tags (1h)
1. ✅ Retirer `tags` de `IResource` dans models
2. ✅ Retirer le champ tags dans `ResourceForm`
3. ✅ Retirer l'affichage tags dans `ResourceCard`
4. ✅ Retirer le filtre tags dans `ResourceFilters`
5. ✅ Mettre à jour `ResourcesList` (pas de filtre tags)
6. ✅ Mettre à jour les DTOs

### Phase 2: Clarification Métier (15min)
1. ⚠️ Vérifier avec l'équipe : Une ressource doit-elle être liée à un projet OU une phase ?
2. ⚠️ Tester la création sans project_id/phase_id
3. ⚠️ Adapter la validation selon la réponse

### Phase 3: Tests (30min)
1. ✅ Compiler et vérifier le linting
2. ✅ Tester création avec/sans projet
3. ✅ Tester création avec/sans phase
4. ✅ Vérifier les filtres

### Phase 4: Commit (10min)
1. ✅ Commit avec message clair
2. ✅ Mettre à jour la documentation

---

## 🎯 Résumé Exécutif

**Changements API:**
- ✅ Endpoint `findByPhase` public (pas d'impact)
- ⚠️ Suppression logique du filtre `is_published` (simplifie la logique)
- ⚠️ Gestion stricte de `project_id/phase_id` (nécessite vérification)
- ❌ Absence du champ `tags` (feature non implémentée)

**Actions Frontend:**
1. **Obligatoire:** Retirer toute référence aux tags
2. **Recommandé:** Clarifier la gestion des relations optionnelles
3. **Optionnel:** Ajouter une validation côté form (au moins 1 entre projet/phase)

**Temps estimé:** 2-3h pour adaptation complète

---

**Prêt à implémenter ?** 🚀
