/**
 * Composable para validación de campos de texto
 * Solo permite letras (con acentos), espacios y la letra ñ
 */

export function useTextValidation() {
  /**
   * Valida que solo se ingresen letras, espacios y caracteres con acentos
   * @param {KeyboardEvent} event - Evento del teclado
   */
  const onlyLetters = (event) => {
    const char = String.fromCharCode(event.keyCode);
    // Permite letras (mayúsculas y minúsculas), espacios, letras con acentos y ñ
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]$/.test(char)) {
      event.preventDefault();
    }
  };

  /**
   * Valida que solo se ingresen números
   * @param {KeyboardEvent} event - Evento del teclado
   */
  const onlyNumbers = (event) => {
    const char = String.fromCharCode(event.keyCode);
    if (!/^[0-9]$/.test(char)) {
      event.preventDefault();
    }
  };

  /**
   * Valida que solo se ingresen letras y números (alfanumérico)
   * @param {KeyboardEvent} event - Evento del teclado
   */
  const onlyAlphanumeric = (event) => {
    const char = String.fromCharCode(event.keyCode);
    if (!/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s]$/.test(char)) {
      event.preventDefault();
    }
  };

  // Patrones para usar con el atributo pattern de HTML
  const patterns = {
    letters: '[A-Za-zÁÉÍÓÚáéíóúÑñ\\s]+',
    lettersOptional: '[A-Za-zÁÉÍÓÚáéíóúÑñ\\s]*',
    numbers: '[0-9]+',
    alphanumeric: '[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\\s]+',
    email: '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$',
    phone: '[0-9]{10}'
  };

  return {
    onlyLetters,
    onlyNumbers,
    onlyAlphanumeric,
    patterns
  };
}
