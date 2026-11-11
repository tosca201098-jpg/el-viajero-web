import type { Ref } from "react";
import { destinationTitleClassName, destinationWindowStyle as style } from "./destination-window-style";

type DestinationWindowHeaderProps = {
  image: string;
  imageAlt: string;
  /** Qué parte de la foto se ve en el marco panorámico (valor CSS de object-position). */
  imagePosition?: string;
  closeLabel: string;
  onClose: () => void;
  closeButtonRef?: Ref<HTMLButtonElement>;
  /** Bandera: texto vacío cuando no hay un dato fiable. */
  flag: string;
  country: string;
  title?: string;
  titleId: string;
};

// Cabecera de la ventana de ficha (modelo Oslo): foto panorámica, degradado, botón de cierre,
// país y nombre. Es una función normal (no un componente con estado) para que los elementos
// salgan exactamente igual que si estuvieran escritos dentro de la página.
export function destinationWindowHeader({
  image, imageAlt, imagePosition, closeLabel, onClose, closeButtonRef, flag, country, title, titleId,
}: DestinationWindowHeaderProps) {
  return (
    <div className={style.photoFrame} data-destination-photo-frame="panoramic">
      <img
        src={image}
        alt={imageAlt}
        className={style.photo}
        style={imagePosition ? { objectPosition: imagePosition } : undefined}
      />

      <div className={style.photoGradient} />

      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className={style.closeButton}
      >
        ✕
      </button>

      <div className={style.titleBox}>
        <p className={style.country}>
          {flag}{" "}
          {country}
        </p>

        <h2 id={titleId} className={destinationTitleClassName(title)}>
          {title}
        </h2>
      </div>
    </div>
  );
}
