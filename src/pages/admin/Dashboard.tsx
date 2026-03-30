import { useEffect } from 'react';

export function AdminDashboard() {
  useEffect(() => {
    document.title = "Panel de Administración";
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Panel de Administración</h1>
    </div>
  );
} 
