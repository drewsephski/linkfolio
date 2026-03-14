interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function ProgressIndicator({ steps, currentStep, className = '' }: ProgressIndicatorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs text-gray-400">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                index < currentStep
                  ? 'bg-green-600 text-green-100'
                  : index === currentStep
                  ? 'bg-blue-600 text-blue-100'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {index < currentStep ? '✓' : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-2 ${
                  index < currentStep ? 'bg-green-600' : 'bg-gray-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="text-center text-sm text-gray-300">
        {steps[currentStep]}
      </div>
    </div>
  );
}
