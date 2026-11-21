import type { Metadata } from "next";
import LegalPage, { Owner, Review } from "../components/LegalPage";
import { LEGAL_IS_DRAFT, OWNER_DATA } from "@/lib/legal/owner";
import { EMAIL_SERVICE_LIVE } from "@/lib/email-preferences/options";

export const metadata: Metadata = {
  title: "Política de privacidad | Destinauta",
  description: "Qué datos trata Destinauta, para qué, con quién los comparte y cómo ejercer tus derechos.",
  // Mientras sea un borrador no debe salir en buscadores.
  robots: LEGAL_IS_DRAFT ? { index: false, follow: false } : undefined,
};

export default function PrivacidadPage() {
  return (
    <LegalPage title="Política de privacidad" current="privacidad">
      <p>
        Esta política explica, en lenguaje sencillo, qué datos personales trata Destinauta (destinauta.com), para qué los usa, con quién los comparte y cómo puedes
        ejercer tus derechos, conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica 3/2018 (LOPDGDD).
      </p>

      <section>
        <h2>1. Quién es el responsable</h2>
        <ul>
          <li>Titular: <Owner value={OWNER_DATA.name} label="nombre y apellidos o razón social" /></li>
          <li>NIF/CIF: <Owner value={OWNER_DATA.taxId} label="NIF o CIF" /></li>
          <li>Domicilio: <Owner value={OWNER_DATA.address} label="domicilio completo" /></li>
          <li>Correo de contacto: <Owner value={OWNER_DATA.email} label="correo de contacto" /></li>
        </ul>
      </section>

      <section>
        <h2>2. Qué datos tratamos y para qué</h2>
        <ul>
          <li>
            <strong>Tu cuenta</strong> (correo electrónico y contraseña). La contraseña se guarda cifrada. Sirve para que puedas crear una cuenta, iniciar sesión y
            recuperar el acceso. Base jurídica: prestarte el servicio que solicitas (art. 6.1.b RGPD).
          </li>
          <li>
            <strong>Viajes e itinerarios guardados</strong> (destino, fechas, número de viajeros, tipo de servicio, itinerarios). Los guardas tú y solo se usan para
            mostrártelos en tu cuenta. Base jurídica: prestarte el servicio (art. 6.1.b).
          </li>
          <li>
            <strong>Gustos de viaje y permiso de correo (opcional).</strong> Si quieres, en «Mi cuenta» puedes contestar una sola vez unas preguntas: aeropuerto o
            aeropuertos de salida, meses en los que te gustaría viajar, tipo de viaje, duración habitual, hasta dónde te apetece ir, cuánto sueles pagar por un vuelo
            de ida y vuelta y cada cuánto quieres recibir el correo. Todas las preguntas son opcionales. Se usan únicamente para personalizar los avisos de vuelos a
            buen precio que te enviaremos por correo si marcas la casilla de permiso. Guardamos también la fecha y la versión del texto con las que diste ese
            permiso. Base jurídica: tu consentimiento (art. 6.1.a), que puedes retirar en cualquier momento sin que afecte a lo anterior.
            {EMAIL_SERVICE_LIVE ? " Solo enviamos estos correos a quien ha dado su permiso." : <> <strong>Todavía no enviamos ningún correo</strong>: cuando empecemos, solo recibirán estos correos las personas que hayan dado su permiso.</>}
          </li>
          <li>
            <strong>Búsquedas de vuelos y hoteles.</strong> Las consultas las atienden proveedores externos (véase el apartado 5). Los datos de tu reserva y de pago
            los gestiona el proveedor al que te llevan los enlaces, no Destinauta.
          </li>
          <li>
            <strong>Datos técnicos</strong> (por ejemplo, dirección IP y registros del servidor), solo los imprescindibles para el funcionamiento y la seguridad de la
            web. Base jurídica: interés legítimo en mantener segura la web (art. 6.1.f). <Review label="confirmar con el titular qué registros se conservan y durante cuánto tiempo" />
          </li>
        </ul>
        <p className="mt-3">
          No te pedimos datos de salud, religión, ingresos, nacionalidad ni edad exacta.
        </p>
      </section>

      <section>
        <h2>3. Cuánto tiempo conservamos tus datos</h2>
        <p>
          Mientras mantengas tu cuenta. Si la borras, se eliminan también tus viajes, itinerarios y respuestas del cuestionario. Puedes borrar solo las respuestas del
          cuestionario en «Mi cuenta», con el botón «Borrar mis respuestas». <Review label="revisar con un profesional si hay que conservar la prueba del permiso de correo durante un plazo y cuál" />
        </p>
      </section>

      <section>
        <h2>4. Qué ocurre con el permiso de correo</h2>
        <p>
          La casilla del permiso es independiente del resto, viene sin marcar y no es necesaria para usar la web. Cuando los correos estén activos, cada uno incluirá un
          enlace para darte de baja con un solo clic, y también podrás desmarcar la casilla en «Mi cuenta». Los precios que se envíen serán los que encontremos para
          tu aeropuerto; son orientativos y pueden cambiar hasta que reserves.
        </p>
      </section>

      <section>
        <h2>5. Con quién compartimos datos</h2>
        <p>Para prestar el servicio nos apoyamos en proveedores que tratan datos por nuestra cuenta o te atienden directamente:</p>
        <ul>
          <li>Supabase: base de datos y acceso a la cuenta.</li>
          <li>Vercel: alojamiento de la web.</li>
          <li>Travelpayouts: búsqueda de vuelos y enlaces de afiliado.</li>
          <li>Stay22: mapa de alojamientos.</li>
          <li>Si se activan: ElevenLabs (voz del asistente), Anthropic (generación de itinerarios) y el proveedor de envío de correo que se elija.</li>
        </ul>
        <p className="mt-3">
          <Review label="confirmar la lista final de proveedores activos en el momento de publicar y sus contratos de encargo del tratamiento" />
        </p>
        <p className="mt-3">
          Algunos de estos proveedores pueden estar fuera del Espacio Económico Europeo. <Review label="indicar las garantías de las transferencias internacionales de cada proveedor" />
        </p>
        <p className="mt-3">No vendemos tus datos.</p>
      </section>

      <section>
        <h2>6. Tus derechos</h2>
        <p>
          Puedes pedir acceso a tus datos, su rectificación o supresión, oponerte a su tratamiento, pedir su limitación y su portabilidad, y retirar tu consentimiento
          cuando quieras. Escribe a <Owner value={OWNER_DATA.email} label="correo de contacto" /> indicando el derecho que quieres ejercer y el correo de tu cuenta. Parte de
          esto puedes hacerlo tú mismo en «Mi cuenta». Si crees que no hemos atendido bien tus derechos, puedes reclamar ante la Agencia Española de Protección de Datos
          (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">www.aepd.es</a>).
        </p>
      </section>

      <section>
        <h2>7. Menores</h2>
        <p>
          Destinauta no está dirigida a menores de 14 años y no crea cuentas a sabiendas para ellos. <Review label="revisar con un profesional la edad mínima y su verificación" />
        </p>
      </section>

      <section id="cookies">
        <h2>8. Cookies y almacenamiento en tu dispositivo</h2>
        <p>
          <strong>Imprescindibles (no necesitan permiso).</strong> Guardamos en tu navegador el idioma que eliges, el aeropuerto de salida que recuerdas en «Viajes por mes»,
          tu sesión si inicias sesión y tu decisión sobre el aviso de cookies.
        </p>
        <p className="mt-3">
          <strong>Servicios de terceros (solo con tu permiso).</strong> La primera vez que entras te preguntamos si los aceptas. Hasta que contestes no se carga ninguno. Es
          el servicio de afiliación y medición de Travelpayouts (convierte los enlaces en enlaces de afiliado y guarda cookies y datos en tu navegador para saber desde qué página
          se hace una reserva). Puedes rechazarlo o cambiar de opinión cuando quieras con el enlace «Cookies» que hay al pie de cada página: si lo rechazas, borramos las cookies y datos
          que ese servicio hubiera guardado en este sitio y la web sigue funcionando.
        </p>
        <p className="mt-3">
          <strong>Cuando haces una búsqueda.</strong> Los resultados de vuelos los muestra un componente de Travelpayouts y el mapa de alojamientos uno de Stay22. Se cargan al buscar,
          porque es el servicio que pides, y guardan en tu navegador sus propias preferencias (por ejemplo, idioma y moneda). El componente de vuelos guarda además cookies de medición de su proveedor, que no podemos desactivar desde aquí. <Review label="comprobar con un profesional si esas cookies del componente de vuelos necesitan permiso previo (hoy se cargan al buscar aunque se hayan rechazado los servicios de terceros)" />
        </p>
      </section>

      <section>
        <h2>9. Cambios en esta política</h2>
        <p>
          Si la cambiamos de forma importante, lo indicaremos aquí con la fecha de la última actualización y, si afecta al correo, te avisaremos antes de aplicarlo.
        </p>
      </section>
    </LegalPage>
  );
}
