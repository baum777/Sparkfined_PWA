import React from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactElement;
  className?: string;
}

export function FormField({ 
  label, 
  error, 
  hint, 
  required, 
  children, 
  className = '' 
}: FormFieldProps) {
  const childId = children.props.id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label 
        htmlFor={childId}
        className="block text-sm font-medium text-text-primary"
      >
        {label}
        {required && <span className="text-sentiment-bear ml-1">*</span>}
      </label>

      {/* Input */}
      <div className="relative">
        {React.cloneElement(children, {
          id: childId,
          'aria-invalid': error ? 'true' : 'false',
          'aria-describedby': error ? `${childId}-error` : hint ? `${childId}-hint` : undefined,
          className: `${children.props.className || ''} ${
            error ? 'border-sentiment-bear focus:border-sentiment-bear focus:ring-sentiment-bear' : ''
          }`,
        })}
        
        {/* Error Icon */}
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-sentiment-bear" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
      </div>

      {/* Hint or Error Message */}
      {error ? (
        <p id={`${childId}-error`} className="text-sm text-sentiment-bear flex items-start gap-1.5">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      ) : hint ? (
        <p id={`${childId}-hint`} className="text-xs text-text-tertiary">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

// Input with built-in validation
export function ValidatedInput({
  value,
  onChange,
  onBlur,
  validation,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onBlur'> & {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | undefined;
  };
}) {
  const [error, setError] = React.useState<string>();
  const [touched, setTouched] = React.useState(false);

  const validate = React.useCallback((val: string) => {
    if (!validation) return;

    if (validation.required && !val.trim()) {
      return 'This field is required';
    }

    if (validation.minLength && val.length < validation.minLength) {
      return `Minimum ${validation.minLength} characters required`;
    }

    if (validation.maxLength && val.length > validation.maxLength) {
      return `Maximum ${validation.maxLength} characters allowed`;
    }

    if (validation.pattern && !validation.pattern.test(val)) {
      return 'Invalid format';
    }

    if (validation.custom) {
      return validation.custom(val);
    }
  }, [validation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (touched) {
      setError(validate(newValue));
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validate(value));
    onBlur?.();
  };

  return (
    <div className="relative">
      <input
        {...props}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`
          input
          ${error && touched ? 'border-sentiment-bear focus:border-sentiment-bear focus:ring-sentiment-bear' : ''}
          ${props.className || ''}
        `}
        aria-invalid={error && touched ? 'true' : 'false'}
      />
      {error && touched && (
        <p className="mt-2 text-sm text-sentiment-bear flex items-start gap-1.5">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// Character counter for inputs
export function CharacterCounter({ 
  current, 
  max 
}: { 
  current: number; 
  max: number; 
}) {
  const percentage = (current / max) * 100;
  const isWarning = percentage >= 80;
  const isError = percentage >= 100;

  return (
    <div className="flex items-center justify-between text-xs">
      <span className={`font-medium ${
        isError ? 'text-sentiment-bear' : 
        isWarning ? 'text-sentiment-neutral' : 
        'text-text-tertiary'
      }`}>
        {current} / {max}
      </span>
      {/* Progress bar */}
      <div className="flex-1 ml-3 h-1 bg-surface-elevated rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-200 ${
            isError ? 'bg-sentiment-bear' :
            isWarning ? 'bg-sentiment-neutral' :
            'bg-brand'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
