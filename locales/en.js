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
    categoriesShort: {
      high: "High",
      mid: "Mid",
      low: "Low",
      vertical: "Vertical",
    },
    detail: {
      categoria: "Category",
      altitud: "Typical altitude",
      abreviatura: "Abbreviation",
      precipita: "Precipitation",
      descripcionTitulo: "Description",
      identificacionTitulo: "How to identify it",
      montanaTitulo: "What it means in the mountains",
      riesgoTitulo: "Risk",
      riesgo: {
        0: "No risk",
        1: "Watch",
        2: "Caution",
        3: "High risk",
        4: "Danger",
      },
    },
    clouds: {
      cirrus: {
        nombre: "Cirrus",
        descripcion:
          "Delicate white filaments of silky or fibrous appearance, formed by ice crystals at high altitude.",
        altitud: "High (6–12 km)",
        precipita: "No",
        identificacion:
          "Fine, separate white filaments, translucent and without shadows. Sometimes hooked (“mare's tails”).",
        montana:
          "Low risk. If they increase and thicken from the west, they herald rain within 12–24 h.",
      },
      cirrocumulus: {
        nombre: "Cirrocumulus",
        descripcion:
          "Thin layer of small white globules without shadows. Indicates jet streams and high-altitude turbulence.",
        altitud: "High (6–12 km)",
        precipita: "No",
        identificacion:
          "Tiny white grains aligned in ripples (a fine “mackerel sky”), without shadows.",
        montana:
          "A sign of unstable air aloft; usually precedes a change in the weather.",
      },
      cirrostratus: {
        nombre: "Cirrostratus",
        descripcion:
          "Transparent whitish veil covering the sky. Produces solar and lunar halos. Does not precipitate.",
        altitud: "High (6–12 km)",
        precipita: "No",
        identificacion:
          "Uniform milky veil with a 22° halo around the sun or moon.",
        montana:
          "The halo warns of a warm front: possible rain within 12–24 h.",
      },
      altostratus: {
        nombre: "Altostratus",
        descripcion:
          "Grey or bluish sheet covering the sky. The sun appears as through frosted glass.",
        altitud: "Mid (2–7 km)",
        precipita: "Sometimes, drizzle or light snow",
        identificacion:
          "Grey sheet that blurs the sun, “as if behind frosted glass”.",
        montana: "A precursor to steady rain. The weather is worsening.",
      },
      altocumulus: {
        nombre: "Altocumulus",
        descripcion:
          "White or grey cloud bank in the form of tiles or rollers with their own shadows. Forms the popular 'mackerel sky'.",
        altitud: "Mid (2–7 km)",
        precipita: "Rarely",
        identificacion:
          "White and grey tiles or rollers with their own shadows (“mackerel sky”).",
        montana:
          "Generally stable; if turrets form in the morning, storms are possible in the afternoon.",
      },
      nimbostratus: {
        nombre: "Nimbostratus",
        descripcion:
          "Dark grey layer veiled by continuous rain or snow reaching the ground. Completely obscures the sun.",
        altitud: "Mid to low (base 0.5–3 km)",
        precipita: "Yes, continuous rain or snow",
        identificacion:
          "Dark, dense grey layer that hides the sun, with continuous rain or snow.",
        montana:
          "Prolonged precipitation and poor visibility: unsuitable for summits.",
      },
      stratus: {
        nombre: "Stratus",
        descripcion:
          "Very low, grey layer with a uniform base, between the ground and 800 m. Fog is stratus at ground level.",
        altitud: "Low (0–2 km)",
        precipita: "Light drizzle",
        identificacion:
          "Very low, uniform grey layer; at ground level it is fog.",
        montana: "Very poor visibility: high risk of disorientation.",
      },
      stratocumulus: {
        nombre: "Stratocumulus",
        descripcion:
          "Sheet of grey or whitish clouds with dark patches, in the form of slabs or rollers. The most common low cloud.",
        altitud: "Low (0–2 km)",
        precipita: "Occasional and light",
        identificacion:
          "Grey and white slabs or rollers with gaps between them. The most common low cloud.",
        montana: "Calm but overcast weather; it can cover the summits.",
      },
      cumulus: {
        nombre: "Cumulus",
        descripcion:
          "Isolated, dense clouds with cauliflower-shaped domes. Dark, flat base. Produce local showers.",
        altitud: "Low base (0.5–2 km), vertical development",
        precipita: "Showers if they grow (congestus)",
        identificacion:
          "Cottony clouds with cauliflower domes and a flat base. Watch if they grow taller.",
        montana:
          "If they swell and the tower exceeds its width, they turn into a storm. Plan your descent.",
      },
      cumulonimbus: {
        nombre: "Cumulonimbus",
        descripcion:
          "Dense and powerful cloud with anvil-shaped top. Tops up to 35 km. Source of storms, tornadoes and hail.",
        altitud: "Low base; top up to 12–16 km",
        precipita: "Yes, heavy: showers, hail and lightning",
        identificacion:
          "Huge, dark cloud with an anvil top. Often with lightning and hail.",
        montana:
          "DANGER: active storm. Leave ridges and seek shelter immediately.",
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
    publishedBadge: "Published",
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
    usernameInvalidTitle: "Invalid username",
    usernameInvalidMsg:
      "Use 3 to 30 characters: letters, numbers or underscore.",
    usernameTakenTitle: "Username taken",
    usernameTakenMsg: "That username is already in use. Try another one.",
    avatar: {
      sheetTitle: "Profile photo",
      camera: "Take a photo",
      gallery: "Choose from gallery",
      remove: "Remove photo",
      cancel: "Cancel",
      edit: "Change photo",
      uploadError: "Could not upload the image",
    },
    deleteAccount: {
      button: "Delete account",
      modalTitle: "Delete account",
      modalWarning:
        "This action is permanent and irreversible. Your profile, all your predictions, your images and your avatar will be deleted. Nothing can be recovered.",
      confirmPrompt: "Type DELETE to confirm",
      confirmWord: "DELETE",
      placeholder: "DELETE",
      cancel: "Cancel",
      confirm: "Delete permanently",
      deleting: "Deleting…",
      error: "Could not delete the account. Please try again.",
    },
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
    description: "Description",
    descriptionPlaceholder: "Add a comment (optional)",
    descriptionHint:
      "If you publish the prediction, this description will be shown on the map.",
  },
  detail: {
    loading: "Loading...",
    notFound: "Prediction not found",
    invalidId: "Invalid ID.",
    deleteTitle: "Delete prediction",
    deleteMsg:
      "Are you sure you want to delete it? This action cannot be undone.",
    deleteMsgPublished:
      "This prediction is published on the map. If you delete it, it will also be removed from the map. This action cannot be undone.",
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
    subtitle: "Sign in to save your predictions and access exclusive features",
    guest: "Continue as guest",
    google: "Sign in with Google",
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
    publish: "Publish",
    publishing: "Publishing…",
    unpublish: "Unpublish",
    unpublishing: "Unpublishing…",
    report: "Report",
    accept: "Accept",
    editProfile: "Edit profile",
    cancel: "Cancel",
    signOut: "Sign out",
  },
  alerts: {
    cielo_despejado: {
      titulo: "Clear sky",
      tituloDudoso: "Possibly clear sky",
      mensaje: {
        alta: "No weather risks detected. Good conditions for your activity.",
        media: "The sky looks clear. Even so, check it now and then.",
        baja: "It looks clear, though the detection isn't certain. Take a look at the sky.",
      },
    },
    nubes_altas_medias: {
      titulo: "High clouds, no immediate danger",
      tituloDudoso: "Maybe high clouds",
      mensaje: {
        alta: "High clouds with no immediate risk. Keep an eye out in case they grow.",
        media:
          "Possible high clouds. No short-term danger; stay alert to changes.",
        baja: "There may be high clouds. Not certain; watch how the sky evolves.",
      },
    },
    lenticular_viento: {
      titulo: "Sign of strong wind aloft",
      tituloDudoso: "Possible strong wind aloft",
      mensaje: {
        alta: "Lenticular clouds: strong wind on summits. Take care in exposed areas.",
        media: "Possible signs of strong wind aloft. Be careful on the ridges.",
        baja: "There may be strong wind on summits. Not certain; assess it before exposing yourself.",
      },
    },
    cubierto_precipitacion: {
      titulo: "Overcast sky, possible rain",
      tituloDudoso: "Possibly overcast",
      mensaje: {
        alta: "Overcast sky: rain or snow may arrive. Be ready in case it worsens.",
        media: "Overcast sky. Precipitation may be near; bring protection.",
        baja: "There may be overcast skies and rain ahead. Not certain; keep an eye on the weather.",
      },
    },
    niebla_stratus: {
      titulo: "Fog or low clouds",
      tituloDudoso: "Maybe fog",
      mensaje: {
        alta: "Fog or low clouds: reduced visibility and risk of disorientation. Take extra care.",
        media:
          "Possible fog or low clouds. Visibility may worsen; mind your orientation.",
        baja: "There may be fog. Not certain; watch visibility before moving on.",
      },
    },
    conveccion_desarrollo: {
      titulo: "Storm clouds are forming",
      tituloDudoso: "Storm clouds may be forming",
      mensaje: {
        alta: "Clouds are growing into a storm. Plan your descent and avoid ridges.",
        media:
          "The sky shows development that may end in a storm. Stay alert and get ready to descend.",
        baja: "Possible developing storm clouds. Not certain; watch how the sky evolves.",
      },
    },
    tormenta: {
      titulo: "⚠️ Thunderstorm",
      tituloDudoso: "Possible thunderstorm",
      mensaje: {
        alta: "Active storm. Seek shelter and leave ridges and summits immediately.",
        media:
          "Clear signs of a storm. Move away from exposed areas and consider descending now.",
        baja: "There may be storm activity, though it's not certain. Watch the sky and avoid exposed areas.",
      },
    },
    foto_invalida: {
      titulo: "Can't analyse the photo",
      mensaje: "This image cannot be analysed. Try with another photo.",
    },
    tone: {
      pocoFiable: "Low-confidence detection: use it only as guidance.",
      reintentarTitulo: "Unclear image",
      reintentarMensaje:
        "The model is unsure about this image. Retake the photo framing the sky well and avoiding obstacles.",
      repetirFoto: "Retake photo",
    },
    fiabilidad: {
      label: "Reliability",
      alta: "High",
      media: "Medium",
      baja: "Low",
    },
  },
  share: {
    predictionPrefix: "🌤️ Prediction: ",
    locationPrefix: "📍 ",
    forecastLabel: "Forecast: ",
    recommendationLabel: "Recommendation: ",
    reliabilityLabel: "Reliability: ",
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
    mapConsent: "Share on map",
    mapConsentOn: "Yes",
    mapConsentOff: "No",
    mapConsentDisableTitle: "Disable map sharing",
    mapConsentDisableMsg:
      "If you disable this option, all your current map posts will be deleted. You can publish new predictions again if you re-enable this option.",
    mapConsentDisableConfirm: "Disable",
    mapConsentDisableError: "Couldn't disable",
  },
  tabs: {
    home: "Home",
    guide: "Guide",
    history: "History",
    profile: "Profile",
    map: "Map",
  },
  community: {
    prediction: "Community prediction",
    publishedAt: "Published",
    expiresIn: "Expires in",
    expired: "Expired",
    loading: "Loading...",
    notFound: "Prediction not found",
    userDescription: "User description",
    yourPublications: "Your posts",
    consentTitle: "Publish on the map",
    consentMsg:
      "Your photo will be visible to the community along with an approximate (not exact) location of where it was taken. The post will be visible until it expires (about 6 hours) and you can unpublish it anytime.",
    publishError: "Could not publish",
    publishLimit:
      "You have reached the maximum of 3 active posts. Unpublish one to publish a new one.",
    locationOffTitle: "Turn on location",
    locationOffMsg:
      "Turn on location to see and publish predictions from your area on the map.",
    unpublishTitle: "Unpublish prediction",
    unpublishMsg: "It will be removed from the community map. Continue?",
    reportConfirmTitle: "Report post",
    reportConfirmMsg:
      "Are you sure you want to report this post? This is a serious action; only do it if the content is inappropriate.",
    reportThanksTitle: "Thank you",
    reportThanksMsg: "We have received your report and will review it.",
    actionError: "Could not complete the action",
  },
  help: {
    title: "Help",
    goodPhotos: {
      title: "How to take good photos",
      body: "Hold the phone horizontally, with the sky up and without tilting it. Point directly at the sky and let the clouds fill the frame, with good lighting and without shooting into the sun. Keep the phone steady so the photo doesn't come out blurry and, if there are few clouds, include the horizon for context.",
    },
    avoidPhotos: {
      title: "Photos to avoid",
      intro:
        "These photos make analysis harder or impossible. Try to avoid them:",
      objects:
        "Aim well at the sky and avoid objects, trees, buildings, or people in the foreground as much as possible. Avoid portrait orientation too: hold the phone horizontally so the whole cloud fits.",
      visibility:
        "Avoid photos with poor visibility, such as at night or against the light. The model needs to see the sky and clouds clearly.",
      blurry:
        "Avoid blurry or shaky photos, and be careful not to cover the lens with your finger (the classic finger).",
    },
    howItWorks: {
      title: "How ClimaNuvem works",
      body: "1. Take a photo of the sky or pick one from your gallery.\n2. The AI analyses the type of clouds and how developed they are.\n3. ClimaNuvem classifies the risk into one of 8 categories and shows you an alert.\n4. Save the prediction to your history to check it whenever you want.",
    },
  },
};
