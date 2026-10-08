'use client';

import React, { useState } from 'react';
import { removeBackgroundFromImage } from '@/lib/backgroundRemoval';

interface PersonImageUploadFieldProps {
  initialUrl?: string;
  name?: string;
}

export function PersonImageUploadField({ initialUrl = '', name = 'Researcher' }: PersonImageUploadFieldProps) {
  const [imageUrl, setImageUrl] = useState<string>(initialUrl);
  const [previewUrl, setPreviewUrl] = useState<string>(initialUrl);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [autoRemoveBg, setAutoRemoveBg] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showManualUrl, setShowManualUrl] = useState<boolean>(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatusMessage(autoRemoveBg ? 'Detecting and removing background...' : 'Uploading photo to Vercel Storage...');

    try {
      let fileToUpload: File = file;

      if (autoRemoveBg) {
        try {
          const { dataUrl, blob } = await removeBackgroundFromImage(file);
          setPreviewUrl(dataUrl);
          const cleanFileName = file.name.replace(/\.[^/.]+$/, '') + '-cutout.png';
          fileToUpload = new File([blob], cleanFileName, { type: 'image/png' });
          setStatusMessage('Uploading cutout to Vercel Storage...');
        } catch (bgErr) {
          console.warn('Background removal skipped, uploading original:', bgErr);
          setStatusMessage('Uploading to Vercel Storage...');
        }
      } else {
        setPreviewUrl(URL.createObjectURL(file));
      }

      // Upload fileToUpload to Vercel Storage (/api/upload)
      const formData = new FormData();
      formData.append('file', fileToUpload);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success && data.url) {
        setImageUrl(data.url);
        setPreviewUrl(data.url);
        setStatusMessage(
          data.storage === 'vercel-blob'
            ? '✓ Successfully uploaded to Vercel Storage!'
            : '✓ Photo saved successfully!'
        );
      } else {
        throw new Error(data.error || 'Failed to upload image');
      }
    } catch (err: any) {
      console.error('Photo upload error:', err);
      setStatusMessage(`Upload failed: ${err.message || 'Please try again'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setImageUrl('');
    setPreviewUrl('');
    setStatusMessage('');
  };

  return (
    <div className="field span-2" style={{ marginTop: '0.25rem' }}>
      <label style={{ display: 'block', fontWeight: 650, marginBottom: '0.4rem' }}>
        Profile Photo (Vercel Storage &amp; Theme Background)
      </label>

      {/* Hidden input to ensure FormData picks up the image URL on form submit */}
      <input type="hidden" name="image" value={imageUrl} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '130px 1fr',
          gap: '1.25rem',
          alignItems: 'center',
          background: 'var(--surface-soft, rgba(255, 255, 255, 0.03))',
          padding: '1rem',
          borderRadius: '12px',
          border: '1px solid var(--line)'
        }}
      >
        {/* Preview Frame with matching Website Theme Background */}
        <div
          style={{
            width: '130px',
            height: '130px',
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden',
            display: 'grid',
            placeItems: 'center',
            background:
              'radial-gradient(circle at 50% 30%, color-mix(in srgb, var(--primary) 28%, var(--surface-soft)), color-mix(in srgb, var(--navy) 48%, var(--surface-soft)))',
            border: '2px solid color-mix(in srgb, var(--primary) 30%, var(--line))',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
          }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'bottom center',
                transform: 'scale(1.05)'
              }}
            />
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.78rem', padding: '0.5rem' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>👤</div>
              No Photo
            </div>
          )}

          {isUploading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              Processing...
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <label
              className="button button-small"
              style={{
                cursor: isUploading ? 'not-allowed' : 'pointer',
                opacity: isUploading ? 0.7 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                margin: 0
              }}
            >
              📁 {imageUrl ? 'Change Photo' : 'Upload Photo'}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
                style={{ display: 'none' }}
              />
            </label>

            {imageUrl && (
              <button
                type="button"
                className="button button-small button-outline"
                onClick={handleRemovePhoto}
                disabled={isUploading}
                style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
              >
                ✕ Remove
              </button>
            )}

            <button
              type="button"
              className="button button-small button-outline"
              onClick={() => setShowManualUrl(!showManualUrl)}
              style={{ fontSize: '0.75rem' }}
            >
              {showManualUrl ? 'Hide URL' : '🔗 Direct URL'}
            </button>
          </div>

          {/* Auto-remove background toggle */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.82rem',
              color: 'var(--foreground)',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <input
              type="checkbox"
              checked={autoRemoveBg}
              onChange={(e) => setAutoRemoveBg(e.target.checked)}
              disabled={isUploading}
            />
            <span>
              <strong>Auto-remove photo background</strong> (matches website theme)
            </span>
          </label>

          {/* Status / feedback message */}
          {statusMessage && (
            <div
              style={{
                fontSize: '0.78rem',
                color: statusMessage.startsWith('✓') ? '#10b981' : statusMessage.includes('failed') ? '#ef4444' : 'var(--primary)'
              }}
            >
              {statusMessage}
            </div>
          )}

          {/* Manual URL fallback */}
          {showManualUrl && (
            <div style={{ marginTop: '0.25rem' }}>
              <input
                className="input"
                type="url"
                placeholder="https://... (or image URL)"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setPreviewUrl(e.target.value);
                }}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
