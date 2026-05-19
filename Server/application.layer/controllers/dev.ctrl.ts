import { Response } from "express";
import { AuthenticatedRequest } from "../../infrastructure.layer/utils/jwt.util";
import { Category } from "../../domain.layer/models/category";
import { Business } from "../../domain.layer/models/business";
import { Product } from "../../domain.layer/models/product";
import { Order, OrderItem } from "../../domain.layer/models/order";
import { Review } from "../../domain.layer/models/review";
import { Message } from "../../domain.layer/models/message";
import { User } from "../../domain.layer/models/user";
import bcrypt from "bcrypt";

export async function seedDemoData(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;

    // 1. Create categories
    const categoriesData = [
      { name: "Electronics", slug: "electronics", icon: "laptop", description: "Gadgets, phones, accessories", sort_order: 1 },
      { name: "Fashion", slug: "fashion", icon: "shirt", description: "Clothing, shoes, accessories", sort_order: 2 },
      { name: "Food & Drinks", slug: "food-drinks", icon: "restaurant", description: "Fresh food, beverages, snacks", sort_order: 3 },
      { name: "Home & Garden", slug: "home-garden", icon: "home", description: "Furniture, decor, gardening", sort_order: 4 },
      { name: "Books & Media", slug: "books-media", icon: "book", description: "Books, music, movies", sort_order: 5 },
      { name: "Sports & Outdoors", slug: "sports-outdoors", icon: "sports", description: "Equipment, activewear", sort_order: 6 },
    ];

    const categories: Category[] = [];
    for (const cat of categoriesData) {
      const [category] = await Category.findOrCreate({
        where: { slug: cat.slug },
        defaults: cat,
      });
      categories.push(category);
    }

    // 2. Create a demo partner user for messages
    const demoPartnerEmail = `demo_partner_${userId}@trademaster.dev`;
    let [demoPartner] = await User.findOrCreate({
      where: { email: demoPartnerEmail },
      defaults: {
        firstname: "Demo",
        lastname: "Seller",
        email: demoPartnerEmail,
        password: await bcrypt.hash("demo123456", 10),
      },
    });

    // 3. Create businesses
    const businessesData = [
      {
        owner: userId,
        title: "Sunny Electronics",
        longitude: -74.0060,
        latitude: 40.7128,
        address: "123 Broadway, New York, NY 10001",
        emails: ["sunny@trademaster.dev"],
        phones: ["+1-555-0101"],
        description: "Your one-stop shop for the latest gadgets and electronics.",
        category_id: categories[0].id,
      },
      {
        owner: userId,
        title: "Urban Style Co.",
        longitude: -73.9857,
        latitude: 40.7484,
        address: "456 5th Avenue, New York, NY 10018",
        emails: ["urban@trademaster.dev"],
        phones: ["+1-555-0102"],
        description: "Trendy fashion for the modern urbanite.",
        category_id: categories[1].id,
      },
      {
        owner: userId,
        title: "Fresh Bites Market",
        longitude: -73.9712,
        latitude: 40.7614,
        address: "789 Lexington Ave, New York, NY 10065",
        emails: ["fresh@trademaster.dev"],
        phones: ["+1-555-0103"],
        description: "Organic and artisan food products delivered fresh.",
        category_id: categories[2].id,
      },
    ];

    const businesses: Business[] = [];
    for (const biz of businessesData) {
      const business = await Business.create(biz);
      businesses.push(business);
    }

    // 4. Create products
    const productsData = [
      // Electronics
      { business_id: businesses[0].id, category_id: categories[0].id, title: "Wireless Headphones", description: "Premium noise-cancelling wireless headphones with 30-hour battery life.", price: 49.99, stock_quantity: 50 },
      { business_id: businesses[0].id, category_id: categories[0].id, title: "Smart Watch", description: "Feature-packed smartwatch with health monitoring and GPS.", price: 199.99, stock_quantity: 25 },
      { business_id: businesses[0].id, category_id: categories[0].id, title: "Phone Case", description: "Slim protective case with shock absorption technology.", price: 14.99, stock_quantity: 100 },
      // Fashion
      { business_id: businesses[1].id, category_id: categories[1].id, title: "Denim Jacket", description: "Classic denim jacket with a modern slim fit.", price: 89.99, stock_quantity: 30 },
      { business_id: businesses[1].id, category_id: categories[1].id, title: "Running Shoes", description: "Lightweight running shoes with responsive cushioning.", price: 129.99, stock_quantity: 40 },
      { business_id: businesses[1].id, category_id: categories[1].id, title: "Canvas Backpack", description: "Durable canvas backpack with laptop compartment.", price: 45.99, stock_quantity: 60 },
      // Food
      { business_id: businesses[2].id, category_id: categories[2].id, title: "Organic Coffee Beans", description: "Single-origin arabica beans, medium roast, 1lb bag.", price: 18.99, stock_quantity: 80 },
      { business_id: businesses[2].id, category_id: categories[2].id, title: "Artisan Chocolate Box", description: "Handcrafted chocolate truffles, assorted flavors, 12-piece box.", price: 24.99, stock_quantity: 45 },
      { business_id: businesses[2].id, category_id: categories[2].id, title: "Trail Mix Pack", description: "Premium mixed nuts, dried fruits, and dark chocolate chips.", price: 12.99, stock_quantity: 120 },
    ];

    const products: Product[] = [];
    for (const prod of productsData) {
      const product = await Product.create(prod);
      products.push(product);
    }

    // 5. Create orders
    // Delivered order (headphones + phone case from Sunny Electronics)
    const deliveredOrder = await Order.create({
      order_number: `DEMO-${Date.now().toString().slice(-6)}-1`,
      buyer_id: userId,
      business_id: businesses[0].id,
      status: "delivered",
      total_amount: 64.98,
      shipping_address: "100 Demo Street, New York, NY 10001",
      confirmed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      shipped_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      delivered_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    await OrderItem.bulkCreate([
      { order_id: deliveredOrder.id, product_id: products[0].id, quantity: 1, unit_price: 49.99, total_price: 49.99 },
      { order_id: deliveredOrder.id, product_id: products[2].id, quantity: 1, unit_price: 14.99, total_price: 14.99 },
    ]);

    // Pending order (denim jacket from Urban Style Co.)
    const pendingOrder = await Order.create({
      order_number: `DEMO-${Date.now().toString().slice(-6)}-2`,
      buyer_id: userId,
      business_id: businesses[1].id,
      status: "pending",
      total_amount: 89.99,
      shipping_address: "100 Demo Street, New York, NY 10001",
    });

    await OrderItem.create({
      order_id: pendingOrder.id,
      product_id: products[3].id,
      quantity: 1,
      unit_price: 89.99,
      total_price: 89.99,
    });

    // 6. Create reviews on the delivered order
    const reviews = await Review.bulkCreate([
      {
        reviewer_id: userId,
        business_id: businesses[0].id,
        product_id: products[0].id,
        order_id: deliveredOrder.id,
        rating: 5,
        comment: "Amazing headphones! The noise cancellation is top-notch and the battery lasts forever.",
      },
      {
        reviewer_id: userId,
        business_id: businesses[0].id,
        product_id: products[2].id,
        order_id: deliveredOrder.id,
        rating: 4,
        comment: "Great case, fits perfectly. Good value for money.",
      },
    ]);

    // 7. Create demo messages
    const messages = await Message.bulkCreate([
      {
        sender_id: userId,
        receiver_id: demoPartner.id,
        content: "Hi! I'm interested in the Wireless Headphones. Are they still available?",
        product_id: products[0].id,
      },
      {
        sender_id: demoPartner.id,
        receiver_id: userId,
        content: "Yes! We have plenty in stock. Would you like to place an order?",
        product_id: products[0].id,
      },
      {
        sender_id: userId,
        receiver_id: demoPartner.id,
        content: "Great, I just placed an order. Thanks!",
      },
    ]);

    res.json({
      data: {
        categories: categories.length,
        businesses: businesses.length,
        products: products.length,
        orders: 2,
        reviews: reviews.length,
        messages: messages.length,
      },
      message: "Demo data seeded successfully",
    });
  } catch (error) {
    console.error("Error seeding demo data:", error);
    res.status(500).json({ error: "Failed to seed demo data" });
  }
}
