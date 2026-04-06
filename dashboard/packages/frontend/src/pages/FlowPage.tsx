// ============================================================
// FLOW PAGE
// Visual diagram of the agent chain and how agents interact.
// Shows the full sprint flow and when each agent is called.
// ============================================================

import React from 'react';
import { PageShell } from '../components/layout/PageShell';

// ---- Data: the 8 agents with their role and color ----
const AGENTS = [
  {
    id: 'orchestrator',
    label: 'Orchestrator',
    role: 'Coordinates all agents. Reads registry, routes work, tracks overall progress.',
    color: '#3b82f6',
    bg: '#3b82f615',
    border: '#3b82f640',
  },
  {
    id: 'planner',
    label: 'Planner',
    role: 'Turns the goal into a sprint plan with tasks, dependencies, and definition of done.',
    color: '#a855f7',
    bg: '#a855f715',
    border: '#a855f740',
  },
  {
    id: 'architect',
    label: 'Architect',
    role: 'Designs file structure, data flow, and technical decisions before any code is written.',
    color: '#06b6d4',
    bg: '#06b6d415',
    border: '#06b6d440',
  },
  {
    id: 'builder',
    label: 'Builder',
    role: 'Writes production code following the architecture plan. Runs typecheck. Produces build report.',
    color: '#22c55e',
    bg: '#22c55e15',
    border: '#22c55e40',
  },
  {
    id: 'verifier',
    label: 'Verifier',
    role: 'Runs typecheck, lint, tests. Traces logic. Checks definition of done. Gives PASS or FAIL.',
    color: '#eab308',
    bg: '#eab30815',
    border: '#eab30840',
  },
  {
    id: 'reviewer',
    label: 'Reviewer',
    role: 'Reads verified code for quality, clarity, safety, and match to plan. Never rewrites.',
    color: '#f97316',
    bg: '#f9731615',
    border: '#f9731640',
  },
];

// ---- Support agents (not in main chain) ----
const SUPPORT_AGENTS = [
  {
    id: 'analyst',
    label: 'Analyst',
    role: 'Reads existing code and reports findings. Called when something is unknown or broken.',
    color: '#06b6d4',
    bg: '#06b6d410',
    border: '#06b6d430',
    trigger: 'When error cause is unknown',
  },
  {
    id: 'debugger',
    label: 'Debugger',
    role: 'Finds root cause and applies minimal fix. Never deletes working code.',
    color: '#ef4444',
    bg: '#ef444415',
    border: '#ef444440',
    trigger: 'When Verifier FAIL or Reviewer flags critical issue',
  },
];

// ---- Arrow between main chain nodes ----
function Arrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-1 flex-shrink-0">
      {label && (
        <span className="text-white/25 font-mono text-xs whitespace-nowrap">{label}</span>
      )}
      <div className="flex items-center gap-0">
        <div className="w-8 h-px bg-white/20" />
        <div
          style={{
            width: 0, height: 0,
            borderTop: '4px solid transparent',
            borderBottom: '4px solid transparent',
            borderLeft: '6px solid rgba(255,255,255,0.2)',
          }}
        />
      </div>
    </div>
  );
}

// ---- A single agent box in the main chain ----
function AgentBox({ agent, step }: { agent: typeof AGENTS[0]; step: number }) {
  return (
    <div
      className="flex flex-col rounded-lg p-3 flex-shrink-0"
      style={{
        background: agent.bg,
        border: `1.5px solid ${agent.border}`,
        minWidth: 130,
        maxWidth: 150,
      }}
    >
      {/* Step number */}
      <div
        className="text-xs font-mono font-bold mb-1.5 self-start px-1.5 py-0.5 rounded"
        style={{ background: `${agent.color}25`, color: agent.color, fontSize: 9 }}
      >
        STEP {step}
      </div>
      {/* Name */}
      <div className="font-mono font-bold text-white text-xs mb-1" style={{ color: agent.color }}>
        {agent.label}
      </div>
      {/* Role */}
      <div className="font-mono text-white/40 leading-relaxed" style={{ fontSize: 9 }}>
        {agent.role}
      </div>
    </div>
  );
}

// ---- The final "commit" box ----
function CommitBox() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg p-3 flex-shrink-0"
      style={{
        background: '#22c55e10',
        border: '1.5px solid #22c55e40',
        minWidth: 100,
      }}
    >
      <div className="text-accent-green font-mono font-bold text-xs mb-1">commit</div>
      <div className="font-mono text-white/30" style={{ fontSize: 9 }}>Push to GitHub</div>
    </div>
  );
}

// ---- A support agent card (Analyst / Debugger) ----
function SupportAgentCard({ agent }: { agent: typeof SUPPORT_AGENTS[0] }) {
  return (
    <div
      className="rounded-lg p-4 flex-1"
      style={{
        background: agent.bg,
        border: `1.5px solid ${agent.border}`,
        minWidth: 0,
      }}
    >
      <div
        className="font-mono font-bold text-sm mb-1"
        style={{ color: agent.color }}
      >
        {agent.label}
      </div>
      <div
        className="font-mono text-white/20 text-xs mb-2 uppercase tracking-wider"
        style={{ fontSize: 9 }}
      >
        {agent.trigger}
      </div>
      <div className="font-mono text-white/50 text-xs leading-relaxed">
        {agent.role}
      </div>
    </div>
  );
}

// ---- Routing rule row ----
function RoutingRule({ from, to, condition }: { from: string; to: string; condition: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-surface-border last:border-0">
      <div className="font-mono text-accent text-xs flex-shrink-0 w-24">{from}</div>
      <div className="text-white/20 text-xs flex-shrink-0">→</div>
      <div className="font-mono text-accent-green text-xs flex-shrink-0 w-24">{to}</div>
      <div className="font-mono text-white/40 text-xs">{condition}</div>
    </div>
  );
}

// ---- Main page component ----
export function FlowPage() {
  return (
    <PageShell
      title="Agent Flow"
      subtitle="How the 8 agents interact in a sprint"
    >
      <div className="space-y-6">

        {/* ── Main chain ─────────────────────────────────────── */}
        <div>
          <div className="text-white/40 text-xs font-mono uppercase tracking-wider mb-4">
            Standard Sprint Flow
            <span className="ml-3 text-white/20 normal-case tracking-normal">
              new feature · happy path
            </span>
          </div>

          {/* Scrollable horizontal chain */}
          <div className="bg-surface-secondary border border-surface-border rounded-lg p-5 overflow-x-auto">
            <div className="flex items-center gap-0" style={{ minWidth: 'max-content' }}>
              {AGENTS.map((agent, i) => (
                <React.Fragment key={agent.id}>
                  <AgentBox agent={agent} step={i + 1} />
                  {i < AGENTS.length - 1 && <Arrow />}
                </React.Fragment>
              ))}
              <Arrow label="approved" />
              <CommitBox />
            </div>
          </div>
        </div>

        {/* ── Bug fix flow ────────────────────────────────────── */}
        <div>
          <div className="text-white/40 text-xs font-mono uppercase tracking-wider mb-4">
            Bug Fix Flow
            <span className="ml-3 text-white/20 normal-case tracking-normal">
              something is broken
            </span>
          </div>
          <div className="bg-surface-secondary border border-surface-border rounded-lg p-5 overflow-x-auto">
            <div className="flex items-center gap-0" style={{ minWidth: 'max-content' }}>
              {[
                { id: 'orchestrator', label: 'Orchestrator', role: 'Receives the error, reads registry, decides flow.', color: '#3b82f6', bg: '#3b82f615', border: '#3b82f640' },
                { id: 'analyst',      label: 'Analyst',      role: 'Reads the code, finds the cause, reports findings.', color: '#06b6d4', bg: '#06b6d415', border: '#06b6d440' },
                { id: 'debugger',     label: 'Debugger',     role: 'Applies the minimal fix to root cause only.', color: '#ef4444', bg: '#ef444415', border: '#ef444440' },
                { id: 'verifier',     label: 'Verifier',     role: 'Re-verifies that the fix worked. PASS required.', color: '#eab308', bg: '#eab30815', border: '#eab30840' },
              ].map((agent, i, arr) => (
                <React.Fragment key={agent.id}>
                  <AgentBox agent={agent} step={i + 1} />
                  {i < arr.length - 1 && <Arrow />}
                </React.Fragment>
              ))}
              <Arrow label="fixed" />
              <CommitBox />
            </div>
          </div>
        </div>

        {/* ── Verifier fail loop ──────────────────────────────── */}
        <div>
          <div className="text-white/40 text-xs font-mono uppercase tracking-wider mb-4">
            When Verifier Fails
            <span className="ml-3 text-white/20 normal-case tracking-normal">
              re-verification loop
            </span>
          </div>
          <div className="bg-surface-secondary border border-surface-border rounded-lg p-5">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Builder */}
              <div className="rounded-lg p-3 flex-shrink-0" style={{ background: '#22c55e15', border: '1.5px solid #22c55e40', minWidth: 120 }}>
                <div className="font-mono font-bold text-xs mb-1" style={{ color: '#22c55e' }}>Builder</div>
                <div className="font-mono text-white/40" style={{ fontSize: 9 }}>Writes the code</div>
              </div>
              <Arrow />
              {/* Verifier */}
              <div className="rounded-lg p-3 flex-shrink-0" style={{ background: '#eab30815', border: '1.5px solid #eab30840', minWidth: 120 }}>
                <div className="font-mono font-bold text-xs mb-1" style={{ color: '#eab308' }}>Verifier</div>
                <div className="font-mono text-white/40" style={{ fontSize: 9 }}>Checks it works</div>
              </div>

              {/* PASS branch */}
              <div className="flex flex-col gap-2 ml-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-px bg-accent-green/40" />
                  <span className="font-mono text-accent-green text-xs">PASS</span>
                  <div className="w-4 h-px bg-accent-green/40" />
                  <div className="rounded px-2 py-1 font-mono text-xs" style={{ background: '#f9731615', border: '1px solid #f9731640', color: '#f97316' }}>Reviewer</div>
                  <div className="w-4 h-px bg-white/20" />
                  <CommitBox />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-px bg-accent-red/40" />
                  <span className="font-mono text-accent-red text-xs">FAIL</span>
                  <div className="w-4 h-px bg-accent-red/40" />
                  <div className="rounded px-2 py-1 font-mono text-xs" style={{ background: '#ef444415', border: '1px solid #ef444440', color: '#ef4444' }}>Debugger</div>
                  <div className="flex items-center gap-1 text-white/25 font-mono text-xs ml-1">
                    <span>loops back to Verifier</span>
                    <span>↺</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Support agents ─────────────────────────────────── */}
        <div>
          <div className="text-white/40 text-xs font-mono uppercase tracking-wider mb-4">
            Support Agents
            <span className="ml-3 text-white/20 normal-case tracking-normal">
              called as needed, not in every sprint
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {SUPPORT_AGENTS.map(agent => (
              <SupportAgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>

        {/* ── Routing rules ──────────────────────────────────── */}
        <div>
          <div className="text-white/40 text-xs font-mono uppercase tracking-wider mb-3">
            Routing Rules
            <span className="ml-3 text-white/20 normal-case tracking-normal">
              when does each agent hand off to whom
            </span>
          </div>
          <div className="bg-surface-secondary border border-surface-border rounded-lg px-4 py-2">
            <RoutingRule from="Orchestrator" to="Planner"    condition="New feature or sprint goal received" />
            <RoutingRule from="Planner"      to="Architect"  condition="Sprint plan produced — complex feature" />
            <RoutingRule from="Architect"    to="Builder"    condition="Architecture plan produced" />
            <RoutingRule from="Builder"      to="Verifier"   condition="Build report produced — typecheck passed" />
            <RoutingRule from="Builder"      to="Debugger"   condition="Build report produced — typecheck FAILED" />
            <RoutingRule from="Verifier"     to="Reviewer"   condition="Verification PASS" />
            <RoutingRule from="Verifier"     to="Debugger"   condition="Verification FAIL — error or test failure" />
            <RoutingRule from="Verifier"     to="Builder"    condition="Verification FAIL — missing piece" />
            <RoutingRule from="Debugger"     to="Verifier"   condition="Fix applied — must re-verify before commit" />
            <RoutingRule from="Reviewer"     to="Debugger"   condition="Critical or major issue found" />
            <RoutingRule from="Reviewer"     to="Orchestrator" condition="Approved — ready for commit" />
            <RoutingRule from="Orchestrator" to="Analyst"    condition="Error with unknown cause before Debugger" />
            <RoutingRule from="Analyst"      to="Debugger"   condition="Root cause identified in analysis report" />
          </div>
        </div>

        {/* ── Key rules ──────────────────────────────────────── */}
        <div>
          <div className="text-white/40 text-xs font-mono uppercase tracking-wider mb-3">
            Key Rules
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { rule: 'Never call Builder without an architecture plan for complex features' },
              { rule: 'Never call Reviewer before Verifier has given a PASS verdict' },
              { rule: 'Never call Debugger without an error message or Analyst report' },
              { rule: 'Never call the same agent twice in a row for the same purpose' },
              { rule: 'Builder never commits — that is the /sprint command\'s job' },
              { rule: 'Verifier never modifies code — only reads and checks' },
              { rule: 'Analyst never modifies code — only reads and reports' },
              { rule: 'When unsure which agent to call: ask Luuk' },
            ].map(({ rule }) => (
              <div
                key={rule}
                className="flex items-start gap-2 bg-surface-secondary border border-surface-border rounded-lg px-3 py-2.5"
              >
                <span className="text-accent-green text-xs flex-shrink-0 mt-0.5">✓</span>
                <span className="font-mono text-white/50 text-xs leading-relaxed">{rule}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PageShell>
  );
}
