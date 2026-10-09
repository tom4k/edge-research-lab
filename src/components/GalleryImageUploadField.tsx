'use client';

import React, { useState } from 'react';

interface GalleryImageUploadFieldProps {
  initialUrl?: string;
  name?: string;
}

export function GalleryImageUploadField({ initialUrl = '', name = 'imageUrl' }: GalleryImageUploadFieldProps) {
  const [imageUrl, setImageUrl] = useState<string>(initialUrl);
  const [previewUrl, setPreviewUrl] = useState<string>(initialUrl);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showManualUrl, setShowManualUrl] = useState<boolean>(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatusMessage('Uploading image to storage...');
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append('file', file);

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
            ? '✓ Uploaded to Vercel Cloud Storage!'
            : '✓ Image saved successfully!'
        );
      } else {
        throw new Error(data.error || 'Failed to upload image');
      }
    } catch (err: any) {
      console.error('Gallery image upload error:', err);
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
        Gallery Photo *
      </label>

      {/* Hidden input to ensure standard FormData picks up the image URL on form submit */}
      <input type="hidden" name={name} value={imageUrl} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(180px, 260px) 1fr',
          gap: '1.25rem',
          alignItems: 'center',
          background: 'var(--surface-soft, rgba(255, 255, 255, 0.03))',
          padding: '1.1rem',
          borderRadius: '14px',
          border: '1px solid var(--line)'
        }}
      >
        {/* Preview Frame */}
        <div
          style={{
            width: '100%',
            aspectRatio: '16 / 10',
            borderRadius: '12px',
            position: 'relative',
            overflow: 'hidden',
            display: 'grid',
            placeItems: 'center',
            background: 'var(--surface)',
            border: '2px solid var(--line)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
          }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Gallery item preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.82rem', padding: '0.75rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>🖼️</div>
              <span>No image selected</span>
            </div>
          )}

          {isUploading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.72)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 600,
                backdropFilter: 'blur(4px)'
              }}
            >
              Uploading...
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <label
              className="button button-small"
              style={{
                cursor: isUploading ? 'not-allowed' : 'pointer',
                opacity: isUploading ? 0.7 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                margin: 0
              }}
            >
              📁 {imageUrl ? 'Change Photo' : 'Upload from Device'}
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
                ✕ Clear
              </button>
            )}

            <button
              type="button"
              className="button button-small button-outline"
              onClick={() => setShowManualUrl(!showManualUrl)}
              style={{ fontSize: '0.75rem' }}
            >
              {showManualUrl ? 'Hide URL' : '🔗 Image URL'}
            </button>
          </div>

          <small style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>
            Supports JPG, PNG, WEBP. Uploads directly to cloud storage or enter an existing web URL.
          </small>

          {/* Status feedback message */}
          {statusMessage && (
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: statusMessage.startsWith('✓') ? '#10b981' : statusMessage.includes('failed') ? '#ef4444' : 'var(--primary)'
              }}
            >
              {statusMessage}
            </div>
          )}

          {/* Manual URL input fallback */}
          {showManualUrl && (
            <div style={{ marginTop: '0.2rem' }}>
              <input
                className="input"
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setPreviewUrl(e.target.value);
                }}
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
