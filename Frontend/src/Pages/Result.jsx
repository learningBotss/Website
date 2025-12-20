import { useParams, useNavigate } from "react-router-dom";

export default function Result() {
  const { level } = useParams();
  const nav = useNavigate();
  const color = level === "High" ? "bg-red-500" : "bg-green-500";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className={`p-8 rounded-lg shadow-lg w-full max-w-md text-white ${color} flex flex-col items-center gap-4`}>
        <h1 className="text-4xl font-bold">Result</h1>
        <p className="text-xl">Probability of symptoms: <strong>{level}</strong></p>
        <button onClick={()=>nav("/")} className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition">Restart Assessment</button>
      </div>
    </div>
  );
}
