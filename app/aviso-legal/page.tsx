import type { Metadata } from "next";
import LegalPage, { Owner, Review } from "../components/LegalPage";
import { LEGAL_IS_DRAFT, OWNER_DATA } from "@/lib/legal/owner";

export const metadata: Metadata = {
  title: "Aviso legal | Destinauta",
  description: "Quién está detrás de Destinauta, condiciones de uso, enlaces de afiliado y limitaciones de responsabilidad.",
  // Mientras sea un borrador no debe salir en buscadores.
  robots: LEGAL_IS_DRAFT ? { index: false, follow: false } : undefined,
};

export default function AvisoLegalPage() {
  return (
    <LegalPage title="Aviso legal" current="aviso-legal">
      <section>
        <h2>1. Titular del sitio web</h2>
        <p>
          En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de que el sitio
          destinauta.com es titularidad de:
        </p>
        <ul>
          <li>Titular: <Owner value={OWNER_DATA.name} label="nombre y apellidos o razón social" /></li>
          <li>NIF/CIF: <Owner value={OWNER_DATA.taxId} label="NIF o CIF" /></li>
          <li>Domicilio: <Owner value={OWNER_DATA.address} label="domicilio completo" /></li>
          <li>Correo de contacto: <Owner value={OWNER_DATA.email} label="correo de contacto" /></li>
          {OWNER_DATA.registry.trim() && <li>Registro Mercantil: {OWNER_DATA.registry}</li>}
        </ul>
      </section>

      <section>
        <h2>2. Qué es Destinauta</h2>
        <p>
          Destinauta es una web de información y orientación para viajar: ayuda a descubrir destinos y a comparar fechas y precios orientativos. No vende billetes de
          avión ni alojamientos: te lleva a los sitios de los proveedores, donde se hace y se paga la reserva y donde rigen sus propias condiciones.
        </p>
      </section>

      <section>
        <h2>3. Enlaces de afiliado</h2>
        <p>
          Algunos enlaces a vuelos y alojamientos son de afiliado: Destinauta puede recibir una comisión si reservas a través de ellos.
        </p>
      </section>

      <section>
        <h2>4. Precios y disponibilidad</h2>
        <p>
          Los precios, fechas y disponibilidad que se muestran proceden de proveedores externos, son orientativos y pueden cambiar en cualquier momento. Antes de reservar,
          comprueba siempre el precio final, los impuestos y las condiciones en la web del proveedor.
        </p>
      </section>

      <section>
        <h2>5. Propiedad intelectual</h2>
        <p>
          Los textos, el diseño y la marca de Destinauta pertenecen a su titular. Las fotografías pertenecen a sus autores y se usan con las licencias que se indican en
          cada caso. No se permite copiar o reutilizar los contenidos sin permiso, salvo lo que la ley autorice.
        </p>
      </section>

      <section>
        <h2>6. Responsabilidad</h2>
        <p>
          Hacemos lo posible por que la información sea correcta y esté al día, pero no podemos garantizarlo en todo momento. Destinauta no se hace responsable de
          las decisiones tomadas a partir de la información de la web ni del contenido y las condiciones de los sitios de terceros a los que enlaza.{" "}
          <Review label="revisar con un profesional el alcance de esta cláusula" />
        </p>
      </section>

      <section>
        <h2>7. Protección de datos</h2>
        <p>
          El tratamiento de datos personales se explica en la <a href="/privacidad">política de privacidad</a>.
        </p>
      </section>

      <section>
        <h2>8. Ley aplicable</h2>
        <p>
          Este aviso se rige por la legislación española. <Review label="revisar con un profesional la jurisdicción aplicable, sobre todo con personas consumidoras de otros países" />
        </p>
      </section>
    </LegalPage>
  );
}
