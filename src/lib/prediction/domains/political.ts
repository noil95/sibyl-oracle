// Political domain prediction logic
// This is a thin wrapper that re-exports the existing Phase 1 engine
// for backward compatibility. Political predictions continue using
// the candidate-based flow (elections + candidates tables).

export { computePrediction, type Signal, type PredictionResult } from "../engine";
