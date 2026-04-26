'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, X, Check, RotateCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/context/UserContext';

type Props = {
  size?: number;
};

export default function ProfilePhoto({ size = 40 }: Props) {
  const { user } = useUser();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load current profile photo
  useEffect(() => {
    if (!user) return;
    const cached = localStorage.getItem(`profile-photo-${user}`);
    if (cached) setPhotoUrl(cached);

    // Check storage for latest
    const { data } = supabase.storage.from('profiles').getPublicUrl(`${user}.webp`);
    if (data?.publicUrl) {
      const url = `${data.publicUrl}?t=${Date.now()}`;
      setPhotoUrl(url);
      localStorage.setItem(`profile-photo-${user}`, url);
    }
  }, [user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result as string);
      setShowCrop(true);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleCropped = async (blob: Blob) => {
    if (!user) return;
    setShowCrop(false);
    setUploading(true);

    try {
      const fileName = `${user}.webp`;

      const { error } = await supabase.storage
        .from('profiles')
        .upload(fileName, blob, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (error) throw error;

      const { data } = supabase.storage.from('profiles').getPublicUrl(fileName);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      setPhotoUrl(url);
      localStorage.setItem(`profile-photo-${user}`, url);
    } catch (err) {
      console.error('Profile upload failed:', err);
    } finally {
      setUploading(false);
      setRawImage(null);
    }
  };

  return (
    <>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="relative rounded-full border-2 border-line bg-line/30 flex-shrink-0 flex items-center justify-center overflow-hidden"
        style={{ width: size, height: size }}
        disabled={uploading}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt="프로필"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs text-caption">📷</span>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-ink/30 flex items-center justify-center">
            <Loader2 size={16} className="text-white animate-spin" />
          </div>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      {showCrop && rawImage && (
        <CropModal
          imageSrc={rawImage}
          onCropped={handleCropped}
          onCancel={() => { setShowCrop(false); setRawImage(null); }}
        />
      )}
    </>
  );
}

// ---------- Crop Modal (canvas-based, no external deps) ----------

type CropModalProps = {
  imageSrc: string;
  onCropped: (blob: Blob) => void;
  onCancel: () => void;
};

function CropModal({ imageSrc, onCropped, onCancel }: CropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [loaded, setLoaded] = useState(false);

  const CANVAS_SIZE = 280;
  const CIRCLE_R = 120;

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      // Auto-fit: scale image so shorter side fills the circle
      const minDim = Math.min(img.width, img.height);
      const initialScale = (CIRCLE_R * 2) / minDim;
      setScale(initialScale);
      setLoaded(true);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Draw
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw image with transform
    ctx.save();
    ctx.translate(CANVAS_SIZE / 2 + offset.x, CANVAS_SIZE / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    // Draw circular overlay (dark outside circle)
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CIRCLE_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Circle border
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CIRCLE_R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [offset, rotation, scale]);

  useEffect(() => {
    if (loaded) draw();
  }, [loaded, draw]);

  // Touch/mouse drag
  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handlePointerUp = () => setDragging(false);

  // Export cropped circle as webp blob
  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img) return;

    const outSize = 256;
    const outCanvas = document.createElement('canvas');
    outCanvas.width = outSize;
    outCanvas.height = outSize;
    const ctx = outCanvas.getContext('2d');
    if (!ctx) return;

    // Clip to circle
    ctx.beginPath();
    ctx.arc(outSize / 2, outSize / 2, outSize / 2, 0, Math.PI * 2);
    ctx.clip();

    // Map from preview coords to output coords
    const ratio = outSize / (CIRCLE_R * 2);
    ctx.translate(outSize / 2 + offset.x * ratio, outSize / 2 + offset.y * ratio);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale * ratio, scale * ratio);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    outCanvas.toBlob(
      (blob) => { if (blob) onCropped(blob); },
      'image/webp',
      0.85
    );
  };

  return (
    <div className="fixed inset-0 bg-ink/60 z-[60] flex items-center justify-center px-4" onClick={onCancel}>
      <div
        className="bg-paper rounded-lg p-5 w-full max-w-[340px] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-ink">프로필 사진 편집</h3>
          <button onClick={onCancel} className="p-1.5 text-ink/40 hover:bg-line/50 rounded-lg">
            <X size={16} />
          </button>
        </div>

        {/* Canvas */}
        <div className="flex justify-center mb-4">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="rounded-lg cursor-move touch-none"
            style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <label className="flex items-center gap-2 text-xs text-caption">
            <input
              type="range"
              min={0.2}
              max={3}
              step={0.05}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-28 accent-shared"
            />
            확대
          </label>
          <button
            onClick={() => setRotation((r) => r + 90)}
            className="p-2 border border-line rounded-lg text-caption hover:bg-line/30 transition-colors"
          >
            <RotateCw size={14} />
          </button>
        </div>

        <p className="text-[10px] text-caption/50 text-center mb-4">
          드래그로 위치 조정, 슬라이더로 확대/축소
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-paper border border-line rounded-lg text-sm font-medium text-caption hover:bg-line/30 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 bg-shared text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-shared/90 transition-colors"
          >
            <Check size={14} />
            적용하기
          </button>
        </div>
      </div>
    </div>
  );
}
