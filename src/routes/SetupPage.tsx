import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../state/app-store';
import { api } from '../services/api';
import { MaterialIcon } from '../components/shared/MaterialIcon';

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
    <div className="h-screen flex items-center justify-center bg-background p-6 overflow-hidden relative">
      {/* Ambient Background Decoration */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-24 w-[500px] h-[500px] bg-secondary-container/5 blur-[150px] rounded-full" />
      </div>

      {/* Setup Container */}
      <div className="w-full max-w-2xl relative z-10">
        {/* Branding */}
        <div className="flex items-center justify-center mb-12 space-x-3">
          <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg shadow-lg shadow-primary/20">
            <MaterialIcon name="psychology" size={24} className="text-on-primary-container" />
          </div>
          <h1 className="text-2xl font-headline font-bold tracking-tight text-on-surface uppercase">
            Monolithic Lexicon
          </h1>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-1 rounded-full bg-primary shadow-[0_0_15px_rgba(88,166,255,0.4)]" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-primary">01 Initialization</span>
          </div>
          <div className="flex items-center space-x-2 opacity-30">
            <div className="w-8 h-1 rounded-full bg-outline-variant" />
            <span className="font-mono text-[10px] uppercase tracking-widest">02 Indexing</span>
          </div>
          <div className="flex items-center space-x-2 opacity-30">
            <div className="w-8 h-1 rounded-full bg-outline-variant" />
            <span className="font-mono text-[10px] uppercase tracking-widest">03 Finalize</span>
          </div>
        </div>

        {/* Onboarding Card */}
        <div className="glass-panel border border-outline-variant/15 rounded-xl overflow-hidden shadow-2xl">
          {/* Content Header */}
          <div className="p-8 pb-4">
            <h2 className="text-3xl font-headline font-bold text-on-surface mb-2">Connect Your Knowledge</h2>
            <p className="font-serif text-on-surface-variant leading-relaxed">
              To begin the archival process, please point Lexicon to the local directory containing your documentation, notes, and research vaults.
            </p>
          </div>

          {/* Input Area */}
          <div className="px-8 py-6">
            <form onSubmit={handleSubmit}>
              <div className="group relative">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">Knowledge Base Path</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 font-mono text-primary">&gt;</span>
                  <input
                    type="text"
                    value={path}
                    onChange={(e) => {
                      setPath(e.target.value);
                      setValidationStatus('idle');
                      setValidationMessage('');
                    }}
                    placeholder="e.g. /home/documents/knowledge"
                    className="w-full bg-surface-container-lowest border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors duration-200 pl-10 pr-12 py-4 font-mono text-sm text-on-surface placeholder:text-outline-variant/50"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    onClick={handleValidate}
                    disabled={!isValidPath || validationStatus === 'validating'}
                    className="absolute right-2 p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-colors disabled:opacity-50"
                  >
                    <MaterialIcon name="folder_open" size={20} />
                  </button>
                </div>
                <p className="mt-4 font-mono text-[10px] text-outline flex items-center">
                  <MaterialIcon name="info" size={14} className="mr-1" />
                  Lexicon supports Markdown, PDF, and JSON schemas.
                </p>
              </div>

              {/* Validation Status */}
              {validationStatus !== 'idle' && (
                <div className={`mt-4 flex items-center gap-2 text-sm px-3 py-2 rounded-md ${
                  validationStatus === 'valid'
                    ? 'bg-tertiary/10 text-tertiary'
                    : validationStatus === 'invalid'
                      ? 'bg-error/10 text-error'
                      : 'text-on-surface-variant'
                }`}>
                  <MaterialIcon name={validationStatus === 'valid' ? 'check_circle' : validationStatus === 'invalid' ? 'error' : 'refresh'} size={16} />
                  <span>{validationMessage}</span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-4 flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-error/10 text-error">
                  <MaterialIcon name="error" size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* CTA Footer */}
              <div className="mt-6 px-8 py-6 bg-surface-container-high/50 border-t border-outline-variant/15 flex items-center justify-between -mx-8 -mb-8">
                <button type="button" className="text-sm font-label font-medium text-outline-variant hover:text-on-surface transition-colors">
                  Advanced Settings
                </button>
                <button
                  type="submit"
                  disabled={!isValidPath || isLoading}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-br from-primary to-primary-container text-on-primary-container rounded-lg font-headline font-bold transition-transform active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{isLoading ? 'Connecting...' : 'Initialize Link'}</span>
                  <MaterialIcon name="arrow_forward" size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="mt-8 flex justify-between items-center px-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-outline">Security Protocol: Local Encryption Active</p>
          <div className="flex space-x-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-outline hover:text-primary transition-colors cursor-default">v1.2.0-stable</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SetupPage;
