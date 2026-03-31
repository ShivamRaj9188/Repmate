import { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react'
import { Camera, CameraOff } from 'lucide-react'

const CameraFeed = forwardRef(function CameraFeed(
  { isActive, onReady, displayCanvasRef },
  ref
) {
  const videoRef = useRef(null)
  const captureCanvasRef = useRef(null)
  const streamRef = useRef(null)
  const [cameraError, setCameraError] = useState(null)

  // Expose captureFrame to parent via ref
  useImperativeHandle(ref, () => ({
    captureFrame: () => {
      const video = videoRef.current
      const canvas = captureCanvasRef.current
      if (!video || !canvas || video.readyState < 2) return null

      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)
      return canvas.toDataURL('image/jpeg', 0.7)
    },
  }))

  useEffect(() => {
    if (isActive) {
      startCamera()
    } else {
      stopCamera()
    }
    return () => stopCamera()
  }, [isActive])

  const startCamera = async () => {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          onReady?.()
        }
      }
    } catch (err) {
      setCameraError(err.name === 'NotAllowedError' ? 'Camera permission denied.' : 'Could not access camera.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
  }

  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: '16px', overflow: 'hidden', background: '#0a0b0f' }}>
      {/* Hidden video element for capture */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        playsInline
        muted
      />

      {/* Hidden canvas for frame extraction */}
      <canvas ref={captureCanvasRef} style={{ display: 'none' }} />

      {/* Display canvas — shows AI-annotated frames */}
      <canvas
        ref={displayCanvasRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: isActive ? 'block' : 'none',
        }}
      />

      {/* Idle state */}
      {!isActive && !cameraError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            background: 'rgba(10,11,15,0.9)',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(124,58,237,0.1)',
              border: '2px solid rgba(124,58,237,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Camera size={32} color="#7c3aed" />
          </div>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            Camera will start when you begin a session
          </p>
        </div>
      )}

      {/* Error state */}
      {cameraError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            background: 'rgba(10,11,15,0.95)',
          }}
        >
          <CameraOff size={40} color="#ef4444" />
          <p style={{ color: '#ef4444', fontSize: '14px', margin: 0 }}>{cameraError}</p>
        </div>
      )}
    </div>
  )
})

export default CameraFeed
