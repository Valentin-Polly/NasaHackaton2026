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

export const apollo12FloridaGallery: PhotoGalleryData = {
  title: 'APOLLO 12 / FLORIDA',
  photos: [
    {
      src: '/apolo 12 tierra.jpg',
      alt: 'Despegue del Saturn V de la misión Apollo 12 sobre la costa de Florida.',
    },
    {
      src: '/apolo 12 2 tierra.jpg',
      alt: 'La tripulación de Apollo 12 durante los preparativos de la misión.',
    },
    {
      src: '/apolo 12 3 tierra.jpg',
      alt: 'El cohete Saturn V de Apollo 12 en la plataforma de lanzamiento.',
    },
  ],
}

export const apollo12MoonGallery: PhotoGalleryData = {
  title: 'APOLLO 12 / LUNA',
  photos: [
    {
      src: '/apolo 12 luna.jpg',
      alt: 'El módulo lunar de Apollo 12 se eleva desde la superficie de la Luna.',
    },
    {
      src: '/apolo 12 luna 2.jpg',
      alt: 'Un astronauta de Apollo 12 examina la sonda Surveyor 3 en la Luna.',
    },
  ],
}
