
import { useEffect } from "react";

import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

import Lenis from "lenis";

import "@/App.css";

import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { I18nProvider } from "./lib/i18n";
import { CurrencyProvider } from "./context/CurrencyContext";

import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import ProtectedRoute from "./components/ProtectedRoute";

import { Toaster } from "./components/ui/sonner";

import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelPage from "./pages/PaymentCancelPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AccountPage from "./pages/AccountPage";
import SupportPage from "./pages/SupportPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import NotFoundPage from "./pages/NotFoundPage";

function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
    });

    let frame;

    const raf = (time) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };

    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

function Shell() {
  const { theme } = useTheme();

  useSmoothScroll();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <ScrollToTop />

      <Navbar />

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/products" element={<ProductsPage />} />

          <Route
            path="/products/:slug"
            element={<ProductDetailPage />}
          />

          <Route path="/cart" element={<CartPage />} />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment/success"
            element={<PaymentSuccessPage />}
          />

          <Route
            path="/payment/cancel"
            element={<PaymentCancelPage />}
          />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/reset-password"
            element={<ResetPasswordPage />}
          />

          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />

          <Route path="/support" element={<SupportPage />} />

          <Route path="/terms" element={<TermsPage />} />

          <Route path="/privacy" element={<PrivacyPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      <Footer />

      <CartDrawer />

      <Toaster
        theme={theme}
        position="top-right"
        richColors
        closeButton
      />
    </div>
  );
}

function App() {
  return (
    <I18nProvider>
      <CurrencyProvider>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <BrowserRouter>
                <Shell />
              </BrowserRouter>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </CurrencyProvider>
    </I18nProvider>
  );
}

export default App;
