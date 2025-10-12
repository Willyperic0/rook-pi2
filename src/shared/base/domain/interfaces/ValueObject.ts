/**
 * Interfaz base para un Value Object.
 * Define la estructura mínima que debe tener cualquier objeto de valor en el dominio.
 */
export default interface ValueObject {
  /** Indica si el valor está definido (no es nulo o vacío) */
  isDefined: () => boolean;

  /** Valida la consistencia o reglas internas del valor */
  isValid: () => boolean;

  /** Compara con otro ValueObject para determinar igualdad */
  equals: (other: ValueObject) => boolean;

  /** Devuelve una representación en string del valor */
  toString: () => string;
}