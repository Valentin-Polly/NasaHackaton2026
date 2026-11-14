export type GalleryPhoto = {
  src: string
  alt: string
}

export type PhotoGalleryData = {
  title: string
  photos: GalleryPhoto[]
}

export const apollo11FloridaGallery: PhotoGalleryData = {
  title: 'APOLLO 11 / FLORIDA',
  photos: [
    {
      src: '/earth-blue-marble.png',
      alt: 'Imagen placeholder para el sitio de lanzamiento en Florida',
    },
    {
      src: '/lroc_color_2k.jpg',
      alt: 'Imagen placeholder de la Luna',
    },
    {
      src: '/euvi_aia304_2012_carrington_print.jpg',
      alt: 'Imagen placeholder del Sol',
    },
  ],
}

export const apollo11MoonGallery: PhotoGalleryData = {
  title: 'APOLLO 11 / LUNA',
  photos: [
    {
      src: '/lroc_color_2k.jpg',
      alt: 'Imagen placeholder de la superficie lunar',
    },
  ],
}
