interface IBase {
  id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

export interface ITag extends IBase {
  name: string;
}

export interface IIndicator extends IBase {
  name: string;
  category: string;
  target: number | null;
  year: number | null;
}

export interface IComment extends IBase {
  content: string;
  author: IUser;
  article: IArticle;
}

export interface IImage extends IBase {
  image: string;
}

export interface IArticle extends IBase {
  title: string;
  slug: string;
  image: string;
  summary: string;
  content: string;
  published_at: Date;
  is_highlighted: boolean;
  tags: ITag[];
  comments: IComment[];
  author: IUser;
  gallery?: IImage[];
}

export interface IUser extends IBase {
  email: string;
  name: string;
  password: string;
  biography: string;
  phone_number: string;
  city: string;
  country: string;
  gender: string;
  birth_date: Date;
  google_image: string;
  profile: string;
  referral_code: string;
  referred_by: IUser;
  referralsCount?: number;
  referrals: IUser[];
  ventures: IVenture[];
  roles: string[];
  participated_projects: IProject[];
  participated_events: IEvent[];
  managed_projects: IProject[];
  managed_events: IEvent[];
  articles: IArticle[];
  comments: IComment[];
  mentor_profile?: IMentorProfile;
}

export interface IProject extends IBase {
  name: string;
  is_highlighted: boolean;
  slug: string;
  cover: string;
  description: string;
  started_at: Date;
  ended_at: Date;
  is_published: boolean;
  context: string;
  objectives: string;
  duration_hours: number;
  selection_criteria: string;
  project_manager: IUser | null;
  program: ISubprogram;
  categories: ICategory[];
  gallery: IImage[];
  metrics: IMetric[];
  participants: IUser[];
  phases: IPhase[];
  /** Mapped count (loadRelationCountAndMap) */
  participantsCount?: number;
}

export interface IEvent extends IBase {
  name: string;
  slug: string;
  is_highlighted: boolean;
  cover: string;
  place: string;
  description: string;
  context: string;
  objectives: string;
  duration_hours: number;
  event_manager?: IUser;
  selection_criteria: string;
  started_at: Date;
  is_published: boolean;
  ended_at: Date;
  program: ISubprogram;
  categories: ICategory[];
  gallery: IImage[];
  metrics: IMetric[];
  participants: IUser[];
}

export interface IVenture extends IBase {
  name: string;
  slug: string;
  description: string;
  problem_solved: string;
  target_market: string;
  logo: string;
  cover: string;
  email: string;
  phone_number: string;
  website: string;
  linkedin_url: string;
  sector: string;
  is_published: boolean;
  founded_at: Date;
  location: string;
  stage: string;
  owner: IUser;
  gallery: IImage[];
  products: IProduct[];
}

export interface IProgram extends IBase {
  name: string;
  description: string;
  slug: string;
  logo: string;
  is_published: boolean;
  is_highlighted: boolean;
  subprograms: ISubprogram[];
  category: ICategory;
  indicators: IIndicator[];
  indicators_grouped?: Record<string, IIndicator[]>;
}

export interface ISubprogram extends IBase {
  name: string;
  description: string;
  slug: string;
  logo: string;
  is_published: boolean;
  is_highlighted: boolean;
  program: IProgram;
  projects: IProject[];
  events: IEvent[];
}

export interface IMetric extends IBase {
  indicator: IIndicator;
  target: number;
  achieved: number;
  is_public: boolean;
  project: IProject;
  event: IEvent;
}

export interface IProduct extends IBase {
  name: string;
  slug: string;
  description: string;
  price: number;
  venture: IVenture;
  gallery: IImage[];
}

export interface ICategory extends IBase {
  name: string;
}

export interface IHighlight {
  programs?: IProgram[];
  subprograms?: ISubprogram[];
  events?: IEvent[];
  projects?: IProject[];
  articles?: IArticle[];
}

export type HighlightItem =
  | (IProgram & { sourceKey: 'programs' })
  | (ISubprogram & { sourceKey: 'subprograms' })
  | (IEvent & { sourceKey: 'events' })
  | (IProject & { sourceKey: 'projects' })
  | (IArticle & { sourceKey: 'articles' });

export interface IPhase extends IBase {
  name: string;
  description: string;
  started_at: Date;
  ended_at: Date;
  deliverables: IDeliverable[];
  /** Populated when the current user is a mentor on this project */
  mentors?: IMentorProfileSummary[];
  /** Mapped count from API (loadRelationCountAndMap) */
  participationsCount?: number;
}

export interface IDeliverable extends IBase {
  title: string;
  description: string;
  submissions?: IDeliverableSubmission[];
}

export interface IDeliverableSubmission extends IBase {
  file: string;
  deliverable: IDeliverable;
  participation?: { id: string };
}

/** Lightweight mentor profile returned inside phases */
export interface IMentorProfileSummary {
  id: string;
  owner: Pick<IUser, 'id' | 'name' | 'email' | 'profile'>;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'programs' | 'events' | 'entrepreneurs' | 'technical' | 'dashboard';
  open?: boolean;
}

// Mentor Profiles

export enum MentorStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface IMentorProfile extends IBase {
  years_experience: number;
  cv: string | null;
  status: MentorStatus;
  owner: IUser;
  experiences: IExperience[];
  expertises: IExpertise[];
}

export interface IExperience extends IBase {
  company_name: string;
  job_title: string;
  start_date: Date;
  end_date: Date | null;
  is_current: boolean;
  mentor_profile: IMentorProfile;
}

export interface IExpertise extends IBase {
  name: string;
  mentors_profiles: IMentorProfile[];
}

export interface CreateMentorProfileDto {
  years_experience: number;
  expertises: string[];
  experiences: CreateExperienceDto[];
}

export interface CreateExperienceDto {
  id?: string;
  company_name: string;
  job_title: string;
  is_current: boolean;
  start_date: Date | string;
  end_date?: Date | string | null;
}

export interface UpdateMentorProfileDto {
  years_experience?: number;
  expertises?: string[];
  experiences?: CreateExperienceDto[];
}

export interface FilterMentorsProfileDto {
  page?: string | null;
  q?: string | null;
  status?: MentorStatus | null;
}

export interface MentorDashboardStats {
  totalSessions: number;
  upcomingSessions: number;
  completedSessions: number;
  totalMentees: number;
  activeMentees: number;
  pendingRequests: number;
  averageRating: number;
}

// ============================================
// RESOURCES
// ============================================

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

export interface CreateResourceDto {
  title: string;
  description: string;
  category: ResourceCategory;
  tags?: string[];
  projectId?: string;
  phaseId?: string;
}

export interface UpdateResourceDto {
  title?: string;
  description?: string;
  category?: ResourceCategory;
  tags?: string[];
  projectId?: string;
  phaseId?: string;
}

export interface MentorDashboardStats2 {
  activeMentees: number;
  pendingRequests: number;
  averageRating: number;
}

export interface IMentorActivity extends IBase {
  type: 'session' | 'request' | 'message' | 'review';
  message: string;
  icon: string;
  date: Date;
  relatedEntityId?: string;
}

export interface IMentorRequest extends IBase {
  entrepreneur: IUser;
  mentor: IUser;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  expertise_requested: string;
}

export interface IMentorSession extends IBase {
  mentor: IUser;
  mentee: IUser;
  title: string;
  description: string;
  scheduled_at: Date;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  meeting_link?: string;
  notes?: string;
}

export interface IMentee extends IBase {
  user: IUser;
  mentor: IUser;
  status: 'active' | 'inactive' | 'completed';
  start_date: Date;
  end_date?: Date;
  total_sessions: number;
  last_session_date?: Date;
  progress_notes?: string;
}

// Participations (Candidatures aux programmes)

export enum ParticipationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  SHORTLISTED = 'shortlisted',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

/** D’après l’API : un upvote est lié à un user (pour dériver hasUserVoted). */
export interface IParticipationUpvote {
  user: Pick<IUser, 'id'>;
}

export interface IParticipation extends IBase {
  user?: IUser;
  project: IProject;
  phases?: IPhase[];
  venture: IVenture | null;
  upvotes?: IParticipationUpvote[];
  /** Populated in mentor detail view */
  deliverable_submissions?: IDeliverableSubmission[];
  /** Mapped count from API */
  upvotesCount?: number;
}

export interface IParticipationWithVote extends IParticipation {
  voteCount: number;
  hasUserVoted: boolean;
}
