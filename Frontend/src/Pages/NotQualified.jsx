import { useNavigate } from "react-router-dom";

export default function NotQualified() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-100 p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-3xl font-bold mb-4">😊 No Significant Learning Difficulties Detected</h2>
        <p className="mb-6">Based on your responses, there are no strong indicators of dyslexia, dysgraphia, or dyscalculia at this time.
This screening is not a diagnosis. If you experience learning challenges in the future, you may retake the test or consult an educational professional.</p>
        <button onClick={()=>nav("/")} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">Back to Home</button>
      </div>
    </div>
  );
}
