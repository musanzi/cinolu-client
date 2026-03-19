# Module Ressources - Analyse & Proposition d'Architecture

**Date:** 18/03/2026  
**Projet:** Cinolu.org (Angular 21)  
**Contexte:** Dashboard Mentor - Module Ressources

---

## 📊 1. Analyse de l'Existant

### 1.1 Architecture Frontend Actuelle

**Structure modulaire:**
```
src/app/
├── core/                    # Services globaux, guards, interceptors
│   ├── auth/               # Authentification
│   ├── guards/             # authGuard, mentorGuard
│   ├── interceptors/       # HTTP interceptors
│   └── services/           # Analytics, Config, Language, Loading, Toast
├── features/               # Modules fonctionnels
│   ├── dashboard/          # Dashboard commun
│   ├── dashboard-mentor/   # Dashboard spécifique mentor
│   └── dashboard-user/     # Dashboard spécifique utilisateur
├── shared/                 # Composants, pipes, directives réutilisables
│   ├── components/
│   ├── models/             # entities.models.ts (interfaces TypeScript)
│   ├── pipes/              # api-img.pipe.ts
│   └── config/
└── layout/                 # Layouts (fixed, full, empty)
```

**Conventions identifiées:**
- ✅ **Standalone components** (Angular 21)
- ✅ **Signal Store** (@ngrx/signals) pour la gestion d'état
- ✅ **Lazy loading** systématique via routes
- ✅ **ChangeDetection.OnPush** pour performance
- ✅ **Lucide Angular** pour les icônes
- ✅ **Tailwind CSS** (v4.1.11) pour le styling
- ✅ **RxJS** pour les flux asynchrones
- ✅ **HttpClient** avec interceptors
- ✅ **Guards** pour la sécurité (authGuard + mentorGuard)

### 1.2 Dashboard Mentor Actuel

**Routing (`dashboard-mentor.routes.ts`):**
```typescript
/dashboard/mentor
├── ''                    → MentorDashboard (Accueil)
├── profile               → MentorProfile
├── mentored-projects     → MentoredProjects (Liste)
├── mentored-projects/:id → MentoredProjectDetail
└── mentored-projects/:projectId/participations/:participationId
                          → MentoredParticipationDetail
```

**Menu actuel (`mentor-menu.config.ts`):**
- Accueil (LayoutDashboard icon)
- Profil Mentor (Badge icon)
- Projets mentorés (GraduationCap icon)

**Pattern observé:**
- Pages dans `features/dashboard/pages/mentor/`
- Layout commun: `MentorDashboardLayout`
- Store dédié: `mentorship.store.ts` (signalStore)
- Service dédié: `mentorship.service.ts`
- Configuration menu séparée

### 1.3 API Backend - Module Resources

**Entity (`resource.entity.ts`):**
```typescript
interface Resource {
  id: string;
  title: string;
  description: string;
  file: string; // chemin du fichier
  category: ResourceCategory; // enum
  tags?: string[];
  project?: Project; // relation optionnelle
  phase?: Phase; // relation optionnelle
  created_at: Date;
  updated_at: Date;
}

enum ResourceCategory {
  GUIDE = 'guide',
  TEMPLATE = 'template',
  LEGAL = 'legal',
  PITCH = 'pitch',
  FINANCIAL = 'financial',
  REPORT = 'report',
  OTHER = 'other'
}
```

**Endpoints disponibles (lecture seule pour nous):**
```
GET  /resources/project/:projectId  → [Resource[], count]
GET  /resources/phase/:phaseId      → [Resource[], count]
POST /resources                     → Resource (RBAC protected)
PATCH /resources/:id                → Resource (RBAC protected)
PATCH /resources/file/:id           → Resource (RBAC protected)
DELETE /resources/:id               → void (RBAC protected)
```

**Filtres disponibles:**
- `page` (pagination)
- `limit` (pagination)
- `category` (ResourceCategory enum)
- `tags` (string)

**UPDATE (18/03/2026):** ✅ Les mentors ont maintenant les droits `manage` sur les ressources !
- CREATE: Upload de nouvelles ressources
- UPDATE: Modification de ressources existantes  
- DELETE: Suppression de ressources
- RBAC Policy: `Role.MENTOR` inclus dans grants

---

## 🎯 2. Objectif Fonctionnel

**Implémenter dans le dashboard mentor:**
- Affichage des ressources liées aux projets mentorés
- Filtrage par catégorie et tags
- Téléchargement des fichiers
- Vue détaillée des ressources
- Liaison contextuelle avec les projets/phases

**Cas d'usage:**
1. Le mentor accède à un projet mentoré
2. Il consulte les ressources disponibles pour ce projet
3. Il peut filtrer par type (guide, template, legal...)
4. Il télécharge les ressources pertinentes
5. Il voit les ressources liées aux phases spécifiques

---

## 🏗️ 3. Proposition d'Architecture

### 3.1 Arborescence Proposée

```
src/app/features/dashboard/
├── pages/mentor/
│   ├── mentored-projects/
│   ├── mentored-project-detail/
│   └── resources/                          # 🆕 MODULE RESSOURCES
│       ├── resources-list/                 # Liste complète des ressources
│       │   ├── resources-list.ts
│       │   └── resources-list.html
│       ├── resource-detail/                # Détail d'une ressource
│       │   ├── resource-detail.ts
│       │   └── resource-detail.html
│       └── components/                     # Composants internes
│           ├── resource-card/              # Card ressource (dumb)
│           │   ├── resource-card.ts
│           │   └── resource-card.html
│           ├── resource-filters/           # Filtres (dumb)
│           │   ├── resource-filters.ts
│           │   └── resource-filters.html
│           └── resource-category-badge/    # Badge catégorie (dumb)
│               ├── resource-category-badge.ts
│               └── resource-category-badge.html
├── services/
│   └── resources.service.ts                # 🆕 Service API
├── store/
│   └── resources.store.ts                  # 🆕 Signal Store
└── models/                                 # (optionnel si besoin de types locaux)
```

### 3.2 Routing Proposé

**Option A - Route dédiée indépendante (recommandé):**
```typescript
/dashboard/mentor/resources                  → ResourcesList (toutes les ressources)
/dashboard/mentor/resources/:id              → ResourceDetail
/dashboard/mentor/mentored-projects/:id      → Onglet ressources intégré (futur)
```

**Option B - Intégration dans les projets:**
```typescript
/dashboard/mentor/mentored-projects/:projectId/resources     → ResourcesList (scope projet)
/dashboard/mentor/mentored-projects/:projectId/resources/:id → ResourceDetail
```

**Recommandation:** **Option A** pour commencer (plus simple), puis ajouter un onglet dans MentoredProjectDetail.

**Justification:**
- Découplage clair du module
- Réutilisabilité facilitée
- Navigation plus intuitive pour l'utilisateur
- Migration progressive possible

### 3.3 Mise à jour du Menu

**Ajout dans `mentor-menu.config.ts`:**
```typescript
{
  id: 'mentor-resources',
  label: 'Ressources',
  icon: FileText, // ou BookOpen, Library
  path: MENTOR_BASE + '/resources',
  tooltip: 'Accéder aux ressources des projets'
}
```

---

## 🧩 4. Architecture Technique Détaillée

### 4.1 Models (TypeScript Interfaces)

**Créer dans `shared/models/entities.models.ts` (ou nouveau fichier dédié):**
```typescript
export enum ResourceCategory {
  GUIDE = 'guide',
  TEMPLATE = 'template',
  LEGAL = 'legal',
  PITCH = 'pitch',
  FINANCIAL = 'financial',
  REPORT = 'report',
  OTHER = 'other'
}

export interface IResource extends IBase {
  title: string;
  description: string;
  file: string;
  category: ResourceCategory;
  tags?: string[];
  project?: IProject;
  phase?: IPhase;
}

export interface ResourcesFilter {
  page?: number;
  limit?: number;
  category?: ResourceCategory;
  tags?: string;
}
```

### 4.2 Service (`resources.service.ts`)

**Responsabilités:**
- Appels HTTP vers l'API
- Gestion des erreurs
- Transformation des réponses

**Signature proposée:**
```typescript
@Injectable({ providedIn: 'root' })
export class ResourcesService {
  private _http = inject(HttpClient);

  getResourcesByProject(
    projectId: string, 
    filter?: ResourcesFilter
  ): Observable<[IResource[], number]> { }

  getResourcesByPhase(
    phaseId: string, 
    filter?: ResourcesFilter
  ): Observable<[IResource[], number]> { }

  getResourceFileUrl(resource: IResource): string { }
}
```

### 4.3 Store (`resources.store.ts`)

**Basé sur @ngrx/signals (comme mentorship.store):**
```typescript
interface IResourcesStore {
  resources: IResource[];
  totalResources: number;
  selectedResource: IResource | null;
  
  // Filtres
  currentPage: number;
  filterCategory: ResourceCategory | null;
  filterTags: string;
  
  // États UI
  isLoading: boolean;
  isLoadingDetail: boolean;
  error: string | null;
}

export const ResourcesStore = signalStore(
  { providedIn: 'root' },
  withState<IResourcesStore>({ ... }),
  withProps(() => ({
    _service: inject(ResourcesService),
    _toast: inject(ToastrService)
  })),
  withComputed(({ resources, totalResources }) => ({
    hasMoreResources: computed(() => 
      resources().length < totalResources()
    )
  })),
  withMethods(({ _service, _toast, ...store }) => ({
    loadResourcesByProject: rxMethod<{ projectId: string; filter?: ResourcesFilter }>(...),
    loadResourcesByPhase: rxMethod<{ phaseId: string; filter?: ResourcesFilter }>(...),
    loadResourceDetail: rxMethod<string>(...),
    setFilter: (category: ResourceCategory | null, tags: string) => { },
    clearResources: () => { }
  }))
);
```

### 4.4 Composants

**A. ResourcesList (Smart Component)**
- Inject ResourcesStore
- Gère le chargement initial
- Affiche les filtres
- Affiche la liste paginée
- Navigation vers détails

**B. ResourceCard (Dumb Component)**
- Input: `@Input() resource: IResource`
- Output: `@Output() download = new EventEmitter<IResource>()`
- Affichage: titre, catégorie, tags, date, aperçu
- Action: télécharger, voir détails

**C. ResourceFilters (Dumb Component)**
- Input: `@Input() categories: ResourceCategory[]`
- Output: `@Output() filterChange = new EventEmitter<{ category, tags }>()`
- UI: Dropdowns, search input

**D. ResourceCategoryBadge (Dumb Component)**
- Input: `@Input() category: ResourceCategory`
- Styling conditionnel par catégorie

**E. ResourceDetail (Smart Component)**
- Inject ResourcesStore
- Affiche détails complets
- Bouton téléchargement
- Métadonnées (projet, phase, tags)

---

## 🎨 5. Spécifications UI/UX

### 5.1 ResourcesList Page

**Layout:**
```
┌─────────────────────────────────────────────┐
│ [Header] Ressources                          │
│ ├─ Breadcrumb: Dashboard > Ressources       │
│ └─ Sous-titre: "Accédez aux documents..."   │
├─────────────────────────────────────────────┤
│ [Filtres]                                    │
│ ├─ Dropdown Catégorie: [Toutes | Guide...]  │
│ ├─ Search Tags: [input]                     │
│ └─ [Button Réinitialiser]                   │
├─────────────────────────────────────────────┤
│ [Grid Ressources] (responsive 1-2-3 cols)   │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│ │ Card 1   │ │ Card 2   │ │ Card 3   │     │
│ │ [icon]   │ │ [icon]   │ │ [icon]   │     │
│ │ Titre    │ │ Titre    │ │ Titre    │     │
│ │ Category │ │ Category │ │ Category │     │
│ │ Tags     │ │ Tags     │ │ Tags     │     │
│ │ [Action] │ │ [Action] │ │ [Action] │     │
│ └──────────┘ └──────────┘ └──────────┘     │
├─────────────────────────────────────────────┤
│ [Pagination] ← 1 2 3 ... →                  │
└─────────────────────────────────────────────┘
```

**États:**
- Loading: Skeleton loaders
- Empty: Message + illustration
- Error: Toast notification

### 5.2 ResourceCard

**Éléments:**
- Icône selon catégorie (FileText, FileCheck, Scale, Presentation, Calculator, FileBarChart)
- Titre (tronqué si trop long)
- Badge catégorie (couleur coded)
- Tags (max 3, scrollable)
- Date d'ajout
- Bouton télécharger (Download icon)
- Bouton voir détails (Eye icon ou clic sur card)

**Hover:**
- Élévation shadow
- Border highlight

### 5.3 ResourceDetail Page

**Layout:**
```
┌─────────────────────────────────────────────┐
│ [Header] ← Retour | Titre de la ressource   │
├─────────────────────────────────────────────┤
│ [Metadata Card]                              │
│ ├─ Catégorie: [Badge]                       │
│ ├─ Tags: [tag1] [tag2] [tag3]               │
│ ├─ Date: 12 mars 2026                       │
│ ├─ Projet: [Lien vers projet]               │
│ └─ Phase: [Lien vers phase]                 │
├─────────────────────────────────────────────┤
│ [Description]                                │
│ Lorem ipsum dolor sit amet...                │
├─────────────────────────────────────────────┤
│ [Actions]                                    │
│ ├─ [Button Télécharger] (primary)           │
│ └─ [Button Voir le projet] (secondary)      │
└─────────────────────────────────────────────┘
```

### 5.4 Thème Couleurs par Catégorie

```typescript
const CATEGORY_COLORS: Record<ResourceCategory, string> = {
  guide: 'bg-blue-100 text-blue-800',
  template: 'bg-purple-100 text-purple-800',
  legal: 'bg-red-100 text-red-800',
  pitch: 'bg-orange-100 text-orange-800',
  financial: 'bg-green-100 text-green-800',
  report: 'bg-yellow-100 text-yellow-800',
  other: 'bg-gray-100 text-gray-800'
};

const CATEGORY_ICONS: Record<ResourceCategory, LucideIcon> = {
  guide: BookOpen,
  template: FileText,
  legal: Scale,
  pitch: Presentation,
  financial: Calculator,
  report: FileBarChart,
  other: File
};
```

---

## 📱 6. Responsive Design

**Breakpoints (Tailwind):**
- Mobile: `<640px` → 1 colonne, menu burger, filtres collapsibles
- Tablet: `640px-1024px` → 2 colonnes
- Desktop: `>1024px` → 3 colonnes, sidebar fixe

**Optimisations:**
- Lazy loading images
- Virtual scrolling si >100 items (CDK Virtual Scroll)
- Pagination côté serveur (limit=20)

---

## 🚀 7. Plan d'Implémentation

### Phase 1: Fondations (2-3h)
1. ✅ Créer les interfaces TypeScript
2. ✅ Implémenter `resources.service.ts`
3. ✅ Implémenter `resources.store.ts`
4. ✅ Tests unitaires service

### Phase 2: Composants Dumb (2-3h)
1. ✅ ResourceCategoryBadge
2. ✅ ResourceCard
3. ✅ ResourceFilters

### Phase 3: Pages Smart (3-4h)
1. ✅ ResourcesList
2. ✅ ResourceDetail
3. ✅ Routing + Guards

### Phase 4: Intégration (2h)
1. ✅ Mise à jour menu mentor
2. ✅ Ajout onglet dans MentoredProjectDetail (optionnel)
3. ✅ Liens croisés (projet → ressources)

### Phase 5: Polish (1-2h)
1. ✅ Loading states
2. ✅ Empty states
3. ✅ Error handling
4. ✅ Accessibilité (ARIA labels)

**Total estimé: 10-14h de développement**

---

## 🧪 8. Tests

### Tests Unitaires
- `resources.service.spec.ts` (HttpClient mocking)
- `resources.store.spec.ts` (signalStore testing)
- Composants dumb (inputs/outputs)

### Tests d'Intégration
- Navigation menu → ResourcesList
- Filtrage + pagination
- Téléchargement fichier

### Tests E2E (optionnel)
- Parcours complet mentor
- Accessibilité (screen readers)

---

## 🔐 9. Sécurité & Performance

### Sécurité
- ✅ Guards déjà en place (authGuard + mentorGuard)
- ✅ RBAC géré côté API (lecture seule OK)
- ✅ Validation des URLs de téléchargement
- ✅ Sanitization du contenu (DomSanitizer si HTML)

### Performance
- ✅ OnPush Change Detection
- ✅ TrackBy dans ngFor
- ✅ Lazy loading du module
- ✅ Pagination côté serveur
- ✅ Debounce sur les filtres (300ms)
- ✅ Cache HTTP (interceptor existant ?)

---

## 📝 10. Points de Décision

### ❓ Questions à valider avec vous:

1. **Scope initial:**
   - Commencer par route indépendante `/dashboard/mentor/resources` ?
   - Ou intégrer directement dans les projets ?

2. **Téléchargement:**
   - Ouvrir dans nouvel onglet ?
   - Téléchargement direct via anchor ?
   - Prévisualisation avant download (PDF, images) ?

3. **Permissions:**
   - Tous les mentors voient toutes les ressources ?
   - Ou seulement celles des projets mentorés ?

4. **Filtres avancés:**
   - Date range ?
   - Multi-select tags ?
   - Search full-text ?

5. **Onglet dans projet:**
   - Ajouter maintenant ou phase 2 ?

---

## 🎯 11. Critères de Succès

✅ **Fonctionnel:**
- Liste ressources paginée
- Filtrage par catégorie + tags
- Téléchargement fichiers
- Navigation fluide
- Responsive mobile/desktop

✅ **Technique:**
- Code propre (ESLint pass)
- Types strict
- Store reactive (signals)
- Change detection optimisée
- Pas d'appels API redondants

✅ **UX:**
- Loading states clairs
- Empty states informatifs
- Erreurs gérées gracieusement
- Navigation intuitive
- Performance <3s load

---

## 🚦 Prochaines Étapes

**Validation requise:**
1. Approuver l'architecture proposée
2. Répondre aux questions de décision
3. Valider le design UI/UX (maquettes ?)

**Une fois validé:**
1. Je commence l'implémentation phase par phase
2. Commits atomiques (1 feature = 1 commit)
3. Review intermédiaire à mi-parcours
4. Livraison finale avec documentation

---

**Prêt à démarrer dès validation ! 🚀**
