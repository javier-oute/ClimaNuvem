export default {
  home: {
    title: "Welcome to ClimaNuvem",
    subtitle:
      "Take a photo of the clouds that concern you and we will give you the forecast",
  },
  guide: {
    title: "Cloud types",
    subtitle: "The 10 genera of the International Cloud Atlas (WMO).",
    categories: {
      high: "High Clouds",
      mid: "Mid-Level Clouds",
      low: "Low Clouds",
      vertical: "Vertical Development",
    },
    clouds: {
      cirrus: {
        nombre: "Cirrus",
        descripcion:
          "Delicate white filaments of silky or fibrous appearance, formed by ice crystals at high altitude.",
      },
      cirrocumulus: {
        nombre: "Cirrocumulus",
        descripcion:
          "Thin layer of small white globules without shadows. Indicates jet streams and high-altitude turbulence.",
      },
      cirrostratus: {
        nombre: "Cirrostratus",
        descripcion:
          "Transparent whitish veil covering the sky. Produces solar and lunar halos. Does not precipitate.",
      },
      altostratus: {
        nombre: "Altostratus",
        descripcion:
          "Grey or bluish sheet covering the sky. The sun appears as through frosted glass.",
      },
      altocumulus: {
        nombre: "Altocumulus",
        descripcion:
          "White or grey cloud bank in the form of tiles or rollers with their own shadows. Forms the popular 'mackerel sky'.",
      },
      nimbostratus: {
        nombre: "Nimbostratus",
        descripcion:
          "Dark grey layer veiled by continuous rain or snow reaching the ground. Completely obscures the sun.",
      },
      stratus: {
        nombre: "Stratus",
        descripcion:
          "Very low, grey layer with a uniform base, between the ground and 800 m. Fog is stratus at ground level.",
      },
      stratocumulus: {
        nombre: "Stratocumulus",
        descripcion:
          "Sheet of grey or whitish clouds with dark patches, in the form of slabs or rollers. The most common low cloud.",
      },
      cumulus: {
        nombre: "Cumulus",
        descripcion:
          "Isolated, dense clouds with cauliflower-shaped domes. Dark, flat base. Produce local showers.",
      },
      cumulonimbus: {
        nombre: "Cumulonimbus",
        descripcion:
          "Dense and powerful cloud with anvil-shaped top. Tops up to 35 km. Source of storms, tornadoes and hail.",
      },
    },
  },
  history: {
    title: "History",
    search: "Search...",
    empty: "No data",
    prediction: "Prediction",
    date: "Date",
    forecast: "Forecast",
    probability: "Probability",
  },
  profile: {
    fullName: "Full name",
    phone: "Phone",
    username: "Username",
    fullNamePlaceholder: "E.g. Javier Oute",
    phonePlaceholder: "E.g. +34 612 345 678",
    usernamePlaceholder: "E.g. sara_garcia",
    editing: "Editing profile…",
    saved: "Changes saved successfully ✅",
    invalidPhone: "Invalid phone number",
    invalidPhoneMsg: "Use format like +34 600 123 456",
    saveError: "Could not save",
    noName: "No name",
  },
  forecast: {
    loading: "Loading...",
    generating: "Generating forecast…",
    notFound: "Image not found",
    saveError: "Could not save",
    name: "Name",
    place: "Location",
    namePlaceholder: "E.g. Dark clouds at home",
    placeCamera: "Detected location...",
    placeGallery: "Location (optional)",
    probability: "Probability",
    defaultName: "Prediction",
  },
  detail: {
    loading: "Loading...",
    notFound: "Prediction not found",
    invalidId: "Invalid ID.",
    deleteTitle: "Delete prediction",
    deleteMsg: "Are you sure you want to delete it? This action cannot be undone.",
    deleteError: "Could not delete",
    deleteConfirm: "Delete",
    cancel: "Cancel",
    saved: "Saved prediction:",
    probability: "Probability",
    place: "Location",
    error: "Error",
  },
  login: {
    title: "Welcome to ClimaNuvem!",
    subtitle:
      "Sign in to save your predictions and access exclusive features",
    guest: "Continue as guest",
  },
  buttons: {
    takePhoto: "Take photo",
    loadImage: "Load image",
    save: "Save",
    saving: "Saving…",
    discard: "Discard",
    delete: "Delete",
    deleting: "Deleting...",
    share: "Share",
    editProfile: "Edit profile",
    cancel: "Cancel",
    signOut: "Sign out",
  },
  alerts: {
    cielo_despejado: {
      titulo: "Clear sky",
      mensaje: "No weather risks. Good conditions.",
    },
    nubes_altas_medias: {
      titulo: "High or mid-level clouds",
      mensaje: "Possible weather change. Monitor the sky.",
    },
    lenticular_viento: {
      titulo: "Strong wind at altitude",
      mensaje: "Lenticular clouds detected. Intense wind on summits.",
    },
    cubierto_precipitacion: {
      titulo: "Precipitation risk",
      mensaje: "Overcast sky. Possible rain or snow approaching.",
    },
    niebla_stratus: {
      titulo: "Fog or low stratus",
      mensaje: "Reduced visibility. Risk of disorientation.",
    },
    conveccion_desarrollo: {
      titulo: "Developing convection",
      mensaje: "Storm clouds forming. Consider descending.",
    },
    tormenta: {
      titulo: "⚠️ DANGER — Thunderstorm",
      mensaje: "Active storm. Seek shelter immediately.",
    },
    foto_invalida: {
      titulo: "Invalid photo",
      mensaje: "This image cannot be analysed. Try with another photo.",
    },
  },
  share: {
    predictionPrefix: "🌤️ Prediction: ",
    locationPrefix: "📍 ",
    forecastLabel: "Forecast: ",
    probabilityLabel: "Probability: ",
    footer: "\n— Sent from ClimaNuvem",
    defaultTitle: "Prediction",
    error: "Could not share",
  },
  camera: {
    permissionTitle: "Camera permission",
    permissionMsg: "Enable camera access in Settings to take photos.",
    cancel: "Cancel",
    openSettings: "Open Settings",
  },
  settings: {
    title: "Preferences",
    language: "Language",
    theme: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    langEs: "Español",
    langGl: "Galego",
    langEn: "English",
  },
  tabs: {
    home: "Home",
    guide: "Guide",
    history: "History",
    profile: "Profile",
  },
  help: {
    title: "Help",
    goodPhotos: {
      title: "How to take good photos",
      body: "• Point directly at the sky, letting clouds fill the frame\n• Find good lighting and avoid shooting into the sun\n• Keep the phone steady to avoid blurry images\n• Include the horizon when there are few clouds for context",
    },
    avoidPhotos: {
      title: "Photos to avoid",
      body: "• Blurry, very dark, or overexposed images\n• Photos with trees, buildings, or objects blocking the sky\n• Shots directly into the sun\n• Indoor images or photos without visible sky",
    },
    howItWorks: {
      title: "How ClimaNuvem works",
      body: "1. Take a photo of the sky or load one from your gallery\n2. The AI model analyses the type of clouds present\n3. The app classifies the meteorological risk into 8 categories\n4. Save your predictions to the history for later reference",
    },
  },
};
