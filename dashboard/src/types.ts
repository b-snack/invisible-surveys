export interface Session {
  _id: string;
  session_id: string;
  started_at: string;
  page_url: string;
  created_at?: string;
}

export interface Event {
  _id: string;
  session_id: string;
  type: string;
  timestamp: string;
  data: any;
}

export interface Metrics {
  total_clicks: number;
  rage_clicks: number;
  mouse_movements: number;
  scroll_events: number;
  keyboard_events: number;
  navigation_events: number;
  visibility_events: number;
}

export interface HeatmapData {
  mouse_movements: Array<{
    _id: string;
    data: { x: number; y: number };
    timestamp: string;
  }>;
  clicks: Array<{
    _id: string;
    type: string;
    data: { x: number; y: number; element?: string };
    timestamp: string;
  }>;
}

export interface AIAnalysis {
  main_problem: string;
  insights: string[];
  recommendations: string[];
}
