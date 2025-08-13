import { PrismaClient, PaymentMethod } from '@prisma/client';
import { subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Create a test user
    const user = await prisma.userModel.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
            name: 'Test User',
            email: 'test@example.com',
            password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu8.m', // password: test123
            role: 'admin',
            isEmailVerified: true,
            defaultCurrencyCode: 'USD',
            defaultCurrencySymbol: '$',
            defaultTaxRate: 7.5,
        },
    });

    console.log('✅ User created:', user.email);

    // Create categories
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { id: 'cat-electronics' },
            update: {},
            create: {
                id: 'cat-electronics',
                name: 'Electronics',
                description: 'Electronic devices and accessories',
                ownerId: user.id,
            },
        }),
        prisma.category.upsert({
            where: { id: 'cat-clothing' },
            update: {},
            create: {
                id: 'cat-clothing',
                name: 'Clothing',
                description: 'Apparel and fashion items',
                ownerId: user.id,
            },
        }),
        prisma.category.upsert({
            where: { id: 'cat-home' },
            update: {},
            create: {
                id: 'cat-home',
                name: 'Home & Garden',
                description: 'Home improvement and garden items',
                ownerId: user.id,
            },
        }),
    ]);

    console.log('✅ Categories created:', categories.length);

    // Create products
    const products = await Promise.all([
        prisma.product.upsert({
            where: { id: 'prod-laptop' },
            update: {},
            create: {
                id: 'prod-laptop',
                name: 'Gaming Laptop',
                description: 'High-performance gaming laptop',
                price: 1299.99,
                cost: 800.00,
                stock: 50,
                categoryId: categories[0].id,
                ownerId: user.id,
            },
        }),
        prisma.product.upsert({
            where: { id: 'prod-phone' },
            update: {},
            create: {
                id: 'prod-phone',
                name: 'Smartphone',
                description: 'Latest smartphone model',
                price: 799.99,
                cost: 500.00,
                stock: 100,
                categoryId: categories[0].id,
                ownerId: user.id,
            },
        }),
        prisma.product.upsert({
            where: { id: 'prod-tshirt' },
            update: {},
            create: {
                id: 'prod-tshirt',
                name: 'Cotton T-Shirt',
                description: 'Comfortable cotton t-shirt',
                price: 24.99,
                cost: 12.00,
                stock: 200,
                categoryId: categories[1].id,
                ownerId: user.id,
            },
        }),
        prisma.product.upsert({
            where: { id: 'prod-jeans' },
            update: {},
            create: {
                id: 'prod-jeans',
                name: 'Denim Jeans',
                description: 'Classic denim jeans',
                price: 59.99,
                cost: 25.00,
                stock: 150,
                categoryId: categories[1].id,
                ownerId: user.id,
            },
        }),
        prisma.product.upsert({
            where: { id: 'prod-garden-tools' },
            update: {},
            create: {
                id: 'prod-garden-tools',
                name: 'Garden Tool Set',
                description: 'Complete garden maintenance kit',
                price: 89.99,
                cost: 45.00,
                stock: 75,
                categoryId: categories[2].id,
                ownerId: user.id,
            },
        }),
    ]);

    console.log('✅ Products created:', products.length);

    // Create customers
    const customers = await Promise.all([
        prisma.customer.upsert({
            where: { id: 'cust-john' },
            update: {},
            create: {
                id: 'cust-john',
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+1234567890',
                address: '123 Main St, City, State',
                ownerId: user.id,
            },
        }),
        prisma.customer.upsert({
            where: { id: 'cust-jane' },
            update: {},
            create: {
                id: 'cust-jane',
                name: 'Jane Smith',
                email: 'jane@example.com',
                phone: '+1987654321',
                address: '456 Oak Ave, City, State',
                ownerId: user.id,
            },
        }),
        prisma.customer.upsert({
            where: { id: 'cust-bob' },
            update: {},
            create: {
                id: 'cust-bob',
                name: 'Bob Johnson',
                email: 'bob@example.com',
                phone: '+1555666777',
                address: '789 Pine Rd, City, State',
                ownerId: user.id,
            },
        }),
        prisma.customer.upsert({
            where: { id: 'cust-alice' },
            update: {},
            create: {
                id: 'cust-alice',
                name: 'Alice Brown',
                email: 'alice@example.com',
                phone: '+1444333222',
                address: '321 Elm St, City, State',
                ownerId: user.id,
            },
        }),
        prisma.customer.upsert({
            where: { id: 'cust-charlie' },
            update: {},
            create: {
                id: 'cust-charlie',
                name: 'Charlie Wilson',
                email: 'charlie@example.com',
                phone: '+1777888999',
                address: '654 Maple Dr, City, State',
                ownerId: user.id,
            },
        }),
    ]);

    console.log('✅ Customers created:', customers.length);

    // Create sales data over the last 6 months with realistic patterns
    const salesData: any[] = [];
    const channels = ['in-store', 'online', 'phone'];
    const paymentMethods = [PaymentMethod.CASH, PaymentMethod.CREDIT_CARD, PaymentMethod.MOBILE_MONEY];
    const statuses = ['completed', 'pending', 'refunded'];

    // Generate 120 sales over the last 6 months (20 per month)
    for (let i = 0; i < 120; i++) {
        const daysAgo = Math.floor(Math.random() * 180); // Random day in last 6 months (180 days)
        const createdAt = subDays(new Date(), daysAgo);
        
        // Create 1-3 items per sale
        const numItems = Math.floor(Math.random() * 3) + 1;
        const selectedProducts: Array<{ product: any; quantity: number }> = [];
        for (let j = 0; j < numItems; j++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const quantity = Math.floor(Math.random() * 3) + 1;
            selectedProducts.push({ product, quantity });
        }

        // Calculate totals
        let subtotal = 0;
        const saleItems: Array<{ productId: string; quantity: number; price: number; discount: number; tax: number; cost: number | null }> = [];
        
        for (const { product, quantity } of selectedProducts) {
            const price = product.price;
            const discount = Math.random() > 0.7 ? price * 0.1 : 0; // 30% chance of 10% discount
            const itemTotal = (price - discount) * quantity;
            subtotal += itemTotal;
            
            saleItems.push({
                productId: product.id,
                quantity,
                price,
                discount,
                tax: (itemTotal * 0.075), // 7.5% tax
                cost: product.cost,
            });
        }

        const totalDiscount = saleItems.reduce((sum, item) => sum + item.discount, 0);
        const totalTax = saleItems.reduce((sum, item) => sum + item.tax, 0);
        const totalAmount = subtotal + totalTax;

        const channel = channels[Math.floor(Math.random() * channels.length)];
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const customer = customers[Math.floor(Math.random() * customers.length)];

        // Create the sale
        const sale = await prisma.sale.create({
            data: {
                totalAmount,
                taxAmount: totalTax,
                discount: totalDiscount,
                paymentMethod,
                status,
                channel,
                notes: `Sale #${i + 1} - ${channel} purchase`,
                ownerId: user.id,
                customerId: customer.id,
                createdAt,
                saleItems: {
                    create: saleItems,
                },
            },
        });

        salesData.push(sale);
    }

    console.log('✅ Sales created:', salesData.length);

    // Create some additional sales with different patterns for better analytics
    // Seasonal and special event sales
    const specialSales = await Promise.all([
        // Black Friday sale (November)
        prisma.sale.create({
            data: {
                totalAmount: 3999.96,
                taxAmount: 300.00,
                discount: 500.00,
                paymentMethod: PaymentMethod.CREDIT_CARD,
                status: 'completed',
                channel: 'online',
                notes: 'Black Friday mega sale',
                ownerId: user.id,
                customerId: customers[0].id,
                createdAt: subDays(new Date(), 45), // November
                saleItems: {
                    create: [
                        {
                            productId: products[0].id, // Laptop
                            quantity: 2,
                            price: 1299.99,
                            discount: 200.00,
                            tax: 150.00,
                            cost: 800.00,
                        },
                        {
                            productId: products[1].id, // Phone
                            quantity: 2,
                            price: 799.99,
                            discount: 100.00,
                            tax: 75.00,
                            cost: 500.00,
                        },
                    ],
                },
            },
        }),
        // Holiday season sale (December)
        prisma.sale.create({
            data: {
                totalAmount: 899.97,
                taxAmount: 67.50,
                discount: 100.00,
                paymentMethod: PaymentMethod.CREDIT_CARD,
                status: 'completed',
                channel: 'in-store',
                notes: 'Holiday season clothing sale',
                ownerId: user.id,
                customerId: customers[1].id,
                createdAt: subDays(new Date(), 75), // December
                saleItems: {
                    create: [
                        {
                            productId: products[2].id, // T-shirt
                            quantity: 5,
                            price: 24.99,
                            discount: 20.00,
                            tax: 15.00,
                            cost: 12.00,
                        },
                        {
                            productId: products[3].id, // Jeans
                            quantity: 3,
                            price: 59.99,
                            discount: 30.00,
                            tax: 22.50,
                            cost: 25.00,
                        },
                    ],
                },
            },
        }),
        // Spring cleaning sale (March)
        prisma.sale.create({
            data: {
                totalAmount: 449.95,
                taxAmount: 33.75,
                discount: 50.00,
                paymentMethod: PaymentMethod.MOBILE_MONEY,
                status: 'completed',
                channel: 'online',
                notes: 'Spring cleaning garden tools sale',
                ownerId: user.id,
                customerId: customers[2].id,
                createdAt: subDays(new Date(), 135), // March
                saleItems: {
                    create: [
                        {
                            productId: products[4].id, // Garden Tools
                            quantity: 5,
                            price: 89.99,
                            discount: 10.00,
                            tax: 6.75,
                            cost: 45.00,
                        },
                    ],
                },
            },
        }),
        // Summer electronics sale (June)
        prisma.sale.create({
            data: {
                totalAmount: 2099.98,
                taxAmount: 157.50,
                discount: 200.00,
                paymentMethod: PaymentMethod.CREDIT_CARD,
                status: 'completed',
                channel: 'in-store',
                notes: 'Summer electronics clearance',
                ownerId: user.id,
                customerId: customers[3].id,
                createdAt: subDays(new Date(), 165), // June
                saleItems: {
                    create: [
                        {
                            productId: products[0].id, // Laptop
                            quantity: 1,
                            price: 1299.99,
                            discount: 100.00,
                            tax: 90.00,
                            cost: 800.00,
                        },
                        {
                            productId: products[1].id, // Phone
                            quantity: 1,
                            price: 799.99,
                            discount: 100.00,
                            tax: 67.50,
                            cost: 500.00,
                        },
                    ],
                },
            },
        }),
    ]);

    console.log('✅ Additional sales created:', specialSales.length);

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Created ${salesData.length + specialSales.length} sales for analytics testing`);
    console.log(`👥 Created ${customers.length} customers`);
    console.log(`📦 Created ${products.length} products`);
    console.log(`📂 Created ${categories.length} categories`);
    console.log(`👤 Test user: ${user.email} (password: test123)`);
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
