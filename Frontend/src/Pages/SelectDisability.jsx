import { useNavigate } from "react-router-dom";
import { FaBrain, FaPenFancy, FaCalculator } from "react-icons/fa";

export default function SelectDisability() {
  const nav = useNavigate();
  const disabilities = [
    { name: "Dyslexia", icon: <FaBrain size={40} />, path: "dyslexia" },
    { name: "Dysgraphia", icon: <FaPenFancy size={40} />, path: "dysgraphia" },
    { name: "Dyscalculia", icon: <FaCalculator size={40} />, path: "dyscalculia" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-100 p-6">
      <h2 className="text-3xl font-bold mb-8">Select a Disability Test</h2>
      <div className="flex gap-6 flex-wrap justify-center">
        {disabilities.map(d => (
          <div
            key={d.name}
            onClick={() => nav(`/quiz/${d.path}`)}
            className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:scale-105 transform transition-all flex flex-col items-center gap-4 w-56"
          >
            {d.icon}
            <h3 className="text-xl font-bold">{d.name}</h3>
            <p className="text-gray-500 text-center">Assess the probability of {d.name.toLowerCase()} symptoms.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
