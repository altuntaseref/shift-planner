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
        <div className="flex flex-col h-screen overflow-hidden">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/plan/:id" element={<PlanPage />} />
          </Routes>
          <Toast />
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}
