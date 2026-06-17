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
    categoriesShort: {
      high: "Altas",
      mid: "Medias",
      low: "Baixas",
      vertical: "Vertical",
    },
    detail: {
      categoria: "Categoría",
      altitud: "Altitude típica",
      abreviatura: "Abreviatura",
      precipita: "Precipitación",
      descripcionTitulo: "Descrición",
      identificacionTitulo: "Como identificala",
      montanaTitulo: "Que significa na montaña",
      riesgoTitulo: "Risco",
      riesgo: {
        0: "Sen risco",
        1: "Vixilancia",
        2: "Precaución",
        3: "Risco alto",
        4: "Perigo",
      },
    },
    clouds: {
      cirrus: {
        nombre: "Cirrus",
        descripcion:
          "Filamentos brancos e delicados de aspecto sedoso ou fibroso, formados por cristais de xeo a gran altitude.",
        altitud: "Alta (6–12 km)",
        precipita: "Non",
        identificacion:
          "Filamentos brancos finos e separados, sen sombras e translúcidos. Ás veces con ganchos («colas de egua»).",
        montana:
          "Risco baixo. Se aumentan e se espesan cara ao oeste, anuncian choiva en 12–24 h.",
      },
      cirrocumulus: {
        nombre: "Cirrocumulus",
        descripcion:
          "Capa delgada de pequenos glóbulos brancos sen sombras propias. Sinal de correntes en chorro e turbulencia en altura.",
        altitud: "Alta (6–12 km)",
        precipita: "Non",
        identificacion:
          "Grans brancos moi pequenos aliñados en ondas («aborregado» fino), sen sombras.",
        montana:
          "Sinal de aire inestable en altura; adoita preceder a un cambio de tempo.",
      },
      cirrostratus: {
        nombre: "Cirrostratus",
        descripcion:
          "Veo transparente e branquecino que cobre o ceo. Produce halos solares e lunares. Non precipita.",
        altitud: "Alta (6–12 km)",
        precipita: "Non",
        identificacion:
          "Veo leitoso uniforme cun halo de 22° arredor do sol ou a lúa.",
        montana: "O halo avisa dunha fronte cálida: posible choiva en 12–24 h.",
      },
      altostratus: {
        nombre: "Altostratus",
        descripcion:
          "Manto grisáceo ou azulado que cobre o ceo. O sol aparece como a través dun vidro mate.",
        altitud: "Media (2–7 km)",
        precipita: "Ás veces, orballo ou neve feble",
        identificacion:
          "Manto gris que difumina o sol, «como tras un cristal mate».",
        montana: "Fase previa a choiva continua. O tempo vai a peor.",
      },
      altocumulus: {
        nombre: "Altocumulus",
        descripcion:
          "Banco de nubes brancas ou grises en forma de losetas ou roliños con sombras propias. Forman o popular «ceo empedrado».",
        altitud: "Media (2–7 km)",
        precipita: "Poucas veces",
        identificacion:
          "Losetas ou roliños brancos e grises con sombras propias («ceo empedrado»).",
        montana:
          "Estable en xeral; se forman torreciñas pola mañá, posibles tormentas pola tarde.",
      },
      nimbostratus: {
        nombre: "Nimbostratus",
        descripcion:
          "Capa gris escura velada pola chuvia ou neve continua que chega ao chan. Oculta completamente o sol.",
        altitud: "Media a baixa (base 0,5–3 km)",
        precipita: "Si, choiva ou neve continua",
        identificacion:
          "Capa gris escura e densa que oculta o sol, con choiva ou neve continua.",
        montana:
          "Precipitación prolongada e mala visibilidade: pouco apta para cumes.",
      },
      stratus: {
        nombre: "Stratus",
        descripcion:
          "Capa moi baixa e gris con base uniforme, entre o chan e 800 m. As néboas son stratus ao ras do chan.",
        altitud: "Baixa (0–2 km)",
        precipita: "Orballo feble",
        identificacion: "Capa gris uniforme moi baixa; ao ras do chan é néboa.",
        montana: "Visibilidade moi reducida: alto risco de desorientación.",
      },
      stratocumulus: {
        nombre: "Stratocumulus",
        descripcion:
          "Manto de nubes grises ou branquecinas con partes escuras, en forma de losas ou roliños. A nube baixa máis frecuente.",
        altitud: "Baixa (0–2 km)",
        precipita: "Ocasional e feble",
        identificacion:
          "Losas ou roliños grises e brancos con claros entre eles. A nube baixa máis frecuente.",
        montana: "Tempo tranquilo aínda que cuberto; pode tapar os cumes.",
      },
      cumulus: {
        nombre: "Cumulus",
        descripcion:
          "Nubes illadas e densas con cúpulas en forma de coliflor. Base escura e horizontal. Producen aguaceiros locais.",
        altitud: "Base baixa (0,5–2 km), desenvolvemento vertical",
        precipita: "Chuvascos se medran (congestus)",
        identificacion:
          "Nubes algodoadas con cúpulas de coliflor e base plana. Vixía se medran en altura.",
        montana:
          "Se engordan e a torre supera a súa anchura, evolucionan a tormenta. Anticipa o descenso.",
      },
      cumulonimbus: {
        nombre: "Cumulonimbus",
        descripcion:
          "Nube densa e potente con cima en forma de zafra. Topes ata 35 km. Orixe de tormentas, tornados e sarabia.",
        altitud: "Base baixa; cima ata 12–16 km",
        precipita: "Si, intensa: chuvascos, sarabia e aparato eléctrico",
        identificacion:
          "Nube enorme e escura con cima en zafra. A miúdo con raios e sarabia.",
        montana:
          "PERIGO: tormenta activa. Abandona as cristas e busca refuxio de inmediato.",
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
    avatar: {
      sheetTitle: "Foto de perfil",
      camera: "Facer foto",
      gallery: "Escoller da galería",
      remove: "Quitar foto",
      cancel: "Cancelar",
      edit: "Cambiar foto",
      uploadError: "Non se puido subir a imaxe",
    },
    deleteAccount: {
      button: "Eliminar conta",
      modalTitle: "Eliminar conta",
      modalWarning:
        "Esta acción é permanente e irreversible. Borraranse o teu perfil, todas as túas predicións, as túas imaxes e o teu avatar. Non poderás recuperar nada.",
      confirmPrompt: "Escribe ELIMINAR para confirmar",
      confirmWord: "ELIMINAR",
      placeholder: "ELIMINAR",
      cancel: "Cancelar",
      confirm: "Eliminar definitivamente",
      deleting: "Eliminando…",
      error: "Non se puido eliminar a conta. Téntao de novo.",
    },
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
      mensaje: {
        alta: "Non se observan riscos meteorolóxicos. Boas condicións para a actividade.",
        media: "O ceo parece despexado. Aínda así, revísao de cando en vez.",
        baja: "Parece despexado, aínda que a detección non é clara. Bótalle unha ollada ao ceo.",
      },
    },
    nubes_altas_medias: {
      titulo: "Nubes altas, sen perigo inmediato",
      mensaje: {
        alta: "Nubes altas sen risco inmediato. Vixía por se van a máis.",
        media:
          "Posibles nubes altas. Sen perigo a curto prazo; mantente atento aos cambios.",
        baja: "Podería haber nubes altas. Sen certeza; observa a evolución do ceo.",
      },
    },
    lenticular_viento: {
      titulo: "Sinal de vento forte en altura",
      mensaje: {
        alta: "Nubes lenticulares: vento forte nas cumes. Precaución en zonas expostas.",
        media:
          "Posibles sinais de vento forte en altura. Ten coidado nas cristas.",
        baja: "Podería haber vento forte nas cumes. Sen certeza; valórao antes de exporte.",
      },
    },
    cubierto_precipitacion: {
      titulo: "Ceo cuberto, posible chuvia",
      mensaje: {
        alta: "Ceo cuberto: pode chegar chuvia ou neve. Prepárate por se empeora.",
        media:
          "Ceo cuberto. Posible precipitación próxima; leva protección.",
        baja: "Podería haber ceo cuberto e chuvia próxima. Sen certeza; vixía o tempo.",
      },
    },
    niebla_stratus: {
      titulo: "Néboa ou nubes baixas",
      mensaje: {
        alta: "Néboa ou nubes baixas: visibilidade reducida e risco de desorientación. Extrema a precaución.",
        media:
          "Posible néboa ou nubes baixas. A visibilidade pode empeorar; atento á orientación.",
        baja: "Podería haber néboa. Sen certeza; vixía a visibilidade antes de avanzar.",
      },
    },
    conveccion_desarrollo: {
      titulo: "Estanse formando nubes de tormenta",
      mensaje: {
        alta: "As nubes medran cara a tormenta. Planifica o descenso e evita cristas.",
        media:
          "O ceo mostra un desenvolvemento que pode acabar en tormenta. Mantente atento e prepárate para descender.",
        baja: "Posible desenvolvemento de nubes de tormenta. Sen certeza; vixía a evolución do ceo.",
      },
    },
    tormenta: {
      titulo: "⚠️ Tormenta",
      mensaje: {
        alta: "Tormenta activa. Busca refuxio e abandona cristas e cumes de inmediato.",
        media:
          "Hai indicios claros de tormenta. Aléxate de zonas expostas e valora descender xa.",
        baja: "Podería haber actividade tormentosa, sen certeza. Vixía o ceo e evita zonas expostas.",
      },
    },
    foto_invalida: {
      titulo: "Non se pode analizar a foto",
      mensaje: "Non se pode analizar esta imaxe. Intenta con outra foto.",
    },
    tone: {
      podriaSerTambien: "Tamén podería ser:",
      pocoFiable: "Detección pouco fiable: tómaa como orientación.",
      reintentarTitulo: "Imaxe pouco clara",
      reintentarMensaje:
        "O modelo non está seguro desta imaxe. Repite a foto encadrando ben o ceo e evitando obstáculos.",
      repetirFoto: "Repetir foto",
    },
    fiabilidad: {
      label: "Fiabilidade",
      alta: "Alta",
      media: "Media",
      baja: "Baixa",
    },
  },
  share: {
    predictionPrefix: "🌤️ Predición: ",
    locationPrefix: "📍 ",
    forecastLabel: "Prognóstico: ",
    recommendationLabel: "Recomendación: ",
    reliabilityLabel: "Fiabilidade: ",
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
    map: "Mapa",
  },
  community: {
    prediction: "Predición comunitaria",
    publishedAt: "Publicado",
    expiresIn: "Expira en",
    expired: "Caducada",
    by: "Por",
    anonymous: "Anónimo",
    loading: "Cargando...",
    notFound: "Predición non atopada",
  },
  help: {
    title: "Axuda",
    goodPhotos: {
      title: "Como facer boas fotos",
      body: "Suxeita o móbil en horizontal, co ceo arriba e sen inclinalo. Apunta directamente ao ceo e deixa que as nubes enchan o encadre, con boa iluminación e sen disparar contra o sol. Mantén o móbil estable para que a foto non saia movida e, se hai poucas nubes, inclúe o horizonte para dar contexto.",
    },
    avoidPhotos: {
      title: "Fotos que debes evitar",
      intro: "Estas fotos dificultan ou impiden a análise. Procura evitalas:",
      objects:
        "Apunta ben ao ceo e evita ao máximo obxectos, árbores, edificios ou persoas en primeiro plano. Evita tamén a orientación vertical: suxeita o móbil en horizontal para que caiba toda a nube.",
      visibility:
        "Evita fotos con mala visibilidade, como de noite ou a contraluz. O modelo necesita ver o ceo e as nubes con claridade.",
      blurry:
        "Evita fotos borrosas ou movidas, e coidado con tapar o obxectivo co dedo (o mítico dedo).",
    },
    howItWorks: {
      title: "Como funciona ClimaNuvem",
      body: "1. Fai unha foto do ceo ou elixe unha imaxe da túa galería.\n2. A IA analiza o tipo de nubes e o seu grao de desenvolvemento.\n3. ClimaNuvem clasifica o risco nunha de 8 categorías e amósache unha alerta.\n4. Garda a predición no teu historial para consultala cando queiras.",
    },
  },
};
