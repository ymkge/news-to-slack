
import React from 'react';
import { ProcessStatus } from '../types';
import { CheckCircleIcon, XCircleIcon, LoaderIcon, PendingIcon } from './icons';
import CodeBlock from './CodeBlock';

interface ProcessStepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: ProcessStatus;
  content: string | null;
  contentType: 'json' | 'text';
}

const statusConfig = {
  pending: {
    icon: <PendingIcon className="h-6 w-6 text-slate-500" />,
    borderColor: 'border-slate-700',
    bgColor: 'bg-slate-800/30',
    textColor: 'text-slate-500',
    label: 'Pending',
  },
  'in-progress': {
    icon: <LoaderIcon className="h-6 w-6 text-blue-400 animate-spin" />,
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-900/30',
    textColor: 'text-blue-400',
    label: 'In Progress',
  },
  completed: {
    icon: <CheckCircleIcon className="h-6 w-6 text-green-400" />,
    borderColor: 'border-green-500',
    bgColor: 'bg-green-900/30',
    textColor: 'text-green-400',
    label: 'Completed',
  },
  error: {
    icon: <XCircleIcon className="h-6 w-6 text-red-400" />,
    borderColor: 'border-red-500',
    bgColor: 'bg-red-900/30',
    textColor: 'text-red-400',
    label: 'Error',
  },
  success: {
    icon: <CheckCircleIcon className="h-6 w-6 text-green-400" />,
    borderColor: 'border-green-500',
    bgColor: 'bg-green-900/30',
    textColor: 'text-green-400',
    label: 'Success',
  },
};

const ProcessStepCard: React.FC<ProcessStepCardProps> = ({
  icon,
  title,
  description,
  status,
  content,
  contentType,
}) => {
  const config = statusConfig[status];

  return (
    <div className={`border ${config.borderColor} ${config.bgColor} rounded-xl shadow-lg transition-all duration-300`}>
      <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:gap-5">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-slate-700/50 flex items-center justify-center mb-4 sm:mb-0">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-slate-100">{title}</h3>
          <p className="text-slate-400">{description}</p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          {config.icon}
          <span className={`font-medium ${config.textColor}`}>{config.label}</span>
        </div>
      </div>
      {content && (
        <div className="border-t border-slate-700/50 p-5">
          <CodeBlock language={contentType} code={content} />
        </div>
      )}
    </div>
  );
};

export default ProcessStepCard;
