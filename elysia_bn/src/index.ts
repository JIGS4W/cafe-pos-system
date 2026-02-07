import { cors } from '@elysiajs/cors'

export interface Env {
    cafe_db: D1Database;
    ASSETS: Fetcher;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);

        // ✅ 1. เรียกใช้ DB ภายใน function fetch เท่านั้น
        const db = env.cafe_db; 

        // ✅ 2. CORS Headers
        const headers = {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        };

        if (request.method === "OPTIONS") return new Response(null, { headers });

        if (!url.pathname.startsWith('/api')) {
            return env.ASSETS.fetch(request);
        }

        try {
            // ==========================
            // 🔐 ZONE: AUTHENTICATION
            // ==========================
            if (url.pathname === "/api/login" && request.method === "POST") {
                const body: any = await request.json();
                const user = await db.prepare("SELECT * FROM users WHERE username = ? AND password = ?")
                    .bind(body.username, body.password).first();

                if (user) {
                    const token = crypto.randomUUID();
                    await db.prepare("UPDATE users SET token = ? WHERE id = ?").bind(token, user.id).run();
                    return new Response(JSON.stringify({ success: true, token }), { headers });
                }
                return new Response(JSON.stringify({ success: false }), { headers });
            }

            // ==========================
            // 📦 ZONE: PRODUCTS (สินค้า)
            // ==========================
            if (url.pathname === "/api/products" && request.method === "GET") {
                const { results } = await db.prepare(`
                    SELECT p.*, c.name as category_name 
                    FROM products p 
                    LEFT JOIN categories c ON p.category_id = c.id
                `).all();
                return new Response(JSON.stringify(results), { headers });
            }

            if (url.pathname === "/api/products" && request.method === "POST") {
                const body: any = await request.json();
                const { meta } = await db.prepare("INSERT INTO products (name, price, category_id, icon, has_sweetness) VALUES (?, ?, ?, ?, ?)")
                    .bind(body.name, body.price, body.category_id, body.icon || '☕', body.has_sweetness ? 1 : 0).run();
                
                return new Response(JSON.stringify({ success: true, id: meta.last_row_id }), { headers });
            }

            if (url.pathname.startsWith("/api/products/") && request.method === "DELETE") {
                const id = url.pathname.split('/').pop();
                await db.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
                return new Response(JSON.stringify({ success: true }), { headers });
            }

            // ==========================
            // 📂 ZONE: CATEGORIES (หมวดหมู่)
            // ==========================
            if (url.pathname === "/api/categories" && request.method === "GET") {
                const { results } = await db.prepare("SELECT * FROM categories").all();
                return new Response(JSON.stringify(results), { headers });
            }

            if (url.pathname === "/api/categories" && request.method === "POST") {
                const body: any = await request.json();
                await db.prepare("INSERT INTO categories (name) VALUES (?)").bind(body.name).run();
                return new Response(JSON.stringify({ success: true }), { headers });
            }

            if (url.pathname.startsWith("/api/categories/") && request.method === "DELETE") {
                const id = url.pathname.split('/').pop();
                await db.prepare("DELETE FROM categories WHERE id = ?").bind(id).run();
                return new Response(JSON.stringify({ success: true }), { headers });
            }

            // ==========================
            // 🛒 ZONE: ORDERS
            // ==========================
            if (url.pathname === "/api/orders") {
                if (request.method === "GET") {
                    // เลือกมาทั้งหมด (ถ้าใน DB มี column note แล้ว มันจะติดมาด้วยเองโดยอัตโนมัติ)
                    const { results } = await db.prepare("SELECT * FROM orders ORDER BY id DESC LIMIT 50").all();
                    const parsed = results.map((o: any) => ({ ...o, items: JSON.parse(o.items) }));
                    return new Response(JSON.stringify(parsed), { headers });
                }
                
                // ✅ แก้ไขเฉพาะส่วนนี้ครับ (POST)
                if (request.method === "POST") {
                    const body: any = await request.json();
                    
                    // เพิ่มคอลัมน์ note เข้าไปในคำสั่ง INSERT
                    const { meta } = await db.prepare("INSERT INTO orders (items, total, note) VALUES (?, ?, ?)")
                        .bind(
                            JSON.stringify(body.items), 
                            body.total,
                            body.note || "" // ถ้าไม่มีโน๊ตมา ให้ใส่ค่าว่าง
                        ).run();

                    return new Response(JSON.stringify({ success: true, id: meta.last_row_id }), { headers });
                }
            }
            
            if (url.pathname.startsWith("/api/orders/") && request.method === "DELETE") {
                const id = url.pathname.split('/').pop();
                await db.prepare("DELETE FROM orders WHERE id = ?").bind(id).run();
                return new Response(JSON.stringify({ success: true }), { headers });
            }

            // ==========================
            // 📊 ZONE: DASHBOARD
            // ==========================
             if (url.pathname === "/api/daily-sales" && request.method === "GET") {
                const { results } = await db.prepare(`
                    SELECT strftime('%Y-%m-%d', created_at) as sale_date, SUM(total) as total 
                    FROM orders GROUP BY sale_date ORDER BY sale_date DESC LIMIT 7
                `).all();
                return new Response(JSON.stringify(results), { headers });
            }

        } catch (e) {
            return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers });
        }

        return new Response("Not Found", { status: 404, headers });
    }
};