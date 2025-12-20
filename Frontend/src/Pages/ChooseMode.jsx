import { useNavigate, useParams } from "react-router-dom";

export default function ChooseMode() {
  const { disability } = useParams(); // dyslexia / dysgraphia / dyscalculia
  const nav = useNavigate();

  const handleMode = (mode) => {
    if (mode === "test") {
      nav(`/quiz/${disability}`);
    } else if (mode === "latihan") {
      nav(`/latihan/${disability}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-100 p-6 gap-8">
      <h2 className="text-3xl font-bold mb-4">Choose Mode for {disability}</h2>
      <div className="flex gap-6 flex-wrap justify-center">
        <button
          onClick={() => handleMode("latihan")}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition"
        >
          Latihan
        </button>
        <button
          onClick={() => handleMode("test")}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition"
        >
          Test
        </button>
      </div>
    </div>
  );
}
