'use client'

import Cropper from 'react-easy-crop'
import { useCallback, useState } from 'react'
import { Area } from 'react-easy-crop'

type ImageCropperProps = {
  imageFile: File
  onCropComplete: (croppedFile: File) => void
}

export default function ImageCropper({ imageFile, onCropComplete }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)

  const createImage = (url: string) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.src = url
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = (error) => reject(error)
    })
  }

  const getCroppedImg = async (imageSrc: string, pixelCrop: Area) => {
    const img = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('No 2D context')

    canvas.width = 512
    canvas.height = 512

    ctx.drawImage(
      img,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      512,
      512
    )

    return new Promise<File>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], imageFile.name, { type: 'image/jpeg' })
          resolve(file)
        } else {
          reject(new Error('Failed to convert canvas to blob'))
        }
      }, 'image/jpeg')
    })
  }

  const onCropCompleteInternal = useCallback((_croppedArea: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleCropAndSave = async () => {
    if (!croppedAreaPixels) return
    setProcessing(true)

    const reader = new FileReader()
    reader.onloadend = async () => {
      const result = reader.result as string
      try {
        const croppedFile = await getCroppedImg(result, croppedAreaPixels)
        onCropComplete(croppedFile)
      } catch (err) {
        console.error('❌ Error during crop:', err)
      } finally {
        setProcessing(false)
      }
    }
    reader.readAsDataURL(imageFile)
  }

  return (
    <div className="upload-cropper-wrapper">
      <div className="cropper-container">
        <Cropper
          image={URL.createObjectURL(imageFile)}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropCompleteInternal}
        />
      </div>

      <button
        onClick={handleCropAndSave}
        disabled={processing}
        className="crop-save-btn"
        type="button"
      >
        {processing ? 'Processing...' : 'Crop & Save'}
      </button>
    </div>
  )
}
