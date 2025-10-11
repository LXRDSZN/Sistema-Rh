import mongoose from "mongoose";

// Esquema
const backendSchema = new mongoose.Schema({
  nombre:   { type: String, required: true },
  creadoEn: { type: Date,   default: Date.now },
}, {
  collection: 'users' // colección donde se guardarán los documentos
});

// Modelo
export const Backend = mongoose.model('Backend', backendSchema);

// Conexión remota a MongoDB vía ngrok
export const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://hxck4io:bcb96dbdb1@2.tcp.ngrok.io:18885/sistemaRH', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      authSource: 'admin', // autenticación usando la DB admin
    });
    console.log("✅ BD remota conectada a sistemaRH y esquema Backend registrado");
  } catch (error) {
    console.error("❌ Error conectando a Mongo:", error.message);
  }
};

// Exportación correcta
export default connectDB;
