export default {
  home: {
    title: "Bienvenido a ClimaNuvem",
    subtitle:
      "Saca una foto a las nubes que te preocupan y te daremos el pronóstico",
  },
  guide: {
    title: "Tipos de nubes",
    subtitle: "Los 10 géneros del Atlas Internacional de Nubes (OMM).",
    categories: {
      high: "Nubes Altas",
      mid: "Nubes Medias",
      low: "Nubes Bajas",
      vertical: "Desarrollo Vertical",
    },
    clouds: {
      cirrus: {
        nombre: "Cirrus",
        descripcion:
          "Filamentos blancos y delicados de aspecto sedoso o fibroso, formados por cristales de hielo a gran altitud.",
      },
      cirrocumulus: {
        nombre: "Cirrocumulus",
        descripcion:
          "Capa delgada de pequeños glóbulos blancos sin sombras propias. Señal de corrientes en chorro y turbulencia en altura.",
      },
      cirrostratus: {
        nombre: "Cirrostratus",
        descripcion:
          "Velo transparente y blanquecino que cubre el cielo. Produce halos solares y lunares. No precipita.",
      },
      altostratus: {
        nombre: "Altostratus",
        descripcion:
          "Manto grisáceo o azulado que cubre el cielo. El sol aparece como a través de un vidrio deslustrado.",
      },
      altocumulus: {
        nombre: "Altocumulus",
        descripcion:
          "Banco de nubes blancas o grises en forma de losetas o rodillos con sombras propias. Forman el popular «cielo empedrado».",
      },
      nimbostratus: {
        nombre: "Nimbostratus",
        descripcion:
          "Capa gris oscura velada por lluvia o nieve continua que llega al suelo. Oculta completamente el sol.",
      },
      stratus: {
        nombre: "Stratus",
        descripcion:
          "Capa muy baja y gris con base uniforme, entre el suelo y 800 m. Las nieblas son stratus al ras del suelo.",
      },
      stratocumulus: {
        nombre: "Stratocumulus",
        descripcion:
          "Manto de nubes grises o blanquecinas con partes oscuras, en forma de losas o rodillos. La nube baja más frecuente.",
      },
      cumulus: {
        nombre: "Cumulus",
        descripcion:
          "Nubes aisladas y densas con cúpulas en forma de coliflor. Base oscura y horizontal. Producen aguaceros locales.",
      },
      cumulonimbus: {
        nombre: "Cumulonimbus",
        descripcion:
          "Nube densa y potente con cima en forma de yunque. Topes hasta 35 km. Origen de tormentas, tornados y granizo.",
      },
    },
  },
  history: {
    title: "Historial",
    search: "Buscar...",
    empty: "No hay datos",
    prediction: "Predicción",
    date: "Fecha",
    forecast: "Pronóstico",
    probability: "Probabilidad",
  },
  profile: {
    fullName: "Nombre completo",
    phone: "Teléfono",
    username: "Nombre de usuario",
    fullNamePlaceholder: "Ej: Javier Oute",
    phonePlaceholder: "Ej: +34 612 345 678",
    usernamePlaceholder: "Ej: sara_garcia",
    editing: "Editando perfil…",
    saved: "Cambios guardados con éxito ✅",
    invalidPhone: "Teléfono inválido",
    invalidPhoneMsg: "Usa formato tipo +34 600 123 456",
    saveError: "No se pudo guardar",
    noName: "Sin nombre",
  },
  forecast: {
    loading: "Cargando...",
    generating: "Generando pronóstico…",
    notFound: "No se encontró la imagen",
    saveError: "No se pudo guardar",
    name: "Nombre",
    place: "Lugar",
    namePlaceholder: "Ej: Nubes negras en casa",
    placeCamera: "Lugar detectado...",
    placeGallery: "Lugar (opcional)",
    probability: "Probabilidad",
    defaultName: "Predicción",
  },
  detail: {
    loading: "Cargando...",
    notFound: "No se encontró la predicción",
    invalidId: "ID inválida.",
    deleteTitle: "Eliminar predicción",
    deleteMsg:
      "¿Seguro que quieres eliminarla? Esta acción no se puede deshacer.",
    deleteError: "No se pudo eliminar",
    deleteConfirm: "Eliminar",
    cancel: "Cancelar",
    saved: "Predicción guardada:",
    probability: "Probabilidad",
    place: "Lugar",
    error: "Error",
  },
  login: {
    title: "¡Bienvenido a ClimaNuvem!",
    subtitle:
      "Inicia sesión para guardar tus predicciones y acceder a funciones exclusivas",
    guest: "Entrar como invitado",
  },
  buttons: {
    takePhoto: "Tomar foto",
    loadImage: "Cargar imagen",
    save: "Guardar",
    saving: "Guardando…",
    discard: "Descartar",
    delete: "Eliminar",
    deleting: "Eliminando...",
    share: "Compartir",
    editProfile: "Editar perfil",
    cancel: "Cancelar",
    signOut: "Cerrar sesión",
  },
  alerts: {
    cielo_despejado: {
      titulo: "Cielo despejado",
      mensaje: "Sin riesgos meteorológicos. Buenas condiciones.",
    },
    nubes_altas_medias: {
      titulo: "Nubes altas o medias",
      mensaje: "Posible cambio de tiempo. Monitoriza el cielo.",
    },
    lenticular_viento: {
      titulo: "Viento fuerte en altura",
      mensaje: "Nubes lenticulares detectadas. Viento intenso en cumbres.",
    },
    cubierto_precipitacion: {
      titulo: "Riesgo de precipitación",
      mensaje: "Cielo cubierto. Posible lluvia o nieve próxima.",
    },
    niebla_stratus: {
      titulo: "Niebla o stratus bajo",
      mensaje: "Visibilidad reducida. Riesgo de desorientación.",
    },
    conveccion_desarrollo: {
      titulo: "Convección en desarrollo",
      mensaje: "Nubes de tormenta formándose. Considera descender.",
    },
    tormenta: {
      titulo: "⚠️ PELIGRO — Tormenta",
      mensaje: "Tormenta activa. Busca refugio inmediatamente.",
    },
    foto_invalida: {
      titulo: "Foto no válida",
      mensaje: "No se puede analizar esta imagen. Intenta con otra foto.",
    },
  },
  share: {
    predictionPrefix: "🌤️ Predicción: ",
    locationPrefix: "📍 ",
    forecastLabel: "Pronóstico: ",
    probabilityLabel: "Probabilidad: ",
    footer: "\n— Enviado desde ClimaNuvem",
    defaultTitle: "Predicción",
    error: "No se pudo compartir",
  },
  camera: {
    permissionTitle: "Permiso de cámara",
    permissionMsg: "Activa la cámara en Ajustes para poder tomar fotos.",
    cancel: "Cancelar",
    openSettings: "Abrir Ajustes",
  },
  settings: {
    title: "Preferencias",
    language: "Idioma",
    theme: "Tema",
    themeLight: "Claro",
    themeDark: "Oscuro",
    themeSystem: "Sistema",
    langEs: "Español",
    langGl: "Galego",
    langEn: "English",
  },
  tabs: {
    home: "Home",
    guide: "Guía",
    history: "Historial",
    profile: "Perfil",
  },
  help: {
    title: "Ayuda",
    goodPhotos: {
      title: "Cómo hacer buenas fotos",
      body: "• Apunta directamente al cielo, que las nubes llenen el encuadre\n• Busca buena iluminación, evita disparar contra el sol\n• Mantén el móvil estable para evitar fotos borrosas\n• Incluye el horizonte si hay pocas nubes para dar contexto",
    },
    avoidPhotos: {
      title: "Fotos que debes evitar",
      body: "• Imágenes borrosas, muy oscuras o sobreexpuestas\n• Fotos con árboles, edificios u objetos tapando el cielo\n• Disparos directamente contra el sol\n• Imágenes de interiores o sin cielo visible",
    },
    howItWorks: {
      title: "Cómo funciona ClimaNuvem",
      body: "1. Haz una foto del cielo o carga una imagen de tu galería\n2. El modelo de IA analiza el tipo de nubes presentes\n3. La app clasifica el riesgo meteorológico en 8 categorías\n4. Guarda tus predicciones en el historial para consultarlas",
    },
  },
};
