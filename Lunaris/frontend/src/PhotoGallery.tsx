import { useState } from 'react'
import type { PhotoGalleryData } from './gallery-data'

type PhotoGalleryProps = {
  gallery: PhotoGalleryData
  onClose: () => void
}

function PhotoGallery({ gallery, onClose }: PhotoGalleryProps) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const photoCount = gallery.photos.length
  const currentPhoto = gallery.photos[photoIndex]

  const movePhoto = (direction: -1 | 1) => {
    setPhotoIndex((index) => (index + direction + photoCount) % photoCount)
  }

  return (
    <div className="gallery-layer">
      <section
        className="photo-gallery"
        role="dialog"
        aria-modal="false"
        aria-labelledby="gallery-title"
      >
        <header className="gallery-header">
          <h2 id="gallery-title">{gallery.title}</h2>
          <button
            className="gallery-close"
            type="button"
            aria-label="Cerrar galería"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="gallery-frame">
          {currentPhoto && (
            <img src={currentPhoto.src} alt={currentPhoto.alt} />
          )}
          {photoCount > 1 && (
            <>
              <button
                className="gallery-navigation gallery-navigation--previous"
                type="button"
                aria-label="Foto anterior"
                onClick={() => movePhoto(-1)}
              >
                ←
              </button>
              <button
                className="gallery-navigation gallery-navigation--next"
                type="button"
                aria-label="Foto siguiente"
                onClick={() => movePhoto(1)}
              >
                →
              </button>
            </>
          )}
        </div>

        <p className="gallery-counter">
          {photoCount === 0 ? '0/0' : `${photoIndex + 1}/${photoCount}`}
        </p>
      </section>
    </div>
  )
}

export default PhotoGallery
