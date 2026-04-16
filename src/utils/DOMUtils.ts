/**
 * Utilidades para manipulación del DOM
 */

export class DOMUtils {
  /**
   * Obtiene un elemento del DOM de forma segura
   */
  static getElementById<T extends HTMLElement>(id: string): T | null {
    return document.getElementById(id) as T | null;
  }

  /**
   * Obtiene múltiples elementos del DOM
   */
  static querySelectorAll<T extends Element>(selector: string): NodeListOf<T> {
    return document.querySelectorAll<T>(selector);
  }

  /**
   * Agrega una clase a un elemento
   */
  static addClass(element: HTMLElement | null, className: string): void {
    element?.classList.add(className);
  }

  /**
   * Remueve una clase de un elemento
   */
  static removeClass(element: HTMLElement | null, className: string): void {
    element?.classList.remove(className);
  }

  /**
   * Agrega múltiples clases a un elemento
   */
  static addClasses(element: HTMLElement | null, classNames: string[]): void {
    if (element) {
      classNames.forEach((className) => element.classList.add(className));
    }
  }

  /**
   * Remueve múltiples clases de un elemento
   */
  static removeClasses(element: HTMLElement | null, classNames: string[]): void {
    if (element) {
      classNames.forEach((className) => element.classList.remove(className));
    }
  }

  /**
   * Establece el texto de un elemento de forma segura
   */
  static setTextContent(element: HTMLElement | null, text: string): void {
    if (element) {
      element.textContent = text;
    }
  }

  /**
   * Establece el HTML interno de un elemento de forma segura
   */
  static setInnerHTML(element: HTMLElement | null, html: string): void {
    if (element) {
      element.innerHTML = html;
    }
  }

  /**
   * Establece estilos en un elemento
   */
  static setStyles(element: HTMLElement | null, styles: Partial<CSSStyleDeclaration>): void {
    if (element) {
      Object.assign(element.style, styles);
    }
  }

  /**
   * Crea un elemento HTML
   */
  static createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    options?: {
      className?: string;
      id?: string;
      textContent?: string;
      innerHTML?: string;
    },
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tagName);
    if (options?.className) element.className = options.className;
    if (options?.id) element.id = options.id;
    if (options?.textContent) element.textContent = options.textContent;
    if (options?.innerHTML) element.innerHTML = options.innerHTML;
    return element;
  }
}
