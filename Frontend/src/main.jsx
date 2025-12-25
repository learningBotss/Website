// index.jsx (gabung App & Router)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "./Pages/Home";
import Qualification from "./Pages/Qualification";
import SelectDisability from "./Pages/SelectDisability";
import DisabilityHub from "./Pages/DisabilityHub";
import DisabilityTest from "./Pages/DisabilityTest";
import DisabilityLearn from "./Pages/DisabilityLearn";
import Auth from "./Pages/Auth";
import Admin from "./pages/Admin";
import { AuthProvider } from "@/contexts/AuthContext";
import './index.css';
// import './custom.css';
const userIdNumber = Number(localStorage.getItem("userId"));

// Gabung App terus dalam render
ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <TooltipProvider>
        <Toaster />
         <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/qualification" element={<Qualification/>} />
              <Route path="/select" element={<SelectDisability />} />
              <Route path="/disability/:type" element={<DisabilityHub />} />
              <Route path="/disability/:type/test" element={<DisabilityTest />} />
              <Route path="/disability/:type/learn" element={<DisabilityLearn />} />
            </Routes>
          </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);
