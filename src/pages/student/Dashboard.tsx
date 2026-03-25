import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function StudentDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Panel del Estudiante";
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Panel del Estudiante</h1>
    </div>
  );
}