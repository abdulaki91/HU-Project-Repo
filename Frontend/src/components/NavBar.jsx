import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-green-700 text-white p-4 shadow-md">
      <nav className="flex justify-center gap-6">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <Link to="/tasks" className="hover:underline">
          Tasks
        </Link>
        <Link to="/explore" className="hover:underline">
          Explore
        </Link>
        <Link to="/about" className="hover:underline">
          About
        </Link>
      </nav>
    </header>
  );
}
