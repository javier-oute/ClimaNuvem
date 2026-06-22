export default {
  home: {
    title: "Benvido a ClimaNuvem",
    subtitle:
      "Fai unha foto ás nubes que che preocupan e darémosche o prognóstico",
  },
  onboarding: {
    title: "Aprende a utilizar ClimaNuvem",
    message:
      "É a túa primeira vez aquí? Ensinámosche a fotografar o ceo e a sacarlle o máximo partido á app.",
    help: "Axuda",
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
          "Filamentos brancos finos e separados, sen sombras e translúcidos. Ás veces con ganchos («rabos de galo»).",
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
          "Veo transparente e abrancazado que cobre o ceo. Produce halos solares e lunares. Non precipita.",
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
          "Banco de nubes brancas ou grises en forma de lousas ou roliños con sombras propias. Forman o popular «ceo empedrado».",
        altitud: "Media (2–7 km)",
        precipita: "Poucas veces",
        identificacion:
          "Lousas ou roliños brancos e grises con sombras propias («ceo empedrado»).",
        montana:
          "Estable en xeral; se forman torreciñas pola mañá, posibles tormentas pola tarde.",
      },
      nimbostratus: {
        nombre: "Nimbostratus",
        descripcion:
          "Capa gris escura velada pola choiva ou neve continua que chega ao chan. Oculta completamente o sol.",
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
          "Manto de nubes grises ou abrancazadas con partes escuras, en forma de lousas ou roliños. A nube baixa máis frecuente.",
        altitud: "Baixa (0–2 km)",
        precipita: "Ocasional e feble",
        identificacion:
          "Lousas ou roliños grises e brancos con claros entre eles. A nube baixa máis frecuente.",
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
    publishedBadge: "Publicada",
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
    usernameInvalidTitle: "Nome de usuario non válido",
    usernameInvalidMsg:
      "Usa entre 3 e 30 caracteres: letras, números ou guion baixo.",
    usernameTakenTitle: "Nome de usuario en uso",
    usernameTakenMsg: "Ese nome de usuario xa está en uso. Proba con outro.",
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
    loading: "Analizando a túa foto do ceo…",
    loadingHint: "Pode tardar uns segundos.",
    notFound: "Non se atopou a imaxe",
    saveError: "Non se puido gardar",
    name: "Nome (opcional)",
    place: "Lugar (opcional)",
    namePlaceholder: "Ex: Nubes negras na casa",
    placeCamera: "Lugar detectado...",
    placeGallery: "Ex: Pico Sacro",
    probability: "Probabilidade",
    defaultName: "Predición",
    description: "Descrición (opcional)",
    descriptionPlaceholder: "Ex: Ceo moi escuro ao oeste",
    descriptionHint: "Se publicas a predición, esta descrición verase no mapa.",
  },
  detail: {
    loading: "Cargando...",
    notFound: "Non se atopou a predición",
    invalidId: "ID non válida.",
    deleteTitle: "Eliminar predición",
    deleteMsg:
      "Seguro que queres eliminala? Esta acción non se pode desfacer.",
    deleteMsgPublished:
      "Esta predición está publicada no mapa. Se a eliminas, tamén se quitará do mapa. Esta acción non se pode desfacer.",
    deleteError: "Non se puido eliminar",
    deleteConfirm: "Eliminar",
    cancel: "Cancelar",
    saved: "Predición gardada:",
    probability: "Probabilidade",
    place: "Lugar",
    error: "Erro",
  },
  login: {
    title: "Benvido a ClimaNuvem!",
    subtitle:
      "Inicia sesión para gardar as túas predicións e acceder a funcións exclusivas",
    guest: "Entrar como convidado",
    google: "Iniciar sesión con Google",
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
    publish: "Publicar",
    publishing: "Publicando…",
    unpublish: "Despublicar",
    unpublishing: "Despublicando…",
    report: "Reportar",
    accept: "Aceptar",
    editProfile: "Editar perfil",
    cancel: "Cancelar",
    signOut: "Pechar sesión",
    tapToZoom: "Toca para ampliar",
  },
  alerts: {
    cielo_despejado: {
      titulo: "Ceo despexado",
      tituloDudoso: "Quizais ceo despexado",
      mensaje: {
        alta: "Non se observan riscos meteorolóxicos. Boas condicións para a actividade.",
        media: "O ceo parece despexado. Aínda así, revísao de cando en vez.",
        baja: "Parece despexado, aínda que a detección non é clara. Bótalle unha ollada ao ceo.",
      },
    },
    nubes_altas_medias: {
      titulo: "Nubes altas, sen perigo inmediato",
      tituloDudoso: "Quizais haxa nubes altas",
      mensaje: {
        alta: "Nubes altas sen risco inmediato. Vixía por se van a máis.",
        media:
          "Posibles nubes altas. Sen perigo a curto prazo; mantente atento aos cambios.",
        baja: "Podería haber nubes altas. Sen certeza; observa a evolución do ceo.",
      },
    },
    lenticular_viento: {
      titulo: "Sinal de vento forte en altura",
      tituloDudoso: "Posible vento forte en altura",
      mensaje: {
        alta: "Nubes lenticulares: vento forte nos cumes. Precaución en zonas expostas.",
        media:
          "Posibles sinais de vento forte en altura. Ten coidado nas cristas.",
        baja: "Podería haber vento forte nos cumes. Sen certeza; valórao antes de exporte.",
      },
    },
    cubierto_precipitacion: {
      titulo: "Ceo cuberto, posible choiva",
      tituloDudoso: "Posible ceo cuberto",
      mensaje: {
        alta: "Ceo cuberto: pode chegar choiva ou neve.",
        media: "Ceo cuberto. Posible precipitación próxima.",
        baja: "Podería haber ceo cuberto e choiva próxima. Sen certeza; vixía o tempo.",
      },
    },
    niebla_stratus: {
      titulo: "Néboa ou nubes baixas",
      tituloDudoso: "Quizais haxa néboa",
      mensaje: {
        alta: "Néboa ou nubes baixas: visibilidade reducida e risco de desorientación.",
        media:
          "Posible néboa ou nubes baixas. A visibilidade pode empeorar; atento á orientación.",
        baja: "Podería haber néboa. Sen certeza; vixía a visibilidade.",
      },
    },
    conveccion_desarrollo: {
      titulo: "Estanse formando nubes de tormenta",
      tituloDudoso: "Quizais se formen nubes de tormenta",
      mensaje: {
        alta: "As nubes medran cara a tormenta. Planifica o descenso e evita cristas.",
        media:
          "O ceo mostra un desenvolvemento que pode acabar en tormenta. Mantente atento e prepárate para descender.",
        baja: "Posible desenvolvemento de nubes de tormenta. Sen certeza; vixía a evolución do ceo.",
      },
    },
    tormenta: {
      titulo: "⚠️ Tormenta",
      tituloDudoso: "Posible tormenta",
      mensaje: {
        alta: "Tormenta activa. Busca refuxio e abandona cristas e cumes de inmediato.",
        media:
          "Hai indicios claros de tormenta. Aléxate de zonas expostas e valora descender.",
        baja: "Podería haber actividade tormentosa, sen certeza. Vixía o ceo e evita zonas expostas.",
      },
    },
    foto_invalida: {
      titulo: "Non se pode analizar a foto",
      mensaje: "Non se pode analizar esta imaxe. Intenta con outra foto.",
    },
    tone: {
      pocoFiable: "Detección pouco fiable: tómaa como orientación.",
      reintentarTitulo: "Imaxe pouco clara",
      reintentarMensaje:
        "O modelo non está seguro desta imaxe. Repite a foto encadrando ben o ceo e evitando obstáculos.",
      errorTitulo: "Erro ao analizar a foto",
      errorMensaje:
        "Produciuse un problema ao analizar a imaxe. Téntao de novo con outra foto.",
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
    locationPrefix: "📍 ",
    forecastLabel: "Prognóstico: ",
    recommendationLabel: "Recomendación: ",
    reliabilityLabel: "Fiabilidade: ",
    footer: "\n— Enviado desde ClimaNuvem",
    defaultTitle: "🌤️ Predición",
    error: "Non se puido compartir",
  },
  camera: {
    permissionTitle: "Permiso de cámara",
    permissionMsg: "Activa a cámara en Axustes para poder facer fotos.",
    cancel: "Cancelar",
    openSettings: "Abrir Axustes",
  },
  permissions: {
    cancel: "Cancelar",
    openSettings: "Abrir Axustes",
    photosTitle: "Permiso de fotos",
    photosMsg: "Activa o acceso ás túas fotos en Axustes para gardar imaxes.",
  },
  save: {
    noImageTitle: "Sen imaxe",
    noImageMsg: "Non hai imaxe para gardar.",
    successTitle: "Gardada ✅",
    successMsg: "A imaxe gardouse na túa galería.",
    error: "Non se puido gardar",
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
    mapConsent: "Compartir no mapa",
    mapConsentOn: "Si",
    mapConsentOff: "Non",
    mapConsentDisableTitle: "Desactivar compartir no mapa",
    mapConsentDisableMsg:
      "Se desactivas esta opción, todas as túas publicacións actuais do mapa eliminaranse. Poderás volver publicar novas predicións se activas esta opción de novo.",
    mapConsentDisableConfirm: "Desactivar",
    mapConsentDisableError: "Non se puido desactivar",
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
    loading: "Cargando...",
    notFound: "Predición non atopada",
    userDescription: "Descrición do usuario",
    yourPublications: "As túas publicacións",
    locationApproxNotice:
      "Por privacidade, a localización das predicións é aproximada",
    consentTitle: "Publicar no mapa",
    consentMsg:
      "A túa foto será visible para a comunidade xunto cunha localización aproximada (non exacta) de onde se tomou. A publicación verase ata que expire (unhas 6 horas) e poderás despublicala cando queiras.",
    publishError: "Non se puido publicar",
    publishLimit:
      "Acadaches o máximo de 3 publicacións activas. Despublica algunha para publicar unha nova.",
    unpublishTitle: "Despublicar predición",
    unpublishMsg: "Quitarase do mapa comunitario. Queres continuar?",
    reportConfirmTitle: "Reportar publicación",
    reportConfirmMsg:
      "Seguro que queres reportar esta publicación? É unha acción importante; faino só se o contido é inapropiado.",
    reportThanksTitle: "Grazas",
    reportThanksMsg: "Recibimos o teu reporte e revisarémolo.",
    actionError: "Non se puido completar a acción",
  },
  help: {
    title: "Axuda",
    intro: {
      title: "Que é ClimaNuvem?",
      body: "Saca unha foto do ceo e ClimaNuvem cóntache que está a pasar aí arriba. En segundos terás un prognóstico a curto prazo e un aviso se hai nubes de risco preto, para que as túas saídas á montaña sexan máis seguras.",
    },
    map: {
      title: "O mapa da comunidade",
      body: "Co mapa non estás só: comparte a túa predición e consulta as doutra xente que xa está na montaña. Un vistazo e sabes que tempo fai en distintas zonas, perfecto para decidir a onde ir e preparar a saída con máis seguridade.",
    },
    features: {
      title: "Máis cousas que podes facer",
      body: "Ademais, ClimaNuvem inclúe unha guía de nubes para aprender a identificalas, un historial con todas as túas predicións gardadas, e un perfil onde axustar o tema (claro ou escuro), o idioma e os teus datos de usuario.",
    },
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
  },
};
