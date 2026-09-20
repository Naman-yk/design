import React from 'react';
import { StageStatus } from '../types/api';
import {
  CheckCircle2,
  Clock,
  Lock,
  PlayCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  HelpCircle,
  Calendar
} from 'lucide-react';

interface StatusBadgeProps {
  status: StageStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2'
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'passed':
        return {
          label: 'VERIFIED',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
          style: {
            backgroundColor: 'var(--status-passed-bg)',
            borderColor: 'var(--status-passed-border)',
            color: 'var(--status-passed)'
          }
        };
      case 'unlocked':
        return {
          label: 'READY TO START',
          icon: <PlayCircle className="w-3.5 h-3.5 text-sky-400" />,
          style: {
            backgroundColor: 'var(--status-unlocked-bg)',
            borderColor: 'var(--status-unlocked-border)',
            color: 'var(--status-unlocked)'
          }
        };
      case 'in_progress':
        return {
          label: 'IN PROGRESS',
          icon: <PlayCircle className="w-3.5 h-3.5 text-sky-400" />,
          style: {
            backgroundColor: 'var(--status-in-progress-bg)',
            borderColor: 'var(--status-in-progress-border)',
            color: 'var(--status-in-progress)'
          }
        };
      case 'queued':
        return {
          label: 'IN QUEUE',
          icon: <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />,
          style: {
            backgroundColor: 'var(--status-queued-bg)',
            borderColor: 'var(--status-queued-border)',
            color: 'var(--status-queued)'
          }
        };
      case 'verifying':
        return {
          label: 'RUNNING CHECKS',
          icon: <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />,
          style: {
            backgroundColor: 'var(--status-verifying-bg)',
            borderColor: 'var(--status-verifying-border)',
            color: 'var(--status-verifying)'
          }
        };
      case 'failed':
        return {
          label: 'CHANGES NEEDED',
          icon: <XCircle className="w-3.5 h-3.5 text-rose-400" />,
          style: {
            backgroundColor: 'var(--status-failed-bg)',
            borderColor: 'var(--status-failed-border)',
            color: 'var(--status-failed)'
          }
        };
      case 'needs_review':
        return {
          label: 'NEEDS REVIEW',
          icon: <HelpCircle className="w-3.5 h-3.5 text-amber-400" />,
          style: {
            backgroundColor: 'var(--status-review-bg)',
            borderColor: 'var(--status-review-border)',
            color: 'var(--status-review)'
          }
        };
      case 'infra_error':
        return {
          label: 'TECHNICAL ISSUE',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-pink-400" />,
          style: {
            backgroundColor: 'var(--status-infra-bg)',
            borderColor: 'var(--status-infra-border)',
            color: 'var(--status-infra)'
          }
        };
      case 'scheduled':
        return {
          label: 'SCHEDULED',
          icon: <Calendar className="w-3.5 h-3.5 text-neutral-400" />,
          style: {
            backgroundColor: 'var(--status-locked-bg)',
            borderColor: 'var(--status-locked-border)',
            color: 'var(--status-locked)'
          }
        };
      case 'locked':
      default:
        return {
          label: 'LOCKED',
          icon: <Lock className="w-3.5 h-3.5 text-neutral-400" />,
          style: {
            backgroundColor: 'var(--status-locked-bg)',
            borderColor: 'var(--status-locked-border)',
            color: 'var(--status-locked)'
          }
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold border tracking-wider uppercase font-mono ${sizeClasses[size]} ${className}`}
      style={config.style}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
