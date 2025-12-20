// index.jsx (gabung App & Router)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Navbar from "./Pages/Navbar";
import Home from "./Pages/Home";
import Qualification from "./Pages/Qualification";
import SelectDisability from "./Pages/SelectDisability";
import ChooseMode from "./Pages/ChooseMode"; 
import DisabilityHub from "./Pages/DisabilityHub";
import DisabilityTest from "./Pages/DisabilityTest";
import DisabilityLearn from "./Pages/DisabilityLearn";
import Result from "./Pages/Result";
import NotQualified from "./Pages/NotQualified";
import './index.css';
// import './custom.css';

// Gabung App terus dalam render
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/qualification" element={<Qualification />} />
      <Route path="/select" element={<SelectDisability />} />
      <Route path="/choose-mode/:disability" element={<ChooseMode />} /> 
      <Route path="/disability/:type" element={<DisabilityHub />} />
      <Route path="/disability/:type/test" element={<DisabilityTest />} />
      <Route path="/disability/:type/learn" element={<DisabilityLearn />} />
      <Route path="/result/:level" element={<Result />} />
      <Route path="/not-qualified" element={<NotQualified />} />
    </Routes>
  </BrowserRouter>
);
