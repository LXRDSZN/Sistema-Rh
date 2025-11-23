// useCatalogosContratos.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const useCatalogosContratos = () => {
  const obtenerAreas = async () => {
    const { data } = await axios.get(`${API_URL}/catalogos/areas`);
    return data.data;
  };

  const obtenerPuestos = async () => {
    const { data } = await axios.get(`${API_URL}/catalogos/puestos`);
    return data.data;
  };

  const obtenerJornadas = async () => {
    const { data } = await axios.get(`${API_URL}/catalogos/jornadas`);
    return data.data;
  };

  const obtenerPlantillasContrato = async () => {
    const { data } = await axios.get(`${API_URL}/catalogos/plantillas-contrato`);
    return data.data;
  };

  const obtenerEstadosContrato = async () => {
    const { data } = await axios.get(`${API_URL}/catalogos/estados-contrato`);
    return data.data;
  };

  const obtenerTiposDocumento = async () => {
    const { data } = await axios.get(`${API_URL}/catalogos/tipos-documento`);
    return data.data;
  };

  return {
    obtenerAreas,
    obtenerPuestos,
    obtenerJornadas,
    obtenerPlantillasContrato,
    obtenerEstadosContrato,
    obtenerTiposDocumento
  };
};
