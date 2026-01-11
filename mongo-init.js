// MongoDB initialization script
// This runs when the container is first created

db = db.getSiblingDB('lookmax');

// Create collections
db.createCollection('users');
db.createCollection('scans');
db.createCollection('content');
db.createCollection('progress');
db.createCollection('posts');
db.createCollection('messages');
db.createCollection('events');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": -1 });
db.scans.createIndex({ "userId": 1, "createdAt": -1 });
db.progress.createIndex({ "userId": 1, "createdAt": -1 });
db.posts.createIndex({ "createdAt": -1 });
db.posts.createIndex({ "userId": 1 });
db.messages.createIndex({ "chatId": 1, "createdAt": 1 });
db.events.createIndex({ "date": 1 });

// Insert default admin user (password: admin123)
db.users.insertOne({
    email: "admin@lookmax.com",
    password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.S5RqOxT4VuHqGm",
    name: "Admin User",
    role: "admin",
    isVerified: true,
    isPremium: true,
    createdAt: new Date(),
    updatedAt: new Date()
});

// Insert sample content categories
db.content.insertMany([
    {
        title: "Skin Care Fundamentals",
        category: "skin",
        isPremium: false,
        order: 1,
        description: "Learn the basics of skincare routines",
        modules: [],
        createdAt: new Date()
    },
    {
        title: "Hair Optimization",
        category: "hair",
        isPremium: false,
        order: 2,
        description: "Techniques for healthier, better-looking hair",
        modules: [],
        createdAt: new Date()
    },
    {
        title: "Gym & Fitness",
        category: "gym",
        isPremium: true,
        order: 3,
        description: "Workout routines for facial and body aesthetics",
        modules: [],
        createdAt: new Date()
    },
    {
        title: "Mental Health & Confidence",
        category: "mental",
        isPremium: true,
        order: 4,
        description: "Building confidence and mental resilience",
        modules: [],
        createdAt: new Date()
    },
    {
        title: "Advanced Facial Analysis",
        category: "facial",
        isPremium: true,
        order: 5,
        description: "Deep dive into canthal tilt and facial harmony",
        modules: [],
        createdAt: new Date()
    }
]);

print('LookMax database initialized successfully!');
