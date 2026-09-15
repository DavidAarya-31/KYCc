import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { BudgetProvider } from './contexts/BudgetContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PageSkeleton } from './components/PageSkeleton';
import { ErrorBoundary } from './components/ErrorBoundary';

const Auth = lazy(() => import('./pages/Auth').then(m => ({ default: m.Auth })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Cards = lazy(() => import('./pages/Cards').then(m => ({ default: m.Cards })));
const NewCard = lazy(() => import('./pages/NewCard').then(m => ({ default: m.NewCard })));
const CardDetail = lazy(() => import('./pages/CardDetail').then(m => ({ default: m.CardDetail })));
const EditCard = lazy(() => import('./pages/EditCard').then(m => ({ default: m.EditCard })));
const Finances = lazy(() => import('./pages/Finances'));
const Advisor = lazy(() => import('./pages/Advisor').then(m => ({ default: m.Advisor })));

// ─── Discover pages (lazy) ────────────────────────────────────────────────────
const Explore            = lazy(() => import('./pages/discover/Explore').then(m => ({ default: m.Explore })));
const ExploreCardDetail  = lazy(() => import('./pages/discover/ExploreCardDetail').then(m => ({ default: m.ExploreCardDetail })));
const Offers             = lazy(() => import('./pages/discover/Offers').then(m => ({ default: m.Offers })));
const ArticleDetail      = lazy(() => import('./pages/discover/ArticleDetail').then(m => ({ default: m.ArticleDetail })));
const Guides             = lazy(() => import('./pages/discover/Guides').then(m => ({ default: m.Guides })));
const GuideMerchants     = lazy(() => import('./pages/discover/GuideMerchants').then(m => ({ default: m.GuideMerchants })));
const GuideMerchantDetail= lazy(() => import('./pages/discover/GuideMerchantDetail').then(m => ({ default: m.GuideMerchantDetail })));
const GuideRewards       = lazy(() => import('./pages/discover/GuideRewards').then(m => ({ default: m.GuideRewards })));
const GuideMCCLookup     = lazy(() => import('./pages/discover/GuideMCCLookup').then(m => ({ default: m.GuideMCCLookup })));
const GuideUtilityPayments = lazy(() => import('./pages/discover/GuideUtilityPayments').then(m => ({ default: m.GuideUtilityPayments })));
const GuideCCBillViaDC   = lazy(() => import('./pages/discover/GuideCCBillViaDC').then(m => ({ default: m.GuideCCBillViaDC })));
const GuideHotels        = lazy(() => import('./pages/discover/GuideHotels').then(m => ({ default: m.GuideHotels })));
const GuideAirlines      = lazy(() => import('./pages/discover/GuideAirlines').then(m => ({ default: m.GuideAirlines })));
const GuideLifestyle     = lazy(() => import('./pages/discover/GuideLifestyle').then(m => ({ default: m.GuideLifestyle })));
const Tools              = lazy(() => import('./pages/discover/Tools').then(m => ({ default: m.Tools })));
const ToolQRScanner      = lazy(() => import('./pages/discover/ToolQRScanner').then(m => ({ default: m.ToolQRScanner })));
const ToolGiftCard       = lazy(() => import('./pages/discover/ToolGiftCard').then(m => ({ default: m.ToolGiftCard })));
const ToolCalculator     = lazy(() => import('./pages/discover/ToolCalculator').then(m => ({ default: m.ToolCalculator })));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BudgetProvider>
          <BrowserRouter>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                <Route path="/auth" element={<ErrorBoundary><Auth /></ErrorBoundary>} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
                  <Route path="cards" element={<ErrorBoundary><Cards /></ErrorBoundary>} />
                  <Route path="cards/new" element={<ErrorBoundary><NewCard /></ErrorBoundary>} />
                  <Route path="cards/:id" element={<ErrorBoundary><CardDetail /></ErrorBoundary>} />
                  <Route path="cards/:id/edit" element={<ErrorBoundary><EditCard /></ErrorBoundary>} />
                  <Route path="finances" element={<ErrorBoundary><Finances /></ErrorBoundary>} />
                  <Route path="advisor" element={<ErrorBoundary><Advisor /></ErrorBoundary>} />

                  {/* ── Discover ─────────────────────────────────────────────────────────── */}
                  <Route path="discover">
                    <Route path="explore"                           element={<ErrorBoundary><Explore /></ErrorBoundary>} />
                    <Route path="explore/:slug"                     element={<ErrorBoundary><ExploreCardDetail /></ErrorBoundary>} />
                    <Route path="offers"                            element={<ErrorBoundary><Offers /></ErrorBoundary>} />
                    <Route path="articles/:slug"                    element={<ErrorBoundary><ArticleDetail /></ErrorBoundary>} />
                    <Route path="guides"                            element={<ErrorBoundary><Guides /></ErrorBoundary>} />
                    <Route path="guides/merchants"                  element={<ErrorBoundary><GuideMerchants /></ErrorBoundary>} />
                    <Route path="guides/merchants/:slug"            element={<ErrorBoundary><GuideMerchantDetail /></ErrorBoundary>} />
                    <Route path="guides/rewards"                    element={<ErrorBoundary><GuideRewards /></ErrorBoundary>} />
                    <Route path="guides/rewards/mcc-guide"         element={<ErrorBoundary><GuideMCCLookup /></ErrorBoundary>} />
                    <Route path="guides/rewards/utility-payments"  element={<ErrorBoundary><GuideUtilityPayments /></ErrorBoundary>} />
                    <Route path="guides/rewards/cc-bill-via-dc"    element={<ErrorBoundary><GuideCCBillViaDC /></ErrorBoundary>} />
                    <Route path="guides/hotels"                     element={<ErrorBoundary><GuideHotels /></ErrorBoundary>} />
                    <Route path="guides/airlines"                   element={<ErrorBoundary><GuideAirlines /></ErrorBoundary>} />
                    <Route path="guides/lifestyle"                  element={<ErrorBoundary><GuideLifestyle /></ErrorBoundary>} />
                    <Route path="tools"                             element={<ErrorBoundary><Tools /></ErrorBoundary>} />
                    <Route path="tools/qr-scanner"                 element={<ErrorBoundary><ToolQRScanner /></ErrorBoundary>} />
                    <Route path="tools/gift-card"                  element={<ErrorBoundary><ToolGiftCard /></ErrorBoundary>} />
                    <Route path="tools/calculator/:cardSlug"       element={<ErrorBoundary><ToolCalculator /></ErrorBoundary>} />
                  </Route>
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </BudgetProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;