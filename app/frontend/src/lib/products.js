import { api } from "./api";

// tier do frontend <-> código do plano no servidor
const PLAN_BY_TIER = { standard: "VITALI", enterprise: "ENTERPRISE" };
const TIER_BY_PLAN = Object.fromEntries(Object.entries(PLAN_BY_TIER).map(([t, p]) => [p, t]));

const cover = (a, b) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='940' height='650'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs><rect width='940' height='650' fill='url(#g)'/></svg>`
  )}`;

// Conteúdo de marketing por produto (chave = código do produto em minúsculas). RASCUNHO: edite.
const CONTENT = {
  ldia: {
    tagline: "Laudos clínicos com IA, fundamentados em evidência científica",
    category: "Saúde & Clínicas",
    badge: "Lançamento",
    featured: true,
    billingModel: "one-time",
    short_desc:
      "Central de IA para gerar laudos multiprofissionais com base em estudos científicos, integrada à gestão da clínica.",
    description:
      "O LaudIA é um aplicativo desktop para clínicas multiprofissionais. Ele reúne a gestão de pacientes e profissionais e uma central de IA que ajuda a redigir laudos fundamentados em estudos científicos, sempre com revisão e assinatura do profissional responsável. Licença vitalícia, com validação offline.",
    compatibility: ["Windows 10 (64 bits)", "Windows 11"],
    tags: ["IA", "Laudos", "Multiprofissional", "Licença vitalícia", "Pagamento único"],
    features: [
      "Cadastro de pacientes e profissionais de diferentes conselhos",
      "Geração de laudos com IA e referências a estudos científicos",
      "Fluxo de revisão e assinatura pelo profissional responsável",
      "Licença vitalícia com validação offline",
      "Atualizações pelo GeckoLicense Launcher",
    ],
    requirements: {
      os: "Windows 10 (1809+) ou Windows 11",
      memory: "4 GB de RAM (8 GB recomendado)",
      runtime: "Incluso no instalador",
      deps: "Internet para o módulo de IA e para validar a licença periodicamente",
    },
    faq: [
      { q: "A licença é vitalícia?", a: "Sim. Você paga uma vez e continua usando o software, sem mensalidade." },
      { q: "Preciso de internet?", a: "A licença funciona offline depois de ativada. O módulo de IA e as atualizações precisam de conexão." },
      { q: "Em quantos computadores posso usar?", a: "Cada licença vale para 1 dispositivo. Você pode gerenciar isso pela sua conta." },
    ],
    image: cover("#0b2a26", "#10B981"),
    gallery: [cover("#0b2a26", "#10B981")],
    // Preços oficiais do LaudIA (em centavos) - sobrescrevem valores da API
    priceOverride: {
      standard: { brl: 25000, usd: 4700 },
      enterprise: { brl: 50000, usd: 9400 },
    },
  },
  "gecko-license": {
    tagline: "Gerenciador de licenças e atualizações do Gecko",
    category: "Utilitários",
    badge: "Grátis",
    featured: false,
    billingModel: "free",
    short_desc:
      "Utilitário para gerenciar licenças dos produtos Gecko Labs, baixar atualizações e ativar instalações offline.",
    description:
      "O Gecko License é um utilitário gratuito para gerenciar licenças dos softwares da Gecko Labs. Ele permite baixar instaladores, validar licenças e manter os produtos atualizados, sem qualquer custo.",
    compatibility: ["Windows 10 (64 bits)", "Windows 11", "macOS", "Linux"],
    tags: ["Utilitário", "Licenças", "Grátis", "Downloads", "Atualizações"],
    features: [
      "Gerenciamento de licenças dos produtos Gecko Labs",
      "Download de instaladores e atualizações",
      "Ativação offline de licenças",
      "Gratuito — sem cobrança ou assinatura",
    ],
    requirements: {
      os: "Windows 10/11, macOS ou Linux",
      memory: "—",
      runtime: "—",
      deps: "—",
    },
    faq: [
      { q: "O Gecko License é gratuito?", a: "Sim. É um utilitário gratuito para todos os clientes da Gecko Labs." },
      { q: "Preciso de licença para usar?", a: "Não. O Gecko License é gratuito e não requer ativação." },
    ],
    image: cover("#111827", "#10B981"),
    gallery: [cover("#111827", "#10B981")],
  },
  "geckolauncher": {
    tagline: "Launcher para acessar e gerenciar os softwares da Gecko Labs",
    category: "Utilitários",
    badge: "Grátis",
    featured: false,
    billingModel: "free",
    short_desc:
      "Launcher para acessar, baixar e gerenciar os softwares da Gecko Labs. Download gratuito do instalador.",
    description:
      "O GeckoLauncher é o launcher oficial da Gecko Labs. Ele permite baixar instaladores, gerenciar licenças e manter os produtos atualizados, sem qualquer custo.",
    compatibility: ["Windows 10 (64 bits)", "Windows 11"],
    tags: ["Launcher", "Downloads", "Atualizações", "Grátis"],
    features: [
      "Download de instaladores dos produtos Gecko Labs",
      "Gerenciamento de licenças",
      "Atualizações automáticas",
      "Gratuito — sem cobrança ou assinatura",
    ],
    requirements: {
      os: "Windows 10 (1809+) ou Windows 11",
      memory: "—",
      runtime: "—",
      deps: "—",
    },
    faq: [
      { q: "O GeckoLauncher é gratuito?", a: "Sim. É um launcher gratuito para todos os usuários da Gecko Labs." },
      { q: "Preciso de licença para usar?", a: "Não. O GeckoLauncher é gratuito e não requer ativação." },
    ],
    image: cover("#111827", "#10B981"),
    gallery: [cover("#111827", "#10B981")],
  },
};

const fromApi = (p) => {
  const slug = p.code.toLowerCase();
  const prices = {};
  // A API já retorna priceBrl e priceUsd em centavos (inteiros). Não multiplicar por 100.
  (p.plans || []).forEach((pl) => {
    const tier = TIER_BY_PLAN[pl.code];
    if (tier) {
      prices[tier] = {};
      if (pl.priceBrl != null) prices[tier].brl = Math.round(pl.priceBrl);
      if (pl.priceUsd != null) prices[tier].usd = Math.round(pl.priceUsd);
      // Se só houver preço em BRL, ainda assim expõe standard para compatibilidade.
      if (prices[tier].brl != null) prices[tier].standard = prices[tier].brl;
    }
  });
  // Produtos sem planos (ex: gratuitos) recebem preço zero no tier standard.
  if (!prices.standard) prices.standard = 0;
  const img = cover("#111827", "#10B981");
  const content = CONTENT[slug] || {};
  // Aplicar override de preços oficiais se definido no CONTENT
  const finalPrices = { ...prices };
  if (content.priceOverride) {
    Object.entries(content.priceOverride).forEach(([tier, prices]) => {
      if (finalPrices[tier]) {
        finalPrices[tier] = { ...finalPrices[tier], ...prices };
      } else {
        finalPrices[tier] = prices;
      }
      // Garantir que standard seja definido para compatibilidade
      if (finalPrices[tier].brl != null) finalPrices[tier].standard = finalPrices[tier].brl;
    });
  }
  return {
    slug,
    name: p.name,
    tagline: p.description || "",
    category: "Software",
    version: `v${p.version}`,
    badge: "",
    rating: 5,
    reviews_count: 0,
    featured: false,
    short_desc: p.description || "",
    description: p.description || "",
    compatibility: ["Windows 10/11"],
    tags: [],
    features: [],
    requirements: { os: "Windows 10/11", memory: "—", runtime: "—", deps: "—" },
    faq: [],
    image: img,
    gallery: [img],
    ...content,
    prices: finalPrices,
  };
};

const fromLicense = (l) => ({
  id: l.id,
  key: l.licenseKey,
  license_key: l.licenseKey,
  product: l.product,
  product_name: l.product,
  product_slug: (l.productCode || "").toLowerCase(),
  tier: "standard",
  // comprou = tem direito; "pending" só significa que ainda não foi ativada no app
  status: l.status === "pending" ? "active" : l.status,
  expires_at: l.expiresAt,
  max_activations: 1,
  download_file: l.downloadFileName,
});

const fromOrder = (o) => ({
  order_id: o.id,
  status: o.status,
  total_cents: Math.round((o.totalBrl || 0) * 100),
  created_at: o.createdAt,
  paid_at: o.status === "paid" ? o.updatedAt || o.createdAt : null,
  items: (o.items || []).map((i) => ({ name: i.product, price: Math.round(i.priceBrl * 100), q: 1 })),
  licenses: (o.licenses || []).map((l) => ({
    key: l.key,
    product_name: l.productName,
    product_slug: (l.productCode || "").toLowerCase(),
    tier: TIER_BY_PLAN[l.planCode] || "standard",
    status: "active",
  })),
});

export const toCheckoutItem = (item) => ({
  productCode: item.slug.toUpperCase(),
  planCode: PLAN_BY_TIER[item.tier] || "VITALI",
});

export async function fetchProducts() {
  const { data } = await api.get("/products");
  return { data: data.map(fromApi) };
}

export async function fetchProduct(slug) {
  const { data } = await api.get(`/products/${slug.toUpperCase()}`);
  return { data: fromApi(data) };
}

export async function fetchMyLicenses() {
  const { data } = await api.get("/tenants/me");
  return { data: (data.licenses || []).map(fromLicense) };
}

export async function fetchMyOrders() {
  const { data } = await api.get("/checkout/orders");
  return { data: data.map(fromOrder) };
}

export async function fetchOrder(id) {
  const { data } = await api.get(`/checkout/orders/${id}`);
  return { data: fromOrder(data) };
}

// Espera o webhook do Stripe marcar o pedido como pago (até ~20s)
export async function pollOrder(id, tries = 10, delayMs = 2000) {
  let last = null;
  for (let i = 0; i < tries; i++) {
    last = (await fetchOrder(id)).data;
    if (last.status === "paid") return last;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return last;
}