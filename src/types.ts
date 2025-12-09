export interface MasData {
  base_prompt: string;
  timestamp: string;
  run_dir: string;
  intermediates_dir: string;
  final_images: string[];
  final_state: FinalState;
}

export interface FinalState {
  iteration: number;
  user_prompt: string;
  mood_report: any;
  visual_blueprint: any;
  conceptual_elements: any;
  final_draft: FinalDraft;
  squad_selection_instructions: any;
  squad_assignments: SquadAssignments;
  history: HistoryItem[];
}

export interface FinalDraft {
  main_prompt: string;
  negative_prompt: string;
  style_guidelines: string;
}

export interface SquadAssignments {
  harmonic: AgentInfo[];
  conflict: AgentInfo[];
  random: AgentInfo[];
}

export interface AgentInfo {
  id: string;
  name: string;
  display_name: string;
  prompt?: string;
  keywords?: string[];
  category?: string;
}

export interface HistoryItem {
  role: string;
  content: string;
}

// --- Timeline Visual Structures ---

export type AgentRoleType = 'interpreter' | 'visual' | 'concept' | 'orchestrator' | 'squad-member' | 'critic' | 'system';

export interface ValidTimelineEvent {
  id: string;
  type: 'thought' | 'dialogue' | 'prompt' | 'image' | 'critique' | 'info';
  agent: string;
  roleType: AgentRoleType;
  title: string;
  content: any;
  images?: string[];
  scores?: Record<string, any>; // For critics
  squadId?: 'harmonic' | 'conflict' | 'random';
}

export interface SquadSession {
  id: string;
  name: string;
  squadId: 'harmonic' | 'conflict' | 'random';
  events: ValidTimelineEvent[];      // The discussion events
  critiques: ValidTimelineEvent[];   // The critique events for this squad
  generatedImage?: string;           // The specific image for this squad
}

export interface TimelinePhase {
    id: string;
    title: string;
    type: 'setup' | 'round' | 'final';

    // For 'setup' (Phase 0)
    setupEvents?: ValidTimelineEvent[];

    // For 'round'
    roundIndex?: number;
    squads?: SquadSession[];         // Harmonic, Conflict, Random
    generation?: ValidTimelineEvent; // The specific SDXL event (containing 3 images)

    // For 'final'
    finalEvents?: ValidTimelineEvent[];
}
