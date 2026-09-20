import React, { useRef, useState } from 'react';
import { LIMITS } from '../config/limits';
import { UploadCloud, FileArchive, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface ZipDropzoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  error?: string | null;
  onError?: (msg: string | null) => void;
  disabled?: boolean;
}

export const ZipDropzone: React.FC<ZipDropzoneProps> = ({
  selectedFile,
  onFileSelect,
  error,
  onError,
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    if (onError) onError(null);

    // Validate extension
    const isZip = file.name.toLowerCase().endsWith('.zip') || file.type.includes('zip');
    if (!isZip) {
      if (onError) onError('Invalid file format. Please upload a standard .zip archive.');
      return;
    }

    // Validate size
    if (file.size > LIMITS.MAX_ZIP_SIZE_BYTES) {
      if (onError) {
        onError(
          `Archive exceeds the maximum ${LIMITS.MAX_ZIP_SIZE_MB}MB size limit (file is ${(file.size / 1024 / 1024).toFixed(1)}MB). Please remove node_modules and .git folders.`
        );
      }
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label
        style={{
          display: 'block',
          fontSize: '0.9rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '0.5rem'
        }}
      >
        Solution Archive (.zip)
      </label>

      {/* Hidden native input */}
      <input
        ref={inputRef}
        type="file"
        accept=".zip,application/zip"
        onChange={handleInputChange}
        disabled={disabled}
        style={{ display: 'none' }}
        id="zip-file-input"
      />

      {!selectedFile ? (
        <div
          tabIndex={disabled ? -1 : 0}
          role="button"
          aria-label="Upload solution ZIP archive. Drag and drop file here or press Enter to browse"
          onKeyDown={handleKeyDown}
          onClick={() => !disabled && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            border: `2px dashed ${
              isDragOver
                ? 'var(--byte-accent-bright)'
                : error
                ? 'var(--status-failed)'
                : 'var(--border-medium)'
            }`,
            borderRadius: '12px',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            background: isDragOver
              ? 'rgba(34, 197, 121, 0.08)'
              : 'rgba(255, 255, 255, 0.02)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 121, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}
          >
            <UploadCloud
              style={{
                width: '26px',
                height: '26px',
                color: isDragOver ? 'var(--byte-accent-bright)' : 'var(--byte-accent)'
              }}
            />
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Click or drag & drop your solution ZIP here
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Max file size: {LIMITS.MAX_ZIP_SIZE_MB} MB • Must contain project root files
          </div>
        </div>
      ) : (
        /* Selected File Card */
        <div
          className="byte-card"
          style={{
            padding: '1rem clamp(0.75rem, 2vw, 1.5rem)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            borderColor: 'var(--border-accent)',
            background: 'rgba(34, 197, 121, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 200px', minWidth: 0 }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(34, 197, 121, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <FileArchive style={{ width: '20px', height: '20px', color: 'var(--byte-accent)' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  wordBreak: 'break-all'
                }}
              >
                <span>{selectedFile.name}</span>
                <CheckCircle2 style={{ width: '15px', height: '15px', color: 'var(--byte-accent)', flexShrink: 0 }} />
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)'
                }}
              >
                {formatFileSize(selectedFile.size)} • Ready for verification
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onFileSelect(null)}
            disabled={disabled}
            className="byte-btn byte-btn-secondary byte-btn-sm byte-mobile-w-full"
            style={{ padding: '0.4rem 0.6rem' }}
            title="Remove selected file"
          >
            <X style={{ width: '15px', height: '15px' }} />
            <span>Remove</span>
          </button>
        </div>
      )}

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '0.6rem',
            color: 'var(--status-failed)',
            fontSize: '0.8125rem'
          }}
        >
          <AlertCircle style={{ width: '15px', height: '15px', flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
