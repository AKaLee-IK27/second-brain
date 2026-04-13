import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../state/app-store';
import { api } from '../services/api';

function SetupPage() {
  const navigate = useNavigate();
  const { setDataRoot, setLoading, setError, isLoading, error } = useAppStore();
  const [path, setPath] = useState('');
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [validationMessage, setValidationMessage] = useState('');

  const isValidPath = path.trim().length > 0;

  const handleValidate = useCallback(async () => {
    if (!path.trim()) return;

    setValidationStatus('validating');
    setValidationMessage('');

    try {
      const result = await api.config.validateRoot(path.trim());
      if (result.valid) {
        setValidationStatus('valid');
        setValidationMessage(
          `Valid knowledge base found: ${result.contentTypes.join(', ')}`,
        );
      } else {
        setValidationStatus('invalid');
        setValidationMessage(result.error || 'Folder does not contain valid knowledge files.');
      }
    } catch (err) {
      setValidationStatus('invalid');
      setValidationMessage(err instanceof Error ? err.message : 'Validation failed.');
    }
  }, [path]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPath) return;

    setLoading(true);
    setError(null);

    try {
      await api.config.setDataRoot(path.trim());
      setDataRoot(path.trim());
      navigate('/sessions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set data root.');
    } finally {
      setLoading(false);
    }
  }, [path, isValidPath, setDataRoot, setLoading, setError, navigate]);

  return (
    <div className="h-screen flex items-center justify-center bg-sb-bg p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🧠</div>
          <h1 className="text-2xl font-semibold text-sb-text tracking-tight">
            AKL's Knowledge
          </h1>
          <p className="text-sb-text-secondary mt-2">
            Choose the folder containing your knowledge files
          </p>
        </div>

        {/* Card */}
        <div className="sb-card p-6 bg-sb-surface">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Path Input */}
              <div>
                <label
                  htmlFor="data-root-path"
                  className="block text-sm font-medium text-sb-text-secondary mb-1.5"
                >
                  Knowledge Base Path
                </label>
                <div className="flex gap-2">
                  <input
                    id="data-root-path"
                    type="text"
                    value={path}
                    onChange={(e) => {
                      setPath(e.target.value);
                      setValidationStatus('idle');
                      setValidationMessage('');
                    }}
                    placeholder="/Users/you/knowledge-base"
                    className="sb-input flex-1 bg-sb-bg text-sb-text placeholder-sb-text-muted"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    onClick={handleValidate}
                    disabled={!isValidPath || validationStatus === 'validating'}
                    className="sb-btn px-3 py-2 text-sm whitespace-nowrap disabled:opacity-50"
                  >
                    {validationStatus === 'validating' ? '...' : 'Browse'}
                  </button>
                </div>
              </div>

              {/* Validation Status */}
              {validationStatus !== 'idle' && (
                <div
                  className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md ${
                    validationStatus === 'valid'
                      ? 'bg-sb-green-tint text-sb-success'
                      : validationStatus === 'invalid'
                        ? 'bg-sb-error/10 text-sb-error'
                        : 'text-sb-text-secondary'
                  }`}
                >
                  {validationStatus === 'valid' && <span>✓</span>}
                  {validationStatus === 'invalid' && <span>✗</span>}
                  {validationStatus === 'validating' && <span>⟳</span>}
                  <span>{validationMessage}</span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-sb-error/10 text-sb-error">
                  <span>✗</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Connect Button */}
              <button
                type="submit"
                disabled={!isValidPath || isLoading}
                className="sb-btn sb-btn-accent w-full py-2.5 text-sm font-medium disabled:opacity-50"
              >
                {isLoading ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <p className="text-center text-xs text-sb-text-muted mt-4">
          The folder should contain sessions/, agents/, skills/, topics/, or configs/ subdirectories.
        </p>
      </div>
    </div>
  );
}

export default SetupPage;
