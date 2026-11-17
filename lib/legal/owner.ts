// Datos del titular que piden la política de privacidad y el aviso legal (RGPD art. 13 y LSSI art. 10).
// Se rellenan UNA sola vez aquí y salen en las dos páginas. Mientras un campo esté vacío, la página enseña
// «[PENDIENTE: …]» resaltado, para que no pueda publicarse por descuido con huecos.
// Cuando todo esté completo y revisado por un profesional, poner LEGAL_IS_DRAFT en false: desaparece el
// aviso de borrador y las páginas pasan a poder indexarse.

export const LEGAL_IS_DRAFT = true;

export const OWNER_DATA = {
  /** Nombre y apellidos, o razón social. */
  name: "",
  /** NIF o CIF. */
  taxId: "",
  /** Domicilio completo (calle, número, código postal, localidad, país). */
  address: "",
  /** Correo de contacto para consultas y para ejercer derechos de protección de datos. */
  email: "",
  /** Solo si es una sociedad: datos del Registro Mercantil. Dejar vacío si no procede (se omite la línea). */
  registry: "",
} as const;

/** Fecha de la última revisión del texto, p. ej. «17 de noviembre de 2026». */
export const LEGAL_UPDATED = "";
