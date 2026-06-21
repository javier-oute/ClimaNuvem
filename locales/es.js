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
    categoriesShort: {
      high: "Altas",
      mid: "Medias",
      low: "Bajas",
      vertical: "Vertical",
    },
    detail: {
      categoria: "Categoría",
      altitud: "Altitud típica",
      abreviatura: "Abreviatura",
      precipita: "Precipitación",
      descripcionTitulo: "Descripción",
      identificacionTitulo: "Cómo identificarla",
      montanaTitulo: "Qué significa en montaña",
      riesgoTitulo: "Riesgo",
      riesgo: {
        0: "Sin riesgo",
        1: "Vigilancia",
        2: "Precaución",
        3: "Riesgo alto",
        4: "Peligro",
      },
    },
    clouds: {
      cirrus: {
        nombre: "Cirrus",
        descripcion:
          "Filamentos blancos y delicados de aspecto sedoso o fibroso, formados por cristales de hielo a gran altitud.",
        altitud: "Alta (6–12 km)",
        precipita: "No",
        identificacion:
          "Filamentos blancos finos y separados, sin sombras y translúcidos. A veces con ganchos («colas de yegua»).",
        montana:
          "Riesgo bajo. Si aumentan y se espesan hacia el oeste, anuncian lluvia en 12–24 h.",
      },
      cirrocumulus: {
        nombre: "Cirrocumulus",
        descripcion:
          "Capa delgada de pequeños glóbulos blancos sin sombras propias. Señal de corrientes en chorro y turbulencia en altura.",
        altitud: "Alta (6–12 km)",
        precipita: "No",
        identificacion:
          "Granos blancos muy pequeños alineados en ondas («aborregado» fino), sin sombras.",
        montana:
          "Señal de aire inestable en altura; suele preceder a un cambio de tiempo.",
      },
      cirrostratus: {
        nombre: "Cirrostratus",
        descripcion:
          "Velo transparente y blanquecino que cubre el cielo. Produce halos solares y lunares. No precipita.",
        altitud: "Alta (6–12 km)",
        precipita: "No",
        identificacion:
          "Velo lechoso uniforme con halo de 22° alrededor del sol o la luna.",
        montana:
          "El halo avisa de un frente cálido: posible lluvia en 12–24 h.",
      },
      altostratus: {
        nombre: "Altostratus",
        descripcion:
          "Manto grisáceo o azulado que cubre el cielo. El sol aparece como a través de un vidrio deslustrado.",
        altitud: "Media (2–7 km)",
        precipita: "A veces, llovizna o nieve débil",
        identificacion:
          "Manto gris que difumina el sol, «como tras un cristal esmerilado».",
        montana: "Fase previa a lluvia continua. El tiempo va a peor.",
      },
      altocumulus: {
        nombre: "Altocumulus",
        descripcion:
          "Banco de nubes blancas o grises en forma de losetas o rodillos con sombras propias. Forman el popular «cielo empedrado».",
        altitud: "Media (2–7 km)",
        precipita: "Rara vez",
        identificacion:
          "Losetas o rodillos blancos y grises con sombras propias («cielo empedrado»).",
        montana:
          "Estable en general; si forman torrecillas por la mañana, posibles tormentas por la tarde.",
      },
      nimbostratus: {
        nombre: "Nimbostratus",
        descripcion:
          "Capa gris oscura velada por lluvia o nieve continua que llega al suelo. Oculta completamente el sol.",
        altitud: "Media a baja (base 0,5–3 km)",
        precipita: "Sí, lluvia o nieve continua",
        identificacion:
          "Capa gris oscura y densa que oculta el sol, con lluvia o nieve continua.",
        montana:
          "Precipitación prolongada y mala visibilidad: poco apta para cumbres.",
      },
      stratus: {
        nombre: "Stratus",
        descripcion:
          "Capa muy baja y gris con base uniforme, entre el suelo y 800 m. Las nieblas son stratus al ras del suelo.",
        altitud: "Baja (0–2 km)",
        precipita: "Llovizna débil o cinarra",
        identificacion:
          "Capa gris uniforme muy baja; a ras de suelo es niebla.",
        montana: "Visibilidad muy reducida: alto riesgo de desorientación.",
      },
      stratocumulus: {
        nombre: "Stratocumulus",
        descripcion:
          "Manto de nubes grises o blanquecinas con partes oscuras, en forma de losas o rodillos. La nube baja más frecuente.",
        altitud: "Baja (0–2 km)",
        precipita: "Ocasional y débil",
        identificacion:
          "Losas o rodillos grises y blancos con claros entre ellos. La nube baja más frecuente.",
        montana: "Tiempo tranquilo aunque cubierto; puede tapar las cumbres.",
      },
      cumulus: {
        nombre: "Cumulus",
        descripcion:
          "Nubes aisladas y densas con cúpulas en forma de coliflor. Base oscura y horizontal. Producen aguaceros locales.",
        altitud: "Base baja (0,5–2 km), desarrollo vertical",
        precipita: "Chubascos si crecen (congestus)",
        identificacion:
          "Nubes algodonosas con cúpulas de coliflor y base plana. Vigila si crecen en altura.",
        montana:
          "Si engordan y la torre supera su anchura, evolucionan a tormenta. Anticipa el descenso.",
      },
      cumulonimbus: {
        nombre: "Cumulonimbus",
        descripcion:
          "Nube densa y potente con cima en forma de yunque. Topes hasta 35 km. Origen de tormentas, tornados y granizo.",
        altitud: "Base baja; cima hasta 12–16 km",
        precipita: "Sí, intensa: chubascos, granizo y aparato eléctrico",
        identificacion:
          "Nube enorme y oscura con cima en yunque. A menudo con rayos y granizo.",
        montana:
          "PELIGRO: tormenta activa. Abandona crestas y busca refugio de inmediato.",
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
    publishedBadge: "Publicada",
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
    usernameInvalidTitle: "Nombre de usuario no válido",
    usernameInvalidMsg:
      "Usa entre 3 y 30 caracteres: letras, números o guion bajo.",
    usernameTakenTitle: "Nombre de usuario en uso",
    usernameTakenMsg: "Ese nombre de usuario ya está en uso. Prueba con otro.",
    avatar: {
      sheetTitle: "Foto de perfil",
      camera: "Hacer foto",
      gallery: "Elegir de la galería",
      remove: "Quitar foto",
      cancel: "Cancelar",
      edit: "Cambiar foto",
      uploadError: "No se pudo subir la imagen",
    },
    deleteAccount: {
      button: "Eliminar cuenta",
      modalTitle: "Eliminar cuenta",
      modalWarning:
        "Esta acción es permanente e irreversible. Se borrarán tu perfil, todas tus predicciones, tus imágenes y tu avatar. No podrás recuperar nada.",
      confirmPrompt: "Escribe ELIMINAR para confirmar",
      confirmWord: "ELIMINAR",
      placeholder: "ELIMINAR",
      cancel: "Cancelar",
      confirm: "Eliminar definitivamente",
      deleting: "Eliminando…",
      error: "No se pudo eliminar la cuenta. Inténtalo de nuevo.",
    },
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
    description: "Descripción",
    descriptionPlaceholder: "Añade un comentario (opcional)",
    descriptionHint:
      "Si publicas la predicción, esta descripción se verá en el mapa.",
  },
  detail: {
    loading: "Cargando...",
    notFound: "No se encontró la predicción",
    invalidId: "ID inválida.",
    deleteTitle: "Eliminar predicción",
    deleteMsg:
      "¿Seguro que quieres eliminarla? Esta acción no se puede deshacer.",
    deleteMsgPublished:
      "Esta predicción está publicada en el mapa. Si la eliminas, también se quitará del mapa. Esta acción no se puede deshacer.",
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
    google: "Iniciar sesión con Google",
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
    publish: "Publicar",
    publishing: "Publicando…",
    unpublish: "Despublicar",
    unpublishing: "Despublicando…",
    report: "Reportar",
    accept: "Aceptar",
    editProfile: "Editar perfil",
    cancel: "Cancelar",
    signOut: "Cerrar sesión",
  },
  alerts: {
    cielo_despejado: {
      titulo: "Cielo despejado",
      tituloDudoso: "Tal vez cielo despejado",
      mensaje: {
        alta: "No se observan riesgos meteorológicos. Buenas condiciones para la actividad.",
        media: "El cielo parece despejado. Aun así, revísalo de vez en cuando.",
        baja: "Parece despejado, aunque la detección no es clara. Echa un vistazo al cielo.",
      },
    },
    nubes_altas_medias: {
      titulo: "Nubes altas, sin peligro inmediato",
      tituloDudoso: "Quizá haya nubes altas",
      mensaje: {
        alta: "Nubes altas sin riesgo inmediato. Vigila por si van a más.",
        media:
          "Posibles nubes altas. Sin peligro a corto plazo; mantente atento a los cambios.",
        baja: "Podría haber nubes altas. Sin certeza; observa la evolución del cielo.",
      },
    },
    lenticular_viento: {
      titulo: "Señal de viento fuerte en altura",
      tituloDudoso: "Posible viento fuerte en altura",
      mensaje: {
        alta: "Nubes lenticulares: viento fuerte en cumbres. Precaución en zonas expuestas.",
        media:
          "Posibles señales de viento fuerte en altura. Ten cuidado en las crestas.",
        baja: "Podría haber viento fuerte en cumbres. Sin certeza; valóralo antes de exponerte.",
      },
    },
    cubierto_precipitacion: {
      titulo: "Cielo cubierto, posible lluvia",
      tituloDudoso: "Posible cielo cubierto",
      mensaje: {
        alta: "Cielo cubierto: puede llegar lluvia o nieve.",
        media: "Cielo cubierto. Posible precipitación próxima.",
        baja: "Podría haber cielo cubierto y lluvia próxima. Sin certeza; vigila el tiempo.",
      },
    },
    niebla_stratus: {
      titulo: "Niebla o nubes bajas",
      tituloDudoso: "Quizá haya niebla",
      mensaje: {
        alta: "Niebla o nubes bajas: visibilidad reducida y riesgo de desorientación.",
        media:
          "Posible niebla o nubes bajas. La visibilidad puede empeorar; atento a la orientación.",
        baja: "Podría haber niebla. Sin certeza; vigila la visibilidad.",
      },
    },
    conveccion_desarrollo: {
      titulo: "Se están formando nubes de tormenta",
      tituloDudoso: "Quizá se formen nubes de tormenta",
      mensaje: {
        alta: "Las nubes crecen hacia tormenta. Planifica el descenso y evita crestas.",
        media:
          "El cielo muestra un desarrollo que puede acabar en tormenta. Mantente atento y prepárate para descender.",
        baja: "Posible desarrollo de nubes de tormenta. Sin certeza; vigila la evolución del cielo.",
      },
    },
    tormenta: {
      titulo: "⚠️ Tormenta",
      tituloDudoso: "Posible tormenta",
      mensaje: {
        alta: "Tormenta activa. Busca refugio y abandona crestas y cumbres de inmediato.",
        media:
          "Hay indicios claros de tormenta. Aléjate de zonas expuestas y valora descender.",
        baja: "Podría haber actividad tormentosa, sin certeza. Vigila el cielo y evita zonas expuestas.",
      },
    },
    foto_invalida: {
      titulo: "No se puede analizar la foto",
      mensaje: "No se puede analizar esta imagen. Intenta con otra foto.",
    },
    tone: {
      pocoFiable: "Detección poco fiable: tómala como orientación.",
      reintentarTitulo: "Imagen poco clara",
      reintentarMensaje:
        "El modelo no está seguro de esta imagen. Repite la foto encuadrando bien el cielo y evitando obstáculos.",
      errorTitulo: "Error al analizar la foto",
      errorMensaje:
        "Ocurrió un problema al analizar la imagen. Inténtalo de nuevo con otra foto.",
      repetirFoto: "Repetir foto",
    },
    fiabilidad: {
      label: "Fiabilidad",
      alta: "Alta",
      media: "Media",
      baja: "Baja",
    },
  },
  share: {
    predictionPrefix: "🌤️ Predicción: ",
    locationPrefix: "📍 ",
    forecastLabel: "Pronóstico: ",
    recommendationLabel: "Recomendación: ",
    reliabilityLabel: "Fiabilidad: ",
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
    mapConsent: "Compartir en el mapa",
    mapConsentOn: "Sí",
    mapConsentOff: "No",
    mapConsentDisableTitle: "Desactivar compartir en el mapa",
    mapConsentDisableMsg:
      "Si desactivas esta opción, todas tus publicaciones actuales del mapa se eliminarán. Podrás volver a publicar nuevas predicciones si activas esta opción de nuevo.",
    mapConsentDisableConfirm: "Desactivar",
    mapConsentDisableError: "No se pudo desactivar",
  },
  tabs: {
    home: "Home",
    guide: "Guía",
    history: "Historial",
    profile: "Perfil",
    map: "Mapa",
  },
  community: {
    prediction: "Predicción comunitaria",
    publishedAt: "Publicado",
    expiresIn: "Expira en",
    expired: "Caducada",
    loading: "Cargando...",
    notFound: "Predicción no encontrada",
    userDescription: "Descripción del usuario",
    yourPublications: "Tus publicaciones",
    consentTitle: "Publicar en el mapa",
    consentMsg:
      "Tu foto será visible para la comunidad junto con una ubicación aproximada (no exacta) de dónde se tomó. La publicación se verá hasta que expire (unas 6 horas) y podrás despublicarla cuando quieras.",
    publishError: "No se pudo publicar",
    publishLimit:
      "Has alcanzado el máximo de 3 publicaciones activas. Despublica alguna para publicar una nueva.",
    unpublishTitle: "Despublicar predicción",
    unpublishMsg: "Se quitará del mapa comunitario. ¿Quieres continuar?",
    reportConfirmTitle: "Reportar publicación",
    reportConfirmMsg:
      "¿Seguro que quieres reportar esta publicación? Es una acción importante; hazlo solo si el contenido es inapropiado.",
    reportThanksTitle: "Gracias",
    reportThanksMsg: "Hemos recibido tu reporte y lo revisaremos.",
    actionError: "No se pudo completar la acción",
  },
  help: {
    title: "Ayuda",
    goodPhotos: {
      title: "Cómo hacer buenas fotos",
      body: "Sujeta el móvil en horizontal, con el cielo arriba y sin inclinarlo. Apunta directamente al cielo y deja que las nubes llenen el encuadre, con buena iluminación y sin disparar contra el sol. Mantén el móvil estable para que la foto no salga movida y, si hay pocas nubes, incluye el horizonte para dar contexto.",
    },
    avoidPhotos: {
      title: "Fotos que debes evitar",
      intro: "Estas fotos dificultan o impiden el análisis. Procura evitarlas:",
      objects:
        "Apunta bien al cielo y evita al máximo objetos, árboles, edificios o personas en primer plano. Evita también la orientación vertical: sujeta el móvil en horizontal para que quepa toda la nube.",
      visibility:
        "Evita fotos con mala visibilidad, como de noche o a contraluz. El modelo necesita ver el cielo y las nubes con claridad.",
      blurry:
        "Evita fotos borrosas o movidas, y cuidado con tapar el objetivo con el dedo (el mítico dedo).",
    },
    howItWorks: {
      title: "Cómo funciona ClimaNuvem",
      body: "1. Haz una foto del cielo o elige una imagen de tu galería.\n2. La IA analiza el tipo de nubes y su grado de desarrollo.\n3. ClimaNuvem clasifica el riesgo en una de 8 categorías y te muestra una alerta.\n4. Guarda la predicción en tu historial para consultarla cuando quieras.",
    },
  },
};
