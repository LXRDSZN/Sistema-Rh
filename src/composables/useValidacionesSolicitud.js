import { ref, computed } from 'vue';

/**
 * Composable para validaciones de solicitud de contrato
 * Centraliza todas las reglas de validación para CURP, RFC, NSS, etc.
 */
export function useValidacionesSolicitud() {
  const errores = ref({});

  /**
   * Valida CURP: 18 caracteres exactos, sin símbolos especiales
   * Formato: XXXXXX XXXXXX XX (letras y números)
   */
  const validarCURP = (valor) => {
    if (!valor) return { valido: true, error: '' };
    
    const curp = valor.toUpperCase().trim();
    const regex = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/;
    
    if (curp.length !== 18) {
      return { 
        valido: false, 
        error: 'CURP debe tener exactamente 18 caracteres' 
      };
    }
    
    if (!/^[A-Za-z0-9]+$/.test(curp)) {
      return { 
        valido: false, 
        error: 'CURP no puede contener símbolos especiales (@-.,?)' 
      };
    }
    
    if (!regex.test(curp)) {
      return { 
        valido: false, 
        error: 'CURP tiene formato inválido (ej: PEPA900315HDFRNN09)' 
      };
    }
    
    return { valido: true, error: '' };
  };

  /**
   * Valida RFC: 13 caracteres exactos, sin símbolos especiales
   */
  const validarRFC = (valor) => {
    if (!valor) return { valido: true, error: '' };
    
    const rfc = valor.toUpperCase().trim();
    const regex = /^[A-Z]{4}[0-9]{6}[A-Z0-9]{3}$/;
    
    if (rfc.length !== 13) {
      return { 
        valido: false, 
        error: 'RFC debe tener exactamente 13 caracteres' 
      };
    }
    
    if (!/^[A-Za-z0-9]+$/.test(rfc)) {
      return { 
        valido: false, 
        error: 'RFC no puede contener símbolos especiales (@.*)' 
      };
    }
    
    if (!regex.test(rfc)) {
      return { 
        valido: false, 
        error: 'RFC tiene formato inválido (ej: PEPA900315XY1)' 
      };
    }
    
    return { valido: true, error: '' };
  };

  /**
   * Valida NSS: solo números, 11 dígitos exactos
   */
  const validarNSS = (valor) => {
    if (!valor) return { valido: true, error: '' };
    
    const nss = valor.trim();
    
    if (nss.length !== 11) {
      return { 
        valido: false, 
        error: 'NSS debe tener exactamente 11 dígitos' 
      };
    }
    
    if (!/^\d+$/.test(nss)) {
      return { 
        valido: false, 
        error: 'NSS debe contener solo números, sin símbolos especiales (@-.*) ni letras' 
      };
    }
    
    return { valido: true, error: '' };
  };

  /**
   * Valida Celular: solo números
   */
  const validarCelular = (valor) => {
    if (!valor) return { valido: true, error: '' };
    
    const cel = valor.trim();
    
    if (!/^\d+$/.test(cel)) {
      return { 
        valido: false, 
        error: 'Teléfono celular debe contener solo números' 
      };
    }
    
    return { valido: true, error: '' };
  };

  /**
   * Valida correo electrónico con formato válido
   */
  const validarCorreo = (valor) => {
    if (!valor) return { valido: true, error: '' };
    
    const correo = valor.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!regex.test(correo)) {
      return { 
        valido: false, 
        error: 'Correo debe tener formato válido (nombre@dominio.com)' 
      };
    }
    
    return { valido: true, error: '' };
  };

  /**
   * Valida Pretensión Salarial: solo números y máximo 2 decimales
   */
  const validarPretensionSalarial = (valor) => {
    if (!valor) return { valido: true, error: '' };
    
    const salario = valor.trim();
    const regex = /^\d+(\.\d{1,2})?$/;
    
    if (!regex.test(salario)) {
      return { 
        valido: false, 
        error: 'Pretensión salarial debe ser numérica con máximo 2 decimales (ej: 5000.50)' 
      };
    }
    
    return { valido: true, error: '' };
  };

  /**
   * Valida Modalidad: debe ser uno de los valores permitidos
   */
  const validarModalidad = (valor) => {
    if (!valor) return { valido: true, error: '' };
    
    const modalidadesPermitidas = ['Remoto', 'Híbrido', 'Presencial'];
    
    if (!modalidadesPermitidas.includes(valor)) {
      return { 
        valido: false, 
        error: `Modalidad debe ser: ${modalidadesPermitidas.join(', ')}` 
      };
    }
    
    return { valido: true, error: '' };
  };

  /**
   * Valida que el texto sea solo letras y espacios (primera letra mayúscula)
   */
  const validarSoloLetras = (valor, nombreCampo = 'Campo') => {
    if (!valor) return { valido: true, error: '' };
    
    const texto = valor.trim();
    
    if (!/^[a-záéíóúàèìòùâêîôûäëïöüñA-ZÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÄËÏÖÑ\s\-]+$/.test(texto)) {
      return { 
        valido: false, 
        error: `${nombreCampo} solo debe contener letras y espacios` 
      };
    }
    
    // Capitalizar primera letra
    const capitalizado = texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    
    return { valido: true, error: '', valorCapitalizado: capitalizado };
  };

  /**
   * Capitaliza la primera letra de un texto
   */
  const capitalizarPrimeraLetra = (texto) => {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  };

  /**
   * Valida todo el formulario
   */
  const validarFormulario = (formulario) => {
    errores.value = {};
    let tieneErrores = false;

    // Validar nombres
    const valNombres = validarSoloLetras(formulario.nombres, 'Nombre');
    if (!valNombres.valido) {
      errores.value.nombres = valNombres.error;
      tieneErrores = true;
    }

    // Validar apellido paterno
    const valApePat = validarSoloLetras(formulario.apellidoPaterno, 'Apellido Paterno');
    if (!valApePat.valido) {
      errores.value.apellidoPaterno = valApePat.error;
      tieneErrores = true;
    }

    // Validar apellido materno (opcional)
    if (formulario.apellidoMaterno) {
      const valApeMat = validarSoloLetras(formulario.apellidoMaterno, 'Apellido Materno');
      if (!valApeMat.valido) {
        errores.value.apellidoMaterno = valApeMat.error;
        tieneErrores = true;
      }
    }

    // Validar CURP
    const valCurp = validarCURP(formulario.curp);
    if (!valCurp.valido) {
      errores.value.curp = valCurp.error;
      tieneErrores = true;
    }

    // Validar RFC
    const valRfc = validarRFC(formulario.rfc);
    if (!valRfc.valido) {
      errores.value.rfc = valRfc.error;
      tieneErrores = true;
    }

    // Validar NSS
    const valNss = validarNSS(formulario.nss);
    if (!valNss.valido) {
      errores.value.nss = valNss.error;
      tieneErrores = true;
    }

    // Validar teléfono celular
    const valCel = validarCelular(formulario.telefonoCelular);
    if (!valCel.valido) {
      errores.value.telefonoCelular = valCel.error;
      tieneErrores = true;
    }

    // Validar correo electrónico
    const valCorreo = validarCorreo(formulario.correoElectronico);
    if (!valCorreo.valido) {
      errores.value.correoElectronico = valCorreo.error;
      tieneErrores = true;
    }

    // Validar pretensión salarial
    const valSalario = validarPretensionSalarial(formulario.pretensionSalarial);
    if (!valSalario.valido) {
      errores.value.pretensionSalarial = valSalario.error;
      tieneErrores = true;
    }

    // Validar modalidad
    if (formulario.modalidad) {
      const valModalidad = validarModalidad(formulario.modalidad);
      if (!valModalidad.valido) {
        errores.value.modalidad = valModalidad.error;
        tieneErrores = true;
      }
    }

    return { tieneErrores, errores: errores.value };
  };

  return {
    errores,
    validarCURP,
    validarRFC,
    validarNSS,
    validarCelular,
    validarCorreo,
    validarPretensionSalarial,
    validarModalidad,
    validarSoloLetras,
    capitalizarPrimeraLetra,
    validarFormulario
  };
}
