export default {
  home: {
    title: "Benvido a ClimaNuvem",
    subtitle:
      "Fai unha foto ás nubes que che preocupan e darémosche o prognóstico",
  },
  guide: {
    title: "Tipos de nubes",
    subtitle: "Os 10 xéneros do Atlas Internacional de Nubes (OMM).",
    categories: {
      high: "Nubes Altas",
      mid: "Nubes Medias",
      low: "Nubes Baixas",
      vertical: "Desenvolvemento Vertical",
    },
    clouds: {
      cirrus: {
        nombre: "Cirrus",
        descripcion:
          "Filamentos brancos e delicados de aspecto sedoso ou fibroso, formados por cristais de xeo a gran altitude.",
      },
      cirrocumulus: {
        nombre: "Cirrocumulus",
        descripcion:
          "Capa delgada de pequenos glóbulos brancos sen sombras propias. Sinal de correntes en chorro e turbulencia en altura.",
      },
      cirrostratus: {
        nombre: "Cirrostratus",
        descripcion:
          "Veo transparente e branquecino que cobre o ceo. Produce halos solares e lunares. Non precipita.",
      },
      altostratus: {
        nombre: "Altostratus",
        descripcion:
          "Manto grisáceo ou azulado que cobre o ceo. O sol aparece como a través dun vidro mate.",
      },
      altocumulus: {
        nombre: "Altocumulus",
        descripcion:
          "Banco de nubes brancas ou grises en forma de losetas ou roliños con sombras propias. Forman o popular «ceo empedrado».",
      },
      nimbostratus: {
        nombre: "Nimbostratus",
        descripcion:
          "Capa gris escura velada pola chuvia ou neve continua que chega ao chan. Oculta completamente o sol.",
      },
      stratus: {
        nombre: "Stratus",
        descripcion:
          "Capa moi baixa e gris con base uniforme, entre o chan e 800 m. As néboas son stratus ao ras do chan.",
      },
      stratocumulus: {
        nombre: "Stratocumulus",
        descripcion:
          "Manto de nubes grises ou branquecinas con partes escuras, en forma de losas ou roliños. A nube baixa máis frecuente.",
      },
      cumulus: {
        nombre: "Cumulus",
        descripcion:
          "Nubes illadas e densas con cúpulas en forma de coliflor. Base escura e horizontal. Producen aguaceiros locais.",
      },
      cumulonimbus: {
        nombre: "Cumulonimbus",
        descripcion:
          "Nube densa e potente con cima en forma de yunque. Cumes ata 35 km. Orixe de tormentas, tornados e sarabia.",
      },
    },
  },
  history: {
    title: "Historial",
    search: "Buscar...",
    empty: "Non hai datos",
    prediction: "Predición",
    date: "Data",
    forecast: "Prognóstico",
    probability: "Probabilidade",
  },
  profile: {
    fullName: "Nome completo",
    phone: "Teléfono",
    username: "Nome de usuario",
    fullNamePlaceholder: "Ex: Xavier Oute",
    phonePlaceholder: "Ex: +34 612 345 678",
    usernamePlaceholder: "Ex: sara_garcia",
    editing: "Editando perfil…",
    saved: "Cambios gardados con éxito ✅",
    invalidPhone: "Teléfono non válido",
    invalidPhoneMsg: "Usa formato tipo +34 600 123 456",
    saveError: "Non se puido gardar",
    noName: "Sen nome",
  },
  forecast: {
    loading: "Cargando...",
    generating: "Xerando prognóstico…",
    notFound: "Non se atopou a imaxe",
    saveError: "Non se puido gardar",
    name: "Nome",
    place: "Lugar",
    namePlaceholder: "Ex: Nubes negras na casa",
    placeCamera: "Lugar detectado...",
    placeGallery: "Lugar (opcional)",
    probability: "Probabilidade",
    defaultName: "Predición",
  },
  detail: {
    loading: "Cargando...",
    notFound: "Non se atopou a predición",
    invalidId: "ID non válida.",
    deleteTitle: "Eliminar predición",
    deleteMsg:
      "¿Seguro que queres eliminala? Esta acción non se pode desfacer.",
    deleteError: "Non se puido eliminar",
    deleteConfirm: "Eliminar",
    cancel: "Cancelar",
    saved: "Predición gardada:",
    probability: "Probabilidade",
    place: "Lugar",
    error: "Erro",
  },
  login: {
    title: "¡Benvido a ClimaNuvem!",
    subtitle:
      "Inicia sesión para gardar as túas predicións e acceder a funcións exclusivas",
    guest: "Entrar como convidado",
  },
  buttons: {
    takePhoto: "Facer foto",
    loadImage: "Cargar imaxe",
    save: "Gardar",
    saving: "Gardando…",
    discard: "Descartar",
    delete: "Eliminar",
    deleting: "Eliminando...",
    share: "Compartir",
    editProfile: "Editar perfil",
    cancel: "Cancelar",
    signOut: "Pechar sesión",
  },
  alerts: {
    cielo_despejado: {
      titulo: "Ceo despexado",
      mensaje: "Sen riscos meteorolóxicos. Boas condicións.",
    },
    nubes_altas_medias: {
      titulo: "Nubes altas ou medias",
      mensaje: "Posible cambio de tempo. Monitoriza o ceo.",
    },
    lenticular_viento: {
      titulo: "Vento forte en altura",
      mensaje: "Nubes lenticulares detectadas. Vento intenso nas cumes.",
    },
    cubierto_precipitacion: {
      titulo: "Risco de precipitación",
      mensaje: "Ceo cuberto. Posible chuvia ou neve próxima.",
    },
    niebla_stratus: {
      titulo: "Néboa ou stratus baixo",
      mensaje: "Visibilidade reducida. Risco de desorientación.",
    },
    conveccion_desarrollo: {
      titulo: "Convección en desenvolvemento",
      mensaje: "Nubes de tormenta formándose. Considera descender.",
    },
    tormenta: {
      titulo: "⚠️ PERIGO — Tormenta",
      mensaje: "Tormenta activa. Busca refuxio inmediatamente.",
    },
    foto_invalida: {
      titulo: "Foto non válida",
      mensaje: "Non se pode analizar esta imaxe. Intenta con outra foto.",
    },
  },
  share: {
    predictionPrefix: "🌤️ Predición: ",
    locationPrefix: "📍 ",
    forecastLabel: "Prognóstico: ",
    probabilityLabel: "Probabilidade: ",
    footer: "\n— Enviado desde ClimaNuvem",
    defaultTitle: "Predición",
    error: "Non se puido compartir",
  },
  camera: {
    permissionTitle: "Permiso de cámara",
    permissionMsg: "Activa a cámara en Axustes para poder facer fotos.",
    cancel: "Cancelar",
    openSettings: "Abrir Axustes",
  },
  settings: {
    title: "Preferencias",
    language: "Idioma",
    theme: "Tema",
    themeLight: "Claro",
    themeDark: "Escuro",
    themeSystem: "Sistema",
    langEs: "Español",
    langGl: "Galego",
    langEn: "English",
  },
  tabs: {
    home: "Inicio",
    guide: "Guía",
    history: "Historial",
    profile: "Perfil",
  },
  help: {
    title: "Axuda",
    goodPhotos: {
      title: "Como facer boas fotos",
      body: "• Apunta directamente ao ceo, que as nubes enchen o encadre\n• Busca boa iluminación, evita disparar contra o sol\n• Mantén o móbil estable para evitar fotos borrosas\n• Inclúe o horizonte se hai poucas nubes para dar contexto",
    },
    avoidPhotos: {
      title: "Fotos que debes evitar",
      body: "• Imaxes borrosas, moi escuras ou sobreexpostas\n• Fotos con árbores, edificios ou obxectos tapando o ceo\n• Disparos directamente contra o sol\n• Imaxes de interiores ou sen ceo visible",
    },
    howItWorks: {
      title: "Como funciona ClimaNuvem",
      body: "1. Fai unha foto do ceo ou carga unha imaxe da túa galería\n2. O modelo de IA analiza o tipo de nubes presentes\n3. A app clasifica o risco meteorolóxico en 8 categorías\n4. Garda as túas predicións no historial para consultalas",
    },
  },
};
