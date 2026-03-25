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
        console.error("Error al obtener inscripciones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInscriptions();
  }, [user?.id]);

  if (loading) return <div>Cargando tus cursos...</div>;

  return (
    <div>
      <h1>Mis Cursos Inscritos</h1>
      {inscriptions.length === 0 ? (
        <p>No tienes cursos inscritos actualmente o el servidor no responde.</p>
      ) : (
        <ul>
          {inscriptions.map((ins) => (
            <li key={ins.id}>
              {ins.courseName} - <strong>{ins.status}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}