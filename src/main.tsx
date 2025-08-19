import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { PantryProvider } from "@/contexts/PantryContext";

createRoot(document.getElementById("root")!).render(
  <PantryProvider>
    <App />
  </PantryProvider>
);
