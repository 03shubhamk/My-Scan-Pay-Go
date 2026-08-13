import { pool } from '../config/database';

export interface ProductWithInventory {
  id: string;
  name: string;
  description?: string;
  barcode: string;
  category: string;
  price: number;
  image_url?: string;
  stock_quantity: number;
  low_stock_threshold: number;
  created_at: Date;
  updated_at: Date;
}

// In-memory fallback product catalog for offline testing & seeding
const inMemoryProducts: Map<string, ProductWithInventory> = new Map();

// Populate initial sample products into in-memory store
const seedInitialProducts = () => {
  if (inMemoryProducts.size === 0) {
    const samples: ProductWithInventory[] = [
      {
        id: 'p1000000-0000-0000-0000-000000000001',
        name: 'Amul Taaza Milk (500ml)',
        description: 'Pasteurised Toned Milk 500ml pouch',
        barcode: '8901030000001',
        category: 'Dairy',
        price: 27.00,
        image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
        stock_quantity: 150,
        low_stock_threshold: 20,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'p1000000-0000-0000-0000-000000000002',
        name: 'Lay\'s Classic Salted Chips (50g)',
        description: 'Crispy salted potato chips 50g pack',
        barcode: '8901491100010',
        category: 'Snacks',
        price: 20.00,
        image_url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80',
        stock_quantity: 200,
        low_stock_threshold: 25,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 'p1000000-0000-0000-0000-000000000003',
        name: 'Coca-Cola Original Taste (750ml)',
        description: 'Refreshing sparkling soft drink bottle',
        barcode: '8901764012345',
        category: 'Beverages',
        price: 40.00,
        image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',
        stock_quantity: 100,
        low_stock_threshold: 15,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    samples.forEach((p) => inMemoryProducts.set(p.id, p));
  }
};

seedInitialProducts();

export class ProductRepository {
  async findByBarcode(barcode: string): Promise<ProductWithInventory | null> {
    try {
      const query = `
        SELECT 
          p.id, p.name, p.description, p.barcode, p.category, p.price, p.image_url, 
          p.created_at, p.updated_at,
          COALESCE(i.quantity, 0) as stock_quantity,
          COALESCE(i.low_stock_threshold, 10) as low_stock_threshold
        FROM products p
        LEFT JOIN inventory i ON p.id = i.product_id
        WHERE p.barcode = $1
      `;
      const result = await pool.query(query, [barcode]);
      if (result.rows[0]) {
        result.rows[0].price = parseFloat(result.rows[0].price);
        result.rows[0].stock_quantity = parseInt(result.rows[0].stock_quantity, 10);
        return result.rows[0];
      }
      return null;
    } catch (err: any) {
      if (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED') || err.message?.includes('connect')) {
        for (const p of inMemoryProducts.values()) {
          if (p.barcode === barcode) return p;
        }
        return null;
      }
      throw err;
    }
  }

  async findById(id: string): Promise<ProductWithInventory | null> {
    try {
      const query = `
        SELECT 
          p.id, p.name, p.description, p.barcode, p.category, p.price, p.image_url, 
          p.created_at, p.updated_at,
          COALESCE(i.quantity, 0) as stock_quantity,
          COALESCE(i.low_stock_threshold, 10) as low_stock_threshold
        FROM products p
        LEFT JOIN inventory i ON p.id = i.product_id
        WHERE p.id = $1
      `;
      const result = await pool.query(query, [id]);
      if (result.rows[0]) {
        result.rows[0].price = parseFloat(result.rows[0].price);
        result.rows[0].stock_quantity = parseInt(result.rows[0].stock_quantity, 10);
        return result.rows[0];
      }
      return null;
    } catch (err: any) {
      if (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED') || err.message?.includes('connect')) {
        return inMemoryProducts.get(id) || null;
      }
      throw err;
    }
  }

  async findAll(options: { search?: string; category?: string; page: number; limit: number }): Promise<{ products: ProductWithInventory[]; total: number }> {
    const { search, category, page, limit } = options;
    const offset = (page - 1) * limit;

    try {
      let whereConditions: string[] = [];
      let params: any[] = [];
      let paramCounter = 1;

      if (search) {
        whereConditions.push(`(p.name ILIKE $${paramCounter} OR p.barcode ILIKE $${paramCounter} OR p.description ILIKE $${paramCounter})`);
        params.push(`%${search}%`);
        paramCounter++;
      }

      if (category) {
        whereConditions.push(`LOWER(p.category) = LOWER($${paramCounter})`);
        params.push(category);
        paramCounter++;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const countQuery = `SELECT COUNT(*) FROM products p ${whereClause}`;
      const countResult = await pool.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count, 10);

      const dataQuery = `
        SELECT 
          p.id, p.name, p.description, p.barcode, p.category, p.price, p.image_url, 
          p.created_at, p.updated_at,
          COALESCE(i.quantity, 0) as stock_quantity,
          COALESCE(i.low_stock_threshold, 10) as low_stock_threshold
        FROM products p
        LEFT JOIN inventory i ON p.id = i.product_id
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
      `;

      const dataResult = await pool.query(dataQuery, [...params, limit, offset]);

      const products = dataResult.rows.map((row) => ({
        ...row,
        price: parseFloat(row.price),
        stock_quantity: parseInt(row.stock_quantity, 10),
      }));

      return { products, total };
    } catch (err: any) {
      if (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED') || err.message?.includes('connect')) {
        let list = Array.from(inMemoryProducts.values());

        if (search) {
          const s = search.toLowerCase();
          list = list.filter((p) => p.name.toLowerCase().includes(s) || p.barcode.includes(s) || (p.description && p.description.toLowerCase().includes(s)));
        }

        if (category) {
          const c = category.toLowerCase();
          list = list.filter((p) => p.category.toLowerCase() === c);
        }

        const total = list.length;
        const paginated = list.slice(offset, offset + limit);

        return { products: paginated, total };
      }
      throw err;
    }
  }

  async createProduct(data: {
    name: string;
    description?: string;
    barcode: string;
    category: string;
    price: number;
    imageUrl?: string;
    stockQuantity: number;
    lowStockThreshold?: number;
  }): Promise<ProductWithInventory> {
    const client = await pool.connect().catch(() => null);

    if (client) {
      try {
        await client.query('BEGIN');

        const insertProductQuery = `
          INSERT INTO products (name, description, barcode, category, price, image_url)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `;
        const productResult = await client.query(insertProductQuery, [
          data.name,
          data.description || null,
          data.barcode,
          data.category,
          data.price,
          data.imageUrl || null,
        ]);
        const product = productResult.rows[0];

        const insertInventoryQuery = `
          INSERT INTO inventory (product_id, quantity, low_stock_threshold)
          VALUES ($1, $2, $3)
          RETURNING quantity, low_stock_threshold
        `;
        const inventoryResult = await client.query(insertInventoryQuery, [
          product.id,
          data.stockQuantity,
          data.lowStockThreshold || 10,
        ]);

        await client.query('COMMIT');
        client.release();

        return {
          ...product,
          price: parseFloat(product.price),
          stock_quantity: parseInt(inventoryResult.rows[0].quantity, 10),
          low_stock_threshold: parseInt(inventoryResult.rows[0].low_stock_threshold, 10),
        };
      } catch (err) {
        await client.query('ROLLBACK');
        client.release();
        throw err;
      }
    } else {
      // In-memory fallback
      const id = `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newProduct: ProductWithInventory = {
        id,
        name: data.name,
        description: data.description,
        barcode: data.barcode,
        category: data.category,
        price: data.price,
        image_url: data.imageUrl,
        stock_quantity: data.stockQuantity,
        low_stock_threshold: data.lowStockThreshold || 10,
        created_at: new Date(),
        updated_at: new Date(),
      };
      inMemoryProducts.set(id, newProduct);
      return newProduct;
    }
  }

  async updateProduct(
    id: string,
    data: Partial<{
      name: string;
      description?: string;
      barcode: string;
      category: string;
      price: number;
      imageUrl?: string;
      stockQuantity: number;
      lowStockThreshold?: number;
    }>
  ): Promise<ProductWithInventory | null> {
    const client = await pool.connect().catch(() => null);

    if (client) {
      try {
        await client.query('BEGIN');

        const fields: string[] = [];
        const values: any[] = [];
        let counter = 1;

        if (data.name !== undefined) { fields.push(`name = $${counter++}`); values.push(data.name); }
        if (data.description !== undefined) { fields.push(`description = $${counter++}`); values.push(data.description); }
        if (data.barcode !== undefined) { fields.push(`barcode = $${counter++}`); values.push(data.barcode); }
        if (data.category !== undefined) { fields.push(`category = $${counter++}`); values.push(data.category); }
        if (data.price !== undefined) { fields.push(`price = $${counter++}`); values.push(data.price); }
        if (data.imageUrl !== undefined) { fields.push(`image_url = $${counter++}`); values.push(data.imageUrl); }

        if (fields.length > 0) {
          values.push(id);
          const updateProductQuery = `
            UPDATE products 
            SET ${fields.join(', ')} 
            WHERE id = $${counter} 
            RETURNING *
          `;
          await client.query(updateProductQuery, values);
        }

        if (data.stockQuantity !== undefined || data.lowStockThreshold !== undefined) {
          const invFields: string[] = [];
          const invValues: any[] = [];
          let invCounter = 1;

          if (data.stockQuantity !== undefined) { invFields.push(`quantity = $${invCounter++}`); invValues.push(data.stockQuantity); }
          if (data.lowStockThreshold !== undefined) { invFields.push(`low_stock_threshold = $${invCounter++}`); invValues.push(data.lowStockThreshold); }

          invValues.push(id);
          const updateInvQuery = `
            UPDATE inventory 
            SET ${invFields.join(', ')} 
            WHERE product_id = $${invCounter}
          `;
          await client.query(updateInvQuery, invValues);
        }

        await client.query('COMMIT');
        client.release();

        return await this.findById(id);
      } catch (err) {
        await client.query('ROLLBACK');
        client.release();
        throw err;
      }
    } else {
      const existing = inMemoryProducts.get(id);
      if (!existing) return null;

      const updated: ProductWithInventory = {
        ...existing,
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.barcode !== undefined && { barcode: data.barcode }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.imageUrl !== undefined && { image_url: data.imageUrl }),
        ...(data.stockQuantity !== undefined && { stock_quantity: data.stockQuantity }),
        ...(data.lowStockThreshold !== undefined && { low_stock_threshold: data.lowStockThreshold }),
        updated_at: new Date(),
      };

      inMemoryProducts.set(id, updated);
      return updated;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (err: any) {
      if (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED') || err.message?.includes('connect')) {
        return inMemoryProducts.delete(id);
      }
      throw err;
    }
  }
}

export const productRepository = new ProductRepository();
