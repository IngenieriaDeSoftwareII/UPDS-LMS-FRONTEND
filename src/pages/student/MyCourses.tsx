import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/auth.store";
import { inscriptionService } from "../../services/inscription.service";
import { InscriptionDTO } from "../../types";

export function MyCourses() {
  const user = useAuthStore((state) => state.user);
  const [inscriptions, setInscriptions] = useState<InscriptionDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInscriptions = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await inscriptionService.getMyCourses(user.id);
        setInscriptions(data);
      } catch (error) {
        console.error("Error al cargar:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInscriptions();
  }, [user?.id]);

  // Función con mensaje de confirmación
  const handleCancel = async (id: number) => {
    // MENSAJE DE CONFIRMACIÓN
    const confirmacion = window.confirm("¿Estás seguro de que deseas cancelar esta inscripción? Esta acción no se puede deshacer.");
    if (confirmacion) {
      try {
        
        await inscriptionService.cancel(id);


        setInscriptions(prev => prev.filter(ins => ins.id !== id));
        alert("Inscripción cancelada.");
      } catch (error) {
        console.error("Error al cancelar:", error);
        alert("Hubo un error al procesar la cancelación.");
      }
    }
  };

  if (loading) return <div>Cargando inscripciones...</div>;

  return (
    <div>
      <h1>Mis Cursos</h1>
      <hr />
      {inscriptions.length === 0 ? (
        <p>No tienes cursos inscritos.</p>
      ) : (
        <ul>
          {inscriptions.map((ins) => (
            <li key={ins.id} style={{ marginBottom: "15px", border: "1px solid gray", padding: "10px" }}>
              <strong>{ins.courseName}</strong> - Estado: {ins.status}
              <br />
              <button onClick={() => handleCancel(ins.id)}>
                Cancelar inscripción
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}