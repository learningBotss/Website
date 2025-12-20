// index.jsx (gabung App & Router)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Pages/Navbar";
import Home from "./Pages/Home";
import Qualification from "./Pages/Qualification";
import SelectDisability from "./Pages/SelectDisability";
import Quiz from "./Pages/Quiz";
import Result from "./Pages/Result";
import NotQualified from "./Pages/NotQualified";
import './index.css';
import './custom.css';

// Gabung App terus dalam render
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/qualification" element={<Qualification />} />
      <Route path="/select" element={<SelectDisability />} />
      <Route path="/quiz/:name" element={<Quiz />} />
      <Route path="/result/:level" element={<Result />} />
      <Route path="/not-qualified" element={<NotQualified />} />
    </Routes>
  </BrowserRouter>
);
