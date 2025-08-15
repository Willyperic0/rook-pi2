// src/index.ts
import 'reflect-metadata';
import { AppDataSource } from './config/database';
import { Product } from './entities/product.entity';

async function main() {
  console.log('🚀 Iniciando prueba de conexión a la base de datos...');

  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado a la base de datos');

    const repo = AppDataSource.getRepository(Product);

    // Crear producto de prueba (si quieres que no duplique, coméntalo)
    const p = repo.create({
      name: 'Espada Legendaria',
      imageUrl: 'https://example.com/espada.png',
      description: 'Un arma mítica para héroes'
    });
    await repo.save(p);
    console.log('🆕 Producto guardado:', p);

    const list = await repo.find();
    console.log('📦 Productos en BD:', list);
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await AppDataSource.destroy();
    console.log('🔌 Conexión cerrada');
  }
}

main();
