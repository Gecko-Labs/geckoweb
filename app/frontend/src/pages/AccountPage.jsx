import { toast } from "sonner";

import { API_BASE, api, apiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "../components/ThemeToggle";
import { FadeIn } from "../components/Reveal";
import { formatDate, formatUSD } from "../utils/format";
import { Skeleton } from "../components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

const PLATFORMS = [
  { id: "macos-arm64", label: "macOS ARM64" },
  { id: "macos-x64", label: "macOS x64" },
  { id: "linux-amd64", label: "Linux amd64" },
  { id: "windows-x64", label: "Windows x64" },
];

const STATUS_LABELS = {
  paid: { label: "Pago", cls: "bg-primary/10 text-primary border-primary/30" },
  pending: { label: "Pendente", cls: "bg-amber-400/10 text-amber-500 border-amber-400/30" },
  failed: { label: "Falhou", cls: "bg-destructive/10 text-destructive border-destructive/30" },
  expired: { label: "Expirado", cls: "bg-muted text-muted-foreground border-border" },
  refunded: { label: "Reembolsado", cls: "bg-muted text-muted-foreground border-border" },
};

export default function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "licenses";
  const [licenses, setLicenses] = useState(null);
  const [orders, setOrders] = useState(null);

  const load = useCallback(() => {
    api.get("/licenses").then(({ data }) => setLicenses(data)).catch(() => setLicenses([]));
    api.get("/orders").then(({ data }) => setOrders(data)).catch(() => setOrders([]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setTab = (t) => {
    params.set("tab", t);
    setParams(params, { replace: true });
  };

  const copyKey = (key) => {
    navigator.clipboard?.writeText(key);
    toast.success("Chave de licença copiada");
  };

  const revoke = async (key) => {
    try {
      await api.post(`/licenses/${key}/revoke`);
      toast.success("Licença revogada");
      load();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const exportData = async () => {
    try {
      const { data } = await api.get("/auth/export");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "geckolabs-meus-dados.json";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Dados exportados");
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const deleteAccount = async () => {
    try {
      await api.delete("/auth/account");
      await logout();
      toast.success("Conta excluída. Sentiremos sua falta.");
      navigate("/");
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const activeLicenses = (licenses || []).filter((l) => l.status === "active");

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 pb-24 pt-28 sm:px-6 lg:px-8" data-testid="account-page">
      <FadeIn className="flex flex-wrap items-center gap-5">
        <span className="flex h-16 w-16 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 font-display text-2xl font-bold uppercase text-primary">
          {user?.name?.slice(0, 2)}
        </span>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">Conta GeckoLabs</p>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight">{user?.name}</h1>
          <p className="font-mono text-xs text-muted-foreground">{user?.email}</p>
        </div>
      </FadeIn>

      <Tabs value={tab} onValueChange={setTab} className="mt-10">
        <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-secondary/60 p-1">
          <TabsTrigger value="licenses" data-testid="account-tab-licenses" className="gap-2">
            <KeyRound className="h-3.5 w-3.5" /> Licenças
          </TabsTrigger>
          <TabsTrigger value="orders" data-testid="account-tab-orders" className="gap-2">
            <Package className="h-3.5 w-3.5" /> Pedidos
          </TabsTrigger>
          <TabsTrigger value="downloads" data-testid="account-tab-downloads" className="gap-2">
            <Download className="h-3.5 w-3.5" /> Downloads
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="account-tab-settings" className="gap-2">
            <Settings className="h-3.5 w-3.5" /> Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="licenses" className="mt-8">
          {licenses === null ? (
            <Skeleton className="h-40 rounded-xl" />
          ) : licenses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center" data-testid="licenses-empty">
              <KeyRound className="mx-auto h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">Nenhuma licença ainda.</p>
              <Link to="/products" className="mt-4 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
                Explorar softwares
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {licenses.map((lic) => (
                <FadeIn key={lic.key} className="rounded-xl border border-border/70 bg-card p-5" data-testid={`license-card-${lic.product_slug}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-bold">{lic.product_name}</p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {lic.tier === "enterprise" ? "Enterprise Vault" : "Standard Seat"} · {lic.max_activations} ativações
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest ${
                        lic.status === "active"
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border bg-muted text-muted-foreground"
                      }`}
                    >
                      {lic.status === "active" ? "ativa" : "revogada"}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-3">
                    <code className="flex-1 truncate font-mono text-sm text-primary" data-testid={`license-key-${lic.product_slug}`}>
                      {lic.key}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyKey(lic.key)}
                      aria-label={`Copiar chave de ${lic.product_name}`}
                      data-testid={`copy-license-button-${lic.product_slug}`}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-primary"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    <span>Emitida em {formatDate(lic.created_at)}</span>
                    {lic.status === "active" && (
                      <button
                        type="button"
                        onClick={() => revoke(lic.key)}
                        data-testid={`revoke-license-${lic.product_slug}`}
                        className="text-destructive/80 transition-colors hover:text-destructive"
                      >
                        Revogar
                      </button>
                    )}
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="mt-8">
          {orders === null ? (
            <Skeleton className="h-40 rounded-xl" />
          ) : orders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center" data-testid="orders-empty">
              <Package className="mx-auto h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">Nenhum pedido ainda.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((order) => {
                const st = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
                return (
                  <FadeIn key={order.order_id} className="rounded-xl border border-border/70 bg-card p-5" data-testid={`order-card-${order.order_id}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-mono text-sm font-bold">{order.order_id}</p>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          {formatDate(order.created_at)} · {order.items.length} {order.items.length === 1 ? "item" : "itens"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest ${st.cls}`}>
                          {st.label}
                        </span>
                        <span className="font-display text-xl font-bold">{formatUSD(order.total_cents)}</span>
                      </div>
                    </div>
                    <ul className="mt-4 flex flex-col gap-1.5 border-t border-border/50 pt-4">
                      {order.items.map((item) => (
                        <li key={item.slug} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.name} <span className="font-mono text-[10px] uppercase">({item.tier})</span>
                          </span>
                          <span className="font-mono text-xs">{formatUSD(item.unit_amount)}</span>
                        </li>
                      ))}
                    </ul>
                  </FadeIn>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="downloads" className="mt-8">
          {licenses === null ? (
            <Skeleton className="h-40 rounded-xl" />
          ) : activeLicenses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center" data-testid="downloads-empty">
              <Download className="mx-auto h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">Os downloads aparecem aqui após a primeira compra.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {activeLicenses.map((lic) => (
                <FadeIn key={lic.key} className="rounded-xl border border-border/70 bg-card p-5" data-testid={`download-card-${lic.product_slug}`}>
                  <div className="flex items-center gap-4">
                    {lic.product?.image && (
                      <img src={lic.product.image} alt="" loading="lazy" className="h-14 w-14 rounded-lg object-cover" />
                    )}
                    <div>
                      <p className="font-display text-lg font-bold">{lic.product_name}</p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {lic.product?.version || ""} · SHA-256 verificado
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {PLATFORMS.map((p) => (
                      <a
                        key={p.id}
                        href={`${API_BASE}/downloads/${lic.product_slug}/${p.id}`}
                        data-testid={`download-asset-button-${lic.product_slug}-${p.id}`}
                        className="flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2.5 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        <Download className="h-3.5 w-3.5" /> {p.label}
                      </a>
                    ))}
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-8">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <FadeIn className="rounded-xl border border-border/70 bg-card p-6">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold uppercase tracking-tight">
                <Settings className="h-5 w-5 text-primary" /> Preferências
              </h2>
              <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-5">
                <div>
                  <p className="text-sm font-medium">Tema da interface</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Escuro / claro</p>
                </div>
                <ThemeToggle />
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-5">
                <div>
                  <p className="text-sm font-medium">Exportar meus dados</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">LGPD · JSON completo</p>
                </div>
                <button
                  type="button"
                  onClick={exportData}
                  data-testid="export-data-button"
                  className="flex items-center gap-2 rounded-md border border-border px-3.5 py-2 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <FileJson className="h-4 w-4" /> Exportar
                </button>
              </div>
            </FadeIn>

            <FadeIn delay={0.08} className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold uppercase tracking-tight text-destructive">
                <Trash2 className="h-5 w-5" /> Zona de risco
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                A exclusão é permanente: sua conta é removida e todas as licenças são revogadas,
                conforme o direito de eliminação da LGPD.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    data-testid="delete-account-button"
                    className="mt-5 rounded-md border border-destructive/50 px-4 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
                  >
                    Excluir minha conta
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir conta permanentemente?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Suas licenças ativas serão revogadas e seus dados pessoais removidos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-testid="delete-account-cancel">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={deleteAccount}
                      data-testid="delete-account-confirm"
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Sim, excluir tudo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </FadeIn>
          </div>

          <FadeIn delay={0.12} className="mt-5 flex items-center gap-3 rounded-xl border border-border/60 bg-card/50 p-5">
            <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              Sessões protegidas por cookies httpOnly e tokens de curta duração. Consulte nossa{" "}
              <Link to="/privacy" className="text-primary hover:underline">Política de Privacidade</Link>.
            </p>
          </FadeIn>
        </TabsContent>
      </Tabs>
    </main>
  );
}