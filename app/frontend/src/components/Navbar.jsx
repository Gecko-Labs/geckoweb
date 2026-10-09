
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  User as UserIcon,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useI18n } from "../lib/i18n";

import { GeckoMark } from "./GeckoMark";
import { ThemeToggle } from "./ThemeToggle";
import { LocaleSwitcher } from "./LocaleSwitcher";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Navbar() {
  const { user, logout } = useAuth();
  const { count, setDrawerOpen } = useCart();
  const { t } = useI18n();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();

  const links = [
    {
      to: "/products",
      label: t("nav.products"),
      testid: "nav-link-products",
    },
    {
      to: "/#ecossistema",
      label: t("nav.ecosystem", "Ecossistema"),
      testid: "nav-link-ecosystem",
      anchor: true,
    },
    {
      to: "/support",
      label: t("nav.support"),
      testid: "nav-link-support",
    },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `text-sm transition-colors duration-200 hover:text-foreground ${
      isActive ? "text-foreground" : "text-muted-foreground"
    }`;

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <header
      data-testid="nav-header"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-panel border-b border-border/70 shadow-lg shadow-black/5"
          : "bg-transparent"
      }`}
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label={t("nav.mainNavigation", "Navegação principal")}
      >
        <Link
          to="/"
          className="group flex items-center gap-3"
          data-testid="nav-logo"
          onClick={closeMobileMenu}
        >
          <GeckoMark className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-105" />

          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold uppercase tracking-[0.14em]">
              Gecko Labs
            </span>

            <span className="hidden font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground sm:block">
              Software Engineering
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) =>
            link.anchor ? (
              <a
                key={link.to}
                href={link.to}
                data-testid={link.testid}
                className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                {link.label}
              </a>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                data-testid={link.testid}
                className={linkClass}
              >
                {link.label}
              </NavLink>
            )
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          <LocaleSwitcher />

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            data-testid="cart-trigger-button"
            aria-label={`${t("nav.cart", "Carrinho")}, ${count} ${t("nav.items", "itens")}`}
            className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border/70 text-muted-foreground transition-colors duration-200 hover:border-primary/50 hover:text-foreground"
          >
            <ShoppingCart className="h-4 w-4" />

            {count > 0 && (
              <span
                data-testid="cart-count-badge"
                className="absolute -right-1.5 -top-1.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-bold text-primary-foreground"
              >
                {count}
              </span>
            )}
          </button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  data-testid="nav-user-menu"
                  aria-label={t("nav.account", "Minha conta")}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/40 bg-primary/10 font-mono text-xs font-bold uppercase text-primary transition-colors hover:bg-primary/20"
                >
                  {user.name?.slice(0, 2) || <UserIcon className="h-4 w-4" />}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-2">
                  <p className="truncate text-sm font-medium">
                    {user.name}
                  </p>

                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link
                    to="/account"
                    data-testid="nav-account-link"
                    className="cursor-pointer"
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    {t("nav.account", "Minha conta")}
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    to="/account?tab=orders"
                    className="cursor-pointer"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    {t("nav.orders", "Meus pedidos")}
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  data-testid="nav-logout-button"
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("nav.logout", "Sair")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                to="/login"
                data-testid="nav-login-button"
                className="rounded-md px-3.5 py-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                {t("nav.login")}
              </Link>

              <Link
                to="/register"
                data-testid="nav-register-button"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
              >
                {t("nav.register")}
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            data-testid="mobile-menu-button"
            aria-label={
              mobileOpen
                ? t("nav.closeMenu", "Fechar menu")
                : t("nav.openMenu", "Abrir menu")
            }
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border/70 text-muted-foreground md:hidden"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="glass-panel overflow-hidden border-b border-border/70 md:hidden"
            data-testid="mobile-menu-panel"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.anchor ? "/" : link.to}
                  onClick={closeMobileMenu}
                  className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}

              {!user && (
                <>
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary"
                  >
                    {t("nav.login")}
                  </Link>

                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="mt-1 rounded-md bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground"
                  >
                    {t("nav.register")}
                  </Link>
                </>
              )}

              {user && (
                <>
                  <Link
                    to="/account"
                    onClick={closeMobileMenu}
                    className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary"
                  >
                    {t("nav.account", "Minha conta")}
                  </Link>

                  <Link
                    to="/account?tab=orders"
                    onClick={closeMobileMenu}
                    className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary"
                  >
                    {t("nav.orders", "Meus pedidos")}
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center rounded-md px-3 py-2.5 text-left text-sm text-destructive hover:bg-secondary"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("nav.logout", "Sair")}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
