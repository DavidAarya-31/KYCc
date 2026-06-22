import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Cards } from './pages/Cards';
import { NewCard } from './pages/NewCard';
import { CardDetail } from './pages/CardDetail';
import { EditCard } from './pages/EditCard';
import { BudgetProvider } from './contexts/BudgetContext';
import Finances from './pages/Finances';
import { Advisor } from './pages/Advisor';
import { ThemeProvider } from './contexts/ThemeContext';
// import { UndoRedoProvider } from './contexts/UndoRedoContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BudgetProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="cards" element={<Cards />} />
                <Route path="cards/new" element={<NewCard />} />
                <Route path="cards/:id" element={<CardDetail />} />
                <Route path="cards/:id/edit" element={<EditCard />} />
                <Route path="finances" element={<Finances />} />
                <Route path="advisor" element={<Advisor />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </BudgetProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;