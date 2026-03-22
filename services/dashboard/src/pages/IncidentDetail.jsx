import { useState } from 'react';

export default function IncidentDetail({ incidentId }) {
  return (
    <div className="flex-1 overflow-y-auto p-12 relative h-full">
      <div className="mb-8 flex items-center gap-4">
        <a href="/incidents" className="p-2 hover:bg-surface-container-high rounded-md transition-colors text-on-surface-variant flex items-center justify-center">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
        </a>
        <h2 className="text-3xl font-extrabold tracking-tight text-white font-headline">
          Incident: {incidentId}
        </h2>
      </div>
      <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10">
        <p className="text-on-surface-variant font-sans">
          This is the detailed view for {incidentId}.
          We will populate this with real incident data, logs, and agent chat in the next tasks.
        </p>
      </div>
    </div>
  );
}
