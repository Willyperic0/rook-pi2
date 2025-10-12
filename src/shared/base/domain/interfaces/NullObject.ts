/**
 * Interfaz para objetos nulos (Null Object Pattern).
 * Permite que un objeto indique explícitamente que es "nulo" sin usar null o undefined.
 */
export default interface NullObject {
  /** Indica si el objeto es considerado nulo */
  isNull: boolean;
}