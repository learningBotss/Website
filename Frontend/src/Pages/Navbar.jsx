import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const getTitle = () => {
    if (location.pathname.includes("qualification")) return "Qualification Test";
    if (location.pathname.includes("quiz")) return "Disability Quiz";
    if (location.pathname.includes("select")) return "Select Disability";
    if (location.pathname.includes("result")) return "Your Result";
    if (location.pathname.includes("not-qualified")) return "Not Qualified";
    return "Home";
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
      <Link to="/" className="font-bold text-xl">Learning Disabilities Support</Link>
      <span className="text-lg">{getTitle()}</span>
    </nav>
  );
}
