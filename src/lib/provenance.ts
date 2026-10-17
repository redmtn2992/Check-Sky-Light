/**
 * Check Sky Light: Data Provenance & Analysis Status Types
 * Formulated under Phase 0 Peer-Review Consensus (Claude, Luna, Gemini)
 */

export type DataProvenance =
  | 'live'
  | 'live_with_simulated_fallback' // transitional only
  | 'simulated'
  | 'user_entered'
  | 'model_generated'
  | 'not_integrated'
  | 'unavailable';

export interface AnalysisUnavailable {
  status: 'analysis_unavailable';
  reason: string;
  data_provenance: 'unavailable';
}

export interface AnalysisOk<T> {
  status: 'ok';
  data_provenance: 'model_generated';
  model: string;
  kb_version: string;
  result: T;
}

export type AnalysisResponse<T> = AnalysisOk<T> | AnalysisUnavailable;

export const unavailable = (reason: string): AnalysisUnavailable => ({
  status: 'analysis_unavailable',
  reason,
  data_provenance: 'unavailable',
});

export type MatchBasis =
  | 'media_hash'          // perceptual or exact hash of official release
  | 'canonical_url'       // exact URL of official record or DVIDS asset
  | 'official_id_in_text' // user-entered text; identity unconfirmed
  ;

export interface KnownCaseMatch {
  record: {
    caseId: string;
    title: string;
    url: string;
    isUnresolved: boolean;
    officialVerdict: string;
    reportingAgency?: string;
    sensorSystem?: string;
  };
  basis: MatchBasis;
  identity: 'confirmed' | 'unconfirmed';
}

export interface VerificationRecord {
  method:
    | 'http_fetch_ok'
    | 'doi_resolved'
    | 'document_read'
    | 'human_manual_check'
    | 'search_snippet_only'
    | 'model_recall_only';
  checked_by: string;
  checked_at: string;
  fields_checked: string[];
  result: 'confirmed' | 'mismatch' | 'inconclusive';
  note?: string;
}
