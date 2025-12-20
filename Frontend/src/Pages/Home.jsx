import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-purple-400 to-blue-400 text-white p-6">
      <h1 className="text-5xl font-bold mb-6 text-center">Learning Disabilities Support System</h1>
      <p className="text-lg mb-8 text-center max-w-xl">Assess the probability of dyslexia, dysgraphia, or dyscalculia with our knowledge-based system. Start by taking a quick qualification quiz.</p>
      <button
        onClick={() => nav("/qualification")}
        className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
      >
        Start Assessment
      </button>
    </div>
  );
}
