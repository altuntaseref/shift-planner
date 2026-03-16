import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Toast from './components/Toast';
import HomePage from './pages/HomePage';
import PlanPage from './pages/PlanPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
          <Header />
          <div className="flex-1 flex flex-col min-h-0 relative">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/plan/:id" element={<PlanPage />} />
            </Routes>
          </div>
          <Toast />
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}
