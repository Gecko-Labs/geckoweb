import re
path='src/i18n/translations.js'
s=open(path,encoding='utf-8').read()

laudia_pt = """    laudia: {
      hero: { title: "LaudIA", subtitle: "Plataforma de IA para auxiliar na elaboracao de laudos clinicos multiprofissionais.", ctaPrimary: "Conhecer o produto", ctaSecondary: "Falar com suporte" },
      what: { title: "O que e o LaudIA?", description: "O LaudIA e um aplicativo desktop para clinicas multiprofissionais que reune gestao de pacientes e profissionais e uma central de IA para auxiliar na redacao de laudos fundamentados em estudos cientificos, sempre com revisao e assinatura do profissional responsavel." },
      features: { title: "Funcionalidades e modulos",
        patients: { title: "Gestao de pacientes", desc: "Cadastro e organizacao de pacientes." },
        consultations: { title: "Organizacao de consultas", desc: "Estruturacao das informacoes das consultas." },
        forms: { title: "Formularios e coleta", desc: "Coleta estruturada de informacoes." },
        instrumentation: { title: "Instrumentacao psicologica", desc: "Aplicacao e organizacao de instrumentos." },
        ai: { title: "Assistencia por IA", desc: "Apoio na redacao de documentos." },
        reports: { title: "Elaboracao de laudos", desc: "Auxilio na redacao de laudos." },
        results: { title: "Consulta de resultados", desc: "Gerenciamento e consulta de resultados." },
      },
      ai: { title: "Inteligencia artificial", description: "A IA e uma ferramenta de assistencia para agilizar a organizacao e a elaboracao de documentos. Ela nao substitui a avaliacao e a responsabilidade profissional." },
      instrumentation: { title: "Instrumentacao e Instrument.IA", description: "A integracao com o Instrument.IA esta planejada: resultados de instrumentos psicologicos poderao ser usados como contexto auxiliar na elaboracao de laudos, mantendo fontes e resultados identificaveis." },
      flow: { title: "Como o LaudIA otimiza o trabalho",
        step1: "Organizar informacoes dos pacientes.", step2: "Estruturar informacoes das consultas.", step3: "Aplicar instrumentos compativeis.",
        step4: "Organizar resultados.", step5: "Utilizar assistencia de IA.", step6: "Auxiliar na elaboracao de laudos.", step7: "Manter informacoes organizadas para consulta." },
      availability: { title: "Disponibilidade e aquisicao", description: "Licenca vitalicia, com validacao offline. Atualizacoes pelo GeckoLauncher.", cta: "Ver no catalogo" },
      faq: { title: "Perguntas frequentes",
        q1: "O que e o LaudIA?", a1: "Um aplicativo desktop para clinicas multiprofissionais com IA para auxiliar na redacao de laudos.",
        q2: "Para quem foi desenvolvido?", a2: "Profissionais de saude que elaboram laudos e relatorios.",
        q3: "A IA substitui a avaliacao profissional?", a3: "Nao. A IA e assistencia; a responsabilidade e do profissional.",
        q4: "Quais sao os requisitos?", a4: "Windows 10/11, 4 GB de RAM (8 GB recomendado)." },
      cta: { title: "Pronto para otimizar sua rotina?", description: "Conheca o LaudIA e centralize a gestao da sua clinica.", button: "Explorar produtos" },
    },
"""

laudia_en = """    laudia: {
      hero: { title: "LaudIA", subtitle: "AI platform to assist in writing multi-professional clinical reports.", ctaPrimary: "Learn about the product", ctaSecondary: "Contact support" },
      what: { title: "What is LaudIA?", description: "LaudIA is a desktop app for multi-professional clinics that combines patient and professional management with an AI hub to help draft reports grounded in scientific studies, always reviewed and signed by the responsible professional." },
      features: { title: "Features and modules",
        patients: { title: "Patient management", desc: "Registration and organization of patients." },
        consultations: { title: "Consultation organization", desc: "Structuring consultation information." },
        forms: { title: "Forms and data collection", desc: "Structured data collection." },
        instrumentation: { title: "Psychological instrumentation", desc: "Application and organization of instruments." },
        ai: { title: "AI assistance", desc: "Support in drafting documents." },
        reports: { title: "Report writing", desc: "Assistance in writing reports." },
        results: { title: "Results lookup", desc: "Management and lookup of results." },
      },
      ai: { title: "Artificial intelligence", description: "AI is an assistance tool to speed up organization and document drafting. It does not replace professional assessment and responsibility." },
      instrumentation: { title: "Instrumentation and Instrument.IA", description: "Integration with Instrument.IA is planned: psychological instrument results may be used as auxiliary context in report writing, keeping sources and results identifiable." },
      flow: { title: "How LaudIA optimizes work",
        step1: "Organize patient information.", step2: "Structure consultation information.", step3: "Apply compatible instruments.",
        step4: "Organize results.", step5: "Use AI assistance.", step6: "Assist in report writing.", step7: "Keep information organized for lookup." },
      availability: { title: "Availability and acquisition", description: "Lifetime license with offline validation. Updates via GeckoLauncher.", cta: "View in catalog" },
      faq: { title: "Frequently asked questions",
        q1: "What is LaudIA?", a1: "A desktop app for multi-professional clinics with AI to assist in report writing.",
        q2: "Who is it for?", a2: "Health professionals who write reports and assessments.",
        q3: "Does AI replace professional assessment?", a3: "No. AI is assistance; responsibility remains with the professional.",
        q4: "What are the requirements?", a4: "Windows 10/11, 4 GB RAM (8 GB recommended)." },
      cta: { title: "Ready to optimize your routine?", description: "Discover LaudIA and centralize your clinic management.", button: "Explore products" },
    },
"""

laudia_es = """    laudia: {
      hero: { title: "LaudIA", subtitle: "Plataforma de IA para asistir en la redaccion de informes clinicos multiprofesionales.", ctaPrimary: "Conocer el producto", ctaSecondary: "Contactar soporte" },
      what: { title: "Que es LaudIA?", description: "LaudIA es una aplicacion de escritorio para clinicas multiprofesionales que reune la gestion de pacientes y profesionales con una central de IA para ayudar a redactar informes fundamentados en estudios cientificos, siempre con revision y firma del profesional responsable." },
      features: { title: "Funcionalidades y modulos",
        patients: { title: "Gestion de pacientes", desc: "Registro y organizacion de pacientes." },
        consultations: { title: "Organizacion de consultas", desc: "Estructuracion de la informacion de consultas." },
        forms: { title: "Formularios y recoleccion", desc: "Recoleccion estructurada de informacion." },
        instrumentation: { title: "Instrumentacion psicologica", desc: "Aplicacion y organizacion de instrumentos." },
        ai: { title: "Asistencia por IA", desc: "Apoyo en la redaccion de documentos." },
        reports: { title: "Elaboracion de informes", desc: "Asistencia en la redaccion de informes." },
        results: { title: "Consulta de resultados", desc: "Gestion y consulta de resultados." },
      },
      ai: { title: "Inteligencia artificial", description: "La IA es una herramienta de asistencia para agilizar la organizacion y la redaccion de documentos. No sustituye la evaluacion ni la responsabilidad profesional." },
      instrumentation: { title: "Instrumentacion e Instrument.IA", description: "La integracion con Instrument.IA esta planificada: los resultados de instrumentos psicologicos podran usarse como contexto auxiliar en la redaccion de informes, manteniendo fuentes y resultados identificables." },
      flow: { title: "Como LaudIA optimiza el trabajo",
        step1: "Organizar la informacion de los pacientes.", step2: "Estructurar la informacion de las consultas.", step3: "Aplicar instrumentos compatibles.",
        step4: "Organizar resultados.", step5: "Usar asistencia de IA.", step6: "Asistir en la redaccion de informes.", step7: "Mantener la informacion organizada para consulta." },
      availability: { title: "Disponibilidad y adquisicion", description: "Licencia vitalicia con validacion sin conexion. Actualizaciones mediante GeckoLauncher.", cta: "Ver en el catalogo" },
      faq: { title: "Preguntas frecuentes",
        q1: "Que es LaudIA?", a1: "Una aplicacion de escritorio para clinicas multiprofesionales con IA para asistir en la redaccion de informes.",
        q2: "Para quien fue desarrollada?", a2: "Profesionales de la salud que elaboran informes y evaluaciones.",
        q3: "La IA sustituye la evaluacion profesional?", a3: "No. La IA es asistencia; la responsabilidad sigue siendo del profesional.",
        q4: "Cuales son los requisitos?", a4: "Windows 10/11, 4 GB de RAM (8 GB recomendado)." },
      cta: { title: "Listo para optimizar tu rutina?", description: "Descubre LaudIA y centraliza la gestion de tu clinica.", button: "Explorar productos" },
    },
"""

s = s.replace('    errors: {\n      generic: "Ocorreu um erro."', laudia_pt + '    errors: {\n      generic: "Ocorreu um erro."', 1)
s = s.replace('    errors: {\n      generic: "Something went wrong. Please try again."', laudia_en + '    errors: {\n      generic: "Something went wrong. Please try again."', 1)
s = s.replace('    errors: {\n      generic: "Algo salio mal. Intenta de nuevo."', laudia_es + '    errors: {\n      generic: "Algo salio mal. Intenta de nuevo."', 1)

open(path,'w',encoding='utf-8').write(s)
print("done")
PY