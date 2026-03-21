import { useState } from 'react';

const mockIncidents = [
  {
    id: "INC-9042",
    title: "API Gateway OOMKilled",
    severity: "CRITICAL",
    status: "RESOLVED",
    agent: "Fixer",
    timestamp: "10 mins ago",
    root_cause: "Memory leak in /auth endpoint"
  },
  {
    id: "INC-9041",
    title: "Database CPU Spike",
    severity: "HIGH",
    status: "ANALYZING",
    agent: "Correlator",
    timestamp: "25 mins ago",
    root_cause: "Pending log correlation..."
  },
  {
    id: "INC-9040",
    title: "Kafka Consumer Lag",
    severity: "MEDIUM",
    status: "OPEN",
    agent: "Triage",
    timestamp: "1 hour ago",
    root_cause: "Pending"
  }
];

export default function Incidents() {
  const [incidents] = useState(mockIncidents);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-owl-red/20 text-owl-red border-owl-red/30';
      case 'HIGH': return 'bg-owl-yellow/20 text-owl-yellow border-owl-yellow/30';
      case 'MEDIUM': return 'bg-owl-blue/20 text-owl-blue border-owl-blue/30';
      default: return 'bg-owl-muted/20 text-owl-muted border-owl-muted/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'RESOLVED': return 'text-owl-green';
      case 'ANALYZING': return 'text-owl-purple animate-pulse';
      case 'OPEN': return 'text-owl-red';
      default: return 'text-owl-text';
    }
  };

  return (
    <div className="p-8 h-full max-h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-owl-purple tracking-tight">Incident Master List</h1>
          <p className="mt-2 text-owl-muted">All alerts processed by the NightOwl AI pipeline.</p>
        </div>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Search incidents..." 
            className="px-4 py-2 bg-owl-surface border border-owl-border rounded-lg text-owl-text placeholder-owl-muted focus:outline-none focus:border-owl-purple transition-colors"
          />
          <button className="px-4 py-2 bg-owl-purple text-[#ffffff] font-medium rounded-lg hover:bg-opacity-90 transition-all">
            Filter
          </button>
        </div>
      </div>

      <div className="bg-owl-surface border border-owl-border rounded-xl overflow-hidden shadow-xl shadow-black/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-owl-border bg-owl-surface/50">
              <th className="py-4 px-6 text-sm font-medium text-owl-muted uppercase tracking-wider">ID</th>
              <th className="py-4 px-6 text-sm font-medium text-owl-muted uppercase tracking-wider">Title & Root Cause</th>
              <th className="py-4 px-6 text-sm font-medium text-owl-muted uppercase tracking-wider">Severity</th>
              <th className="py-4 px-6 text-sm font-medium text-owl-muted uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 text-sm font-medium text-owl-muted uppercase tracking-wider">Active Agent</th>
              <th className="py-4 px-6 text-sm font-medium text-owl-muted uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-owl-border">
            {incidents.map((incident) => (
              <tr key={incident.id} className="hover:bg-owl-bg/50 transition-colors group cursor-pointer">
                <td className="py-4 px-6 text-owl-text font-mono text-sm">{incident.id}</td>
                <td className="py-4 px-6">
                  <div className="text-owl-text font-medium group-hover:text-owl-blue transition-colors">{incident.title}</div>
                  <div className="text-owl-muted text-sm mt-1">{incident.root_cause}</div>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded border ${getSeverityColor(incident.severity)}`}>
                    {incident.severity}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(incident.status).replace('text-', 'bg-')}`}></div>
                    <span className={`text-sm font-medium ${getStatusColor(incident.status)}`}>{incident.status}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-owl-muted text-sm">{incident.agent}</td>
                <td className="py-4 px-6 text-owl-muted text-sm whitespace-nowrap">{incident.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
