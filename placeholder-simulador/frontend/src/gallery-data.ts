export type GalleryPhoto = {
  src: string
  alt: string
}

export type PhotoGalleryData = {
  title: string
  photos: GalleryPhoto[]
}

export const washingtonGallery: PhotoGalleryData = {
  title: 'WASHINGTON, D.C.',
  photos: [
    {
      src: '/earth-blue-marble.png',
      alt: 'Imagen temporal de la Tierra para probar la galería',
    },
    {
      src: '/lroc_color_2k.jpg',
      alt: 'Imagen temporal de la Luna',
    },
    {
      src: '/euvi_aia304_2012_carrington_print.jpg',
      alt: 'Imagen temporal del Sol',
    },
  ],
}
