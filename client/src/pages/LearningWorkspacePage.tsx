import React, { useState } from 'react';
import {
  LearningGoal,
  Task,
  Prediction,
  EvaluationOutcome,
  RoadmapNode,
  AIExplanationResponse
} from '../types/contract';
import { STARTER_TASK, VARIANT_TASK, INITIAL_ROADMAP_NODES } from '../data/tasks';
import { runMockEvaluation } from '../lib/mockEngine';
import { apiClient } from '../lib/api';
import { Header } from '../components/Layout/Header';
import { RoadmapView } from '../components/Roadmap/RoadmapView';
import { TaskHeader } from '../components/Workspace/TaskHeader';
import { SchemaViewer } from '../components/Schema/SchemaViewer';
import { PredictionGate } from '../components/Workspace/PredictionGate';
import { SqlEditor } from '../components/Workspace/SqlEditor';
import { ResultComparisonView } from '../components/Results/ResultComparisonView';
import { InterventionPanel } from '../components/Interventions/InterventionPanel';

interface LearningWorkspacePageProps {
  goal: LearningGoal;
  onRestartGoal: () => void;
}

export const LearningWorkspacePage: React.FC<LearningWorkspacePageProps> = ({
  goal,
  onRestartGoal
}) => {
  const [task, setTask] = useState<Task>(STARTER_TASK);
  const [roadmap, setRoadmap] = useState<RoadmapNode[]>(INITIAL_ROADMAP_NODES);
  const [userSql, setUserSql] = useState<string>(STARTER_TASK.starterSql);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [outcome, setOutcome] = useState<EvaluationOutcome | null>(null);
  const [submittedSql, setSubmittedSql] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<AIExplanationResponse | null>(null);
  const [schemaOpen, setSchemaOpen] = useState<boolean>(true);
  const [remainingMinutes, setRemainingMinutes] = useState<number>(goal.estimatedMinutes);

  // Active roadmap topic label
  const activeNode = roadmap.find((n) => n.id === task.nodeId);
  const activeNodeLabel = activeNode ? activeNode.label : 'SELECT';

  // Run Query handler via development mock adapter
  const handleRunQuery = async () => {
    if (!prediction || isRunning) return;

    setIsRunning(true);
    setSubmittedSql(userSql);

    try {
      let evaluationResult: EvaluationOutcome;
      try {
        evaluationResult = await apiClient.submitAttempt({
          taskId: task.id,
          sql: userSql,
          prediction
        });
      } catch {
        evaluationResult = await runMockEvaluation(
          task,
          userSql,
          prediction,
          { simulatedDelayMs: 400 },
          roadmap
        );
      }
      setOutcome(evaluationResult);
      setRoadmap(evaluationResult.roadmap);
      setRemainingMinutes(evaluationResult.remainingMinutes);

      // Request or format explanation if gap or mirage occurred
      if (evaluationResult.state === 'mirage' || evaluationResult.state === 'honest_gap') {
        try {
          const aiResponse = await apiClient.requestExplanation({
            taskId: task.id,
            sql: userSql,
            outcome: evaluationResult
          });
          setAiExplanation(aiResponse);
        } catch {
          // Graceful template fallback
          setAiExplanation({
            text: evaluationResult.diagnosis,
            source: 'template',
            fallbackUsed: true
          });
        }
      } else {
        setAiExplanation(null);
      }
    } catch (err) {
      console.error('Mock evaluation error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  // Reset to edit mode for current task
  const handleRetryTask = () => {
    setOutcome(null);
    setSubmittedSql(null);
  };

  // Reset starter query
  const handleResetStarter = () => {
    setUserSql(task.starterSql);
  };

  // Reset prediction specifically
  const handleResetPrediction = () => {
    setPrediction(null);
    setOutcome(null);
    setSubmittedSql(null);
  };

  // Apply contrast query to editor
  const handleApplyContrastSql = (sql: string) => {
    setUserSql(sql);
    setOutcome(null);
    setSubmittedSql(null);
  };

  // Launch variant retry task
  const handleLaunchVariantTask = () => {
    setTask(VARIANT_TASK);
    setUserSql(VARIANT_TASK.starterSql);
    setPrediction(null); // Fresh prediction required!
    setOutcome(null);
    setSubmittedSql(null);
    setAiExplanation(null);
  };

  const hasVariant = Boolean(task.variantTaskId || task.id === 'task-select-01');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', paddingBottom: '3rem' }}>
      {/* Header */}
      <Header
        goal={goal}
        remainingMinutes={remainingMinutes}
        onRestartGoal={onRestartGoal}
      />

      {/* 5-Node SQL Roadmap with Adaptive Re-check Support */}
      <RoadmapView
        nodes={roadmap}
        activeNodeId={task.nodeId}
      />

      {/* Workspace Main Grid (Desktop 1280x720 split layout) */}
      <main
        style={{
          display: 'grid',
          gridTemplateColumns: schemaOpen ? 'minmax(0, 1fr) 340px' : 'minmax(0, 1fr) 50px',
          gap: '1.5rem',
          alignItems: 'start',
          transition: 'grid-template-columns 0.2s ease'
        }}
      >
        {/* Left / Primary Column: Task, Prediction, Editor & Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Active Task Header */}
          <TaskHeader
            task={task}
            nodeLabel={activeNodeLabel}
          />

          {/* Prediction Gate (Step 1) */}
          <PredictionGate
            prediction={prediction}
            onSelectPrediction={setPrediction}
            isLocked={Boolean(outcome)}
            onResetPrediction={handleResetPrediction}
          />

          {/* SQL Editor (Step 2) */}
          {!outcome && (
            <SqlEditor
              value={userSql}
              onChange={setUserSql}
              prediction={prediction}
              isRunning={isRunning}
              onRunQuery={handleRunQuery}
              onResetStarter={handleResetStarter}
            />
          )}

          {/* Results Comparison View */}
          {outcome && submittedSql && (
            <ResultComparisonView
              outcome={outcome}
              submittedSql={submittedSql}
              prediction={prediction}
              orderMatters={task.orderMatters}
            />
          )}

          {/* State-Specific Intervention Panel (Mirage, Honest Gap, Hidden Strength, Proven, Slip) */}
          {outcome && (
            <InterventionPanel
              outcome={outcome}
              prediction={prediction}
              contrastExample={outcome.contrastExample || task.contrastExample}
              hasVariantTask={hasVariant}
              onRetryTask={handleRetryTask}
              onLaunchVariantTask={handleLaunchVariantTask}
              onApplyContrastSql={handleApplyContrastSql}
              aiExplanation={aiExplanation}
            />
          )}
        </div>

        {/* Right Column: Database Schema Viewer */}
        <div style={{ position: 'sticky', top: '1rem' }}>
          <SchemaViewer
            schema={task.schema}
            isOpen={schemaOpen}
            onToggle={() => setSchemaOpen(!schemaOpen)}
          />
        </div>
      </main>
    </div>
  );
};
