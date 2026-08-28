import { Response, NextFunction } from "express";
import { InternalError } from "../../infrastructure.layer/errors/app-error";
import { AuthenticatedRequest } from "../../infrastructure.layer/utils/jwt.util";
import { Category } from "../../domain.layer/models/category";
import { Business } from "../../domain.layer/models/business";
import { Product, ProductImage } from "../../domain.layer/models/product";
import { Order, OrderItem } from "../../domain.layer/models/order";
import { Review } from "../../domain.layer/models/review";
import { Message } from "../../domain.layer/models/message";
import { User } from "../../domain.layer/models/user";
import bcrypt from "bcrypt";
import { logger } from "../../infrastructure.layer/utils/logger.util";

const seedImages = {
  electronics: "/uploads/seed/watch.jpg",
  fashion: "/uploads/seed/tshirt.jpg",
  food: "/uploads/seed/belt.jpg",
  home: "/uploads/seed/purse.jpg",
  books: "/uploads/seed/shoes.jpg",
  sports: "/uploads/seed/watch.jpg",
};

const demoCategories = [
  { name: "Electronics", slug: "electronics", icon: "laptop", description: "Gadgets, phones, accessories", sort_order: 1, is_active: true },
  { name: "Fashion", slug: "fashion", icon: "shirt", description: "Clothing, shoes, accessories", sort_order: 2, is_active: true },
  { name: "Food & Drinks", slug: "food-drinks", icon: "restaurant", description: "Fresh food, beverages, snacks", sort_order: 3, is_active: true },
  { name: "Home & Garden", slug: "home-garden", icon: "home", description: "Furniture, decor, gardening", sort_order: 4, is_active: true },
  { name: "Books & Media", slug: "books-media", icon: "book", description: "Books, music, movies", sort_order: 5, is_active: true },
  { name: "Sports & Outdoors", slug: "sports-outdoors", icon: "sports", description: "Equipment, activewear", sort_order: 6, is_active: true },
];

const demoBusinesses = [
  {
    title: "Sunny Electronics",
    longitude: -74.0060,
    latitude: 40.7128,
    address: "123 Broadway, New York, NY 10001",
    emails: ["sunny@trademaster.dev"],
    phones: ["+1-555-0101"],
    description: "Your one-stop shop for the latest gadgets and electronics.",
    categorySlug: "electronics",
    imageKey: "electronics" as const,
  },
  {
    title: "Urban Style Co.",
    longitude: -73.9857,
    latitude: 40.7484,
    address: "456 5th Avenue, New York, NY 10018",
    emails: ["urban@trademaster.dev"],
    phones: ["+1-555-0102"],
    description: "Trendy fashion for the modern urbanite.",
    categorySlug: "fashion",
    imageKey: "fashion" as const,
  },
  {
    title: "Fresh Bites Market",
    longitude: -73.9712,
    latitude: 40.7614,
    address: "789 Lexington Ave, New York, NY 10065",
    emails: ["fresh@trademaster.dev"],
    phones: ["+1-555-0103"],
    description: "Organic and artisan food products delivered fresh.",
    categorySlug: "food-drinks",
    imageKey: "food" as const,
  },
  {
    title: "Cozy Home Living",
    longitude: -73.9442,
    latitude: 40.7282,
    address: "321 Bedford Ave, Brooklyn, NY 11211",
    emails: ["cozy@trademaster.dev"],
    phones: ["+1-555-0104"],
    description: "Handpicked home decor and furniture for cozy spaces.",
    categorySlug: "home-garden",
    imageKey: "home" as const,
  },
  {
    title: "Page Turner Books",
    longitude: -73.9870,
    latitude: 40.7308,
    address: "555 3rd Ave, New York, NY 10016",
    emails: ["books@trademaster.dev"],
    phones: ["+1-555-0105"],
    description: "Independent bookstore with curated reads and rare finds.",
    categorySlug: "books-media",
    imageKey: "books" as const,
  },
  {
    title: "Peak Performance Sports",
    longitude: -73.9495,
    latitude: 40.7448,
    address: "888 Queens Blvd, Queens, NY 11373",
    emails: ["peak@trademaster.dev"],
    phones: ["+1-555-0106"],
    description: "Premium sports gear and outdoor equipment.",
    categorySlug: "sports-outdoors",
    imageKey: "sports" as const,
  },
  {
    title: "Brew & Bean Café",
    longitude: -74.0018,
    latitude: 40.7350,
    address: "99 MacDougal St, New York, NY 10012",
    emails: ["brew@trademaster.dev"],
    phones: ["+1-555-0107"],
    description: "Artisan coffee roastery and cozy neighborhood café.",
    categorySlug: "food-drinks",
    imageKey: "food" as const,
  },
  {
    title: "Green Thumb Nursery",
    longitude: -73.9776,
    latitude: 40.7681,
    address: "77 Central Park West, New York, NY 10023",
    emails: ["green@trademaster.dev"],
    phones: ["+1-555-0108"],
    description: "Plants, gardening tools, and expert advice for urban gardens.",
    categorySlug: "home-garden",
    imageKey: "home" as const,
  },
];

const demoProducts = [
  // Electronics
  { title: "Wireless Headphones", description: "Premium noise-cancelling wireless headphones with 30-hour battery life.", price: 49.99, stock_quantity: 50, categorySlug: "electronics" },
  { title: "Smart Watch", description: "Feature-packed smartwatch with health monitoring and GPS.", price: 199.99, stock_quantity: 25, categorySlug: "electronics" },
  { title: "Phone Case", description: "Slim protective case with shock absorption technology.", price: 14.99, stock_quantity: 100, categorySlug: "electronics" },
  // Fashion
  { title: "Denim Jacket", description: "Classic denim jacket with a modern slim fit.", price: 89.99, stock_quantity: 30, categorySlug: "fashion" },
  { title: "Running Shoes", description: "Lightweight running shoes with responsive cushioning.", price: 129.99, stock_quantity: 40, categorySlug: "fashion" },
  { title: "Canvas Backpack", description: "Durable canvas backpack with laptop compartment.", price: 45.99, stock_quantity: 60, categorySlug: "fashion" },
  // Food
  { title: "Organic Coffee Beans", description: "Single-origin arabica beans, medium roast, 1lb bag.", price: 18.99, stock_quantity: 80, categorySlug: "food-drinks" },
  { title: "Artisan Chocolate Box", description: "Handcrafted chocolate truffles, assorted flavors, 12-piece box.", price: 24.99, stock_quantity: 45, categorySlug: "food-drinks" },
  { title: "Trail Mix Pack", description: "Premium mixed nuts, dried fruits, and dark chocolate chips.", price: 12.99, stock_quantity: 120, categorySlug: "food-drinks" },
];

const demoReviews = [
  { rating: 5, comment: "Amazing quality! Exceeded my expectations." },
  { rating: 4, comment: "Great value for money. Would recommend." },
  { rating: 5, comment: "Excellent customer service and fast delivery." },
  { rating: 4, comment: "Good product, exactly as described." },
  { rating: 5, comment: "Love it! Will definitely order again." },
  { rating: 3, comment: "Decent, but shipping took longer than expected." },
];

export async function seedDemoData(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    logger.info("DevCtrl", "seedDemoData started", { userId });

    // 1. Categories (idempotent)
    const categoryBySlug = new Map<string, Category>();
    for (const cat of demoCategories) {
      const [category] = await Category.findOrCreate({
        where: { slug: cat.slug },
        defaults: cat,
      });
      categoryBySlug.set(cat.slug, category);
    }

    // 2. Demo partner user for messages
    const demoPartnerEmail = `demo_partner_${userId}@trademaster.dev`;
    const hashedPassword = await bcrypt.hash("demo123456", 10);
    const [demoPartner] = await User.findOrCreate({
      where: { email: demoPartnerEmail },
      defaults: {
        firstname: "Demo",
        lastname: "Seller",
        email: demoPartnerEmail,
        password: hashedPassword,
      },
    });

    // 3. Businesses (idempotent by title + owner)
    const businessByTitle = new Map<string, Business>();
    for (const biz of demoBusinesses) {
      const category = categoryBySlug.get(biz.categorySlug);
      const image = seedImages[biz.imageKey];
      const [business] = await Business.findOrCreate({
        where: { owner: userId, title: biz.title },
        defaults: {
          owner: userId,
          title: biz.title,
          longitude: biz.longitude,
          latitude: biz.latitude,
          address: biz.address,
          emails: biz.emails,
          phones: biz.phones,
          description: biz.description,
          category_id: category?.id || null,
          is_active: true,
          logo: image,
          cover_image: image,
        },
      });
      businessByTitle.set(biz.title, business);
    }

    // 4. Products & images (idempotent by business_id + title)
    const productByTitle = new Map<string, Product>();
    for (const prod of demoProducts) {
      // Find the first business in this category to attach the product to
      const business = Array.from(businessByTitle.values()).find(
        (b) => categoryBySlug.get(prod.categorySlug)?.id === b.category_id
      );
      if (!business) continue;

      const category = categoryBySlug.get(prod.categorySlug);
      const [product] = await Product.findOrCreate({
        where: { business_id: business.id, title: prod.title },
        defaults: {
          business_id: business.id,
          category_id: category?.id || null,
          title: prod.title,
          description: prod.description,
          price: prod.price,
          stock_quantity: prod.stock_quantity,
        },
      });
      productByTitle.set(prod.title, product);

      // Ensure primary image exists
      const existingImage = await ProductImage.findOne({
        where: { product_id: product.id, is_primary: true },
      });
      if (!existingImage) {
        await ProductImage.create({
          product_id: product.id,
          url: seedImages[prod.categorySlug as keyof typeof seedImages] || "/uploads/seed/watch.jpg",
          alt_text: prod.title,
          is_primary: true,
        });
      }
    }

    // 5. Orders (idempotent by order_number prefix per user)
    const sunnyElectronics = businessByTitle.get("Sunny Electronics");
    const urbanStyle = businessByTitle.get("Urban Style Co.");
    const wirelessHeadphones = productByTitle.get("Wireless Headphones");
    const phoneCase = productByTitle.get("Phone Case");
    const denimJacket = productByTitle.get("Denim Jacket");

    let deliveredOrder: Order | null = null;
    if (sunnyElectronics && wirelessHeadphones && phoneCase) {
      const orderNumber = `DEMO-${userId}-DELIVERED`;
      [deliveredOrder] = await Order.findOrCreate({
        where: { order_number: orderNumber },
        defaults: {
          order_number: orderNumber,
          buyer_id: userId,
          business_id: sunnyElectronics.id,
          status: "delivered",
          total_amount: 64.98,
          shipping_address: "100 Demo Street, New York, NY 10001",
          confirmed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          shipped_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          delivered_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      });

      const existingItems = await OrderItem.count({ where: { order_id: deliveredOrder.id } });
      if (existingItems === 0) {
        await OrderItem.bulkCreate([
          { order_id: deliveredOrder.id, product_id: wirelessHeadphones.id, quantity: 1, unit_price: 49.99, total_price: 49.99 },
          { order_id: deliveredOrder.id, product_id: phoneCase.id, quantity: 1, unit_price: 14.99, total_price: 14.99 },
        ]);
      }
    }

    if (urbanStyle && denimJacket) {
      const orderNumber = `DEMO-${userId}-PENDING`;
      const [pendingOrder] = await Order.findOrCreate({
        where: { order_number: orderNumber },
        defaults: {
          order_number: orderNumber,
          buyer_id: userId,
          business_id: urbanStyle.id,
          status: "pending",
          total_amount: 89.99,
          shipping_address: "100 Demo Street, New York, NY 10001",
        },
      });

      const existingItems = await OrderItem.count({ where: { order_id: pendingOrder.id } });
      if (existingItems === 0) {
        await OrderItem.create({
          order_id: pendingOrder.id,
          product_id: denimJacket.id,
          quantity: 1,
          unit_price: 89.99,
          total_price: 89.99,
        });
      }
    }

    // 6. Reviews on Sunny Electronics (idempotent by reviewer + business)
    if (sunnyElectronics && deliveredOrder) {
      const existingReviewCount = await Review.count({
        where: { reviewer_id: userId, business_id: sunnyElectronics.id },
      });
      if (existingReviewCount === 0) {
        const reviewData = demoReviews.slice(0, 3).map((review, index) => ({
          reviewer_id: userId,
          business_id: sunnyElectronics.id,
          product_id: index === 0 ? wirelessHeadphones?.id || null : phoneCase?.id || null,
          order_id: deliveredOrder!.id,
          rating: review.rating,
          comment: review.comment,
        }));
        await Review.bulkCreate(reviewData);
      }
    }

    // 7. Demo messages (idempotent by sender+receiver+content)
    if (wirelessHeadphones) {
      const messagePayloads = [
        {
          sender_id: userId,
          receiver_id: demoPartner.id,
          content: "Hi! I'm interested in the Wireless Headphones. Are they still available?",
          product_id: wirelessHeadphones.id,
        },
        {
          sender_id: demoPartner.id,
          receiver_id: userId,
          content: "Yes! We have plenty in stock. Would you like to place an order?",
          product_id: wirelessHeadphones.id,
        },
        {
          sender_id: userId,
          receiver_id: demoPartner.id,
          content: "Great, I just placed an order. Thanks!",
          product_id: wirelessHeadphones.id,
        },
      ];

      for (const msg of messagePayloads) {
        await Message.findOrCreate({
          where: {
            sender_id: msg.sender_id,
            receiver_id: msg.receiver_id,
            content: msg.content,
          },
          defaults: msg,
        });
      }
    }

    const summary = {
      categories: categoryBySlug.size,
      businesses: businessByTitle.size,
      products: productByTitle.size,
      reviews: demoReviews.length,
      orders: 2,
      messages: 3,
    };
    logger.info("DevCtrl", "seedDemoData completed", summary);

    res.json({
      data: summary,
      message: "Demo data seeded successfully",
    });
  } catch (error) {
    logger.error("DevCtrl", "seedDemoData failed", error, { userId: req.user?.id });
    next(new InternalError("Failed to seed demo data"));
  }
}
