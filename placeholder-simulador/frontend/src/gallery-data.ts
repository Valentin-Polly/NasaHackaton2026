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
      src: '/19a_am2019_bur6907_18_apolloximoonlaunch_0023029_live CREDITOS DAVID BURNETT.webp',
      alt: 'Espectadores observan el lanzamiento del Apolo 11.',
    },
    {
      src: '/despegue-del-saturn-v_00000000_394b51ce_230714123449_1280x1857.jpg',
      alt: 'Despegue de un cohete Saturn V.',
    },
    {
      src: '/31419815333_7aaa95bef0_o.jpg',
      alt: 'Tres astronautas del Apolo 11 posan frente a una maqueta del módulo lunar.',
    },
  ],
}

export const apollo11MoonGallery: PhotoGalleryData = {
  title: 'APOLLO 11 / LUNA',
  photos: [
    {
      src: '/as11-40-5878~large.jpg',
      alt: 'Huella de una bota sobre el regolito lunar durante Apollo 11.',
    },
    {
      src: '/as11-44-6550~large.jpg',
      alt: 'La Tierra sobre el horizonte lunar, vista desde Apollo 11.',
    },
    {
      src: '/6900937~large.jpg',
      alt: 'Buzz Aldrin desciende por la escalera del módulo lunar.',
    },
  ],
}
