DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS orders;

CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, token TEXT);
CREATE TABLE categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);
CREATE TABLE products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price REAL, category_id INTEGER, icon TEXT, has_sweetness INTEGER DEFAULT 0);
CREATE TABLE orders (id INTEGER PRIMARY KEY AUTOINCREMENT, items TEXT, total REAL, status TEXT DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    items TEXT, 
    total REAL, 
    note TEXT,  -- ✅ เพิ่มบรรทัดนี้
    status TEXT DEFAULT 'pending', 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- สร้าง Admin (Pass: 1234)
INSERT INTO users (username, password) VALUES ('admin', '1234');