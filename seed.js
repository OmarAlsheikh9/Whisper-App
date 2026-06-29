import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import User from './models/userModel.js';
import Question from './models/questionModel.js';

// ─── Sample Data ───────────────────────────────────────────

const users = [
  {
    username: 'ahmed_dev',
    email: 'ahmed@example.com',
    password: 'Password123!',
    displayName: 'Ahmed Hassan',
    bio: 'Full-stack developer | Node.js & React enthusiast',
    tags: ['javascript', 'nodejs', 'react'],
    acceptingQuestions: true
  },
  {
    username: 'sara_design',
    email: 'sara@example.com',
    password: 'Password123!',
    displayName: 'Sara Mohamed',
    bio: 'UI/UX Designer who codes. Ask me anything about design!',
    tags: ['design', 'css', 'figma'],
    acceptingQuestions: true
  },
  {
    username: 'omar_backend',
    email: 'omar@example.com',
    password: 'Password123!',
    displayName: 'Omar Ali',
    bio: 'Backend engineer passionate about APIs and databases',
    tags: ['nodejs', 'mongodb', 'python'],
    acceptingQuestions: true
  },
  {
    username: 'nour_data',
    email: 'nour@example.com',
    password: 'Password123!',
    displayName: 'Nour Ibrahim',
    bio: 'Data Science student | Love learning new things',
    tags: ['python', 'machine-learning', 'sql'],
    acceptingQuestions: false  // not accepting questions
  },
  {
    username: 'youssef_mobile',
    email: 'youssef@example.com',
    password: 'Password123!',
    displayName: 'Youssef Khaled',
    bio: 'Mobile developer | Flutter & React Native',
    tags: ['flutter', 'react-native', 'dart'],
    acceptingQuestions: true
  }
];

const questionsData = [
  // Questions for ahmed_dev
  {
    recipientUsername: 'ahmed_dev',
    body: 'What is the best way to learn Node.js as a beginner?',
    answer: 'Start with the official docs, then build small projects like a REST API. Practice is key — try building a todo app, then a blog, then something with authentication!',
    status: 'answered',
    visibility: 'public',
    likes: 12
  },
  {
    recipientUsername: 'ahmed_dev',
    body: 'Do you prefer React or Vue.js?',
    answer: 'I personally prefer React because of its huge ecosystem and job market, but Vue is great for beginners. Both are excellent choices!',
    status: 'answered',
    visibility: 'public',
    likes: 8
  },
  {
    recipientUsername: 'ahmed_dev',
    body: 'How long did it take you to get your first dev job?',
    answer: null,
    status: 'pending',
    visibility: 'public',
    likes: 0
  },
  {
    recipientUsername: 'ahmed_dev',
    body: 'What IDE do you use?',
    answer: 'VS Code all the way! With extensions like Prettier, ESLint, and GitLens.',
    status: 'answered',
    visibility: 'private',  // private answer
    likes: 3
  },

  // Questions for sara_design
  {
    recipientUsername: 'sara_design',
    body: 'What tools do you recommend for UI design?',
    answer: 'Figma is my go-to for everything! It is free, collaborative, and has amazing plugins. For prototyping, I also use Framer.',
    status: 'answered',
    visibility: 'public',
    likes: 15
  },
  {
    recipientUsername: 'sara_design',
    body: 'How do you pick color palettes for your projects?',
    answer: 'I use coolors.co to generate palettes and always check contrast ratios for accessibility. Start with 2-3 main colors and build from there.',
    status: 'answered',
    visibility: 'public',
    likes: 22
  },
  {
    recipientUsername: 'sara_design',
    body: 'Can you review my portfolio design?',
    answer: null,
    status: 'pending',
    visibility: 'public',
    likes: 0
  },
  {
    recipientUsername: 'sara_design',
    body: 'What is the difference between UX and UI?',
    answer: null,
    status: 'ignored',
    visibility: 'public',
    likes: 0
  },

  // Questions for omar_backend
  {
    recipientUsername: 'omar_backend',
    body: 'MongoDB or PostgreSQL for a new project?',
    answer: 'It depends on your data! If it is relational with lots of joins, go PostgreSQL. If your schema is flexible and document-oriented, MongoDB is perfect. For most web apps, either works great.',
    status: 'answered',
    visibility: 'public',
    likes: 18
  },
  {
    recipientUsername: 'omar_backend',
    body: 'How do you handle authentication in your APIs?',
    answer: 'JWT tokens with refresh token rotation. Short-lived access tokens (15min) and long-lived refresh tokens (7 days). Always hash passwords with bcrypt!',
    status: 'answered',
    visibility: 'public',
    likes: 25
  },
  {
    recipientUsername: 'omar_backend',
    body: 'What is your opinion on GraphQL vs REST?',
    answer: 'REST is simpler and great for most projects. GraphQL shines when you have complex data requirements and multiple frontend clients. Start with REST, learn GraphQL when you need it.',
    status: 'answered',
    visibility: 'public',
    likes: 10
  },
  {
    recipientUsername: 'omar_backend',
    body: 'Do you use Docker in development?',
    answer: 'Yes! Docker Compose for local development is a game changer. I run MongoDB, Redis, and my app all in containers.',
    status: 'answered',
    visibility: 'private',
    likes: 5
  },

  // Questions for youssef_mobile
  {
    recipientUsername: 'youssef_mobile',
    body: 'Flutter or React Native in 2026?',
    answer: 'Both are mature now. Flutter has better performance and a consistent look across platforms. React Native is great if your team already knows JavaScript. I use both depending on the project!',
    status: 'answered',
    visibility: 'public',
    likes: 30
  },
  {
    recipientUsername: 'youssef_mobile',
    body: 'How hard is it to publish an app to the App Store?',
    answer: 'The process is straightforward but Apple review can be strict. Make sure your app follows their Human Interface Guidelines. Budget 1-2 weeks for the first review.',
    status: 'answered',
    visibility: 'public',
    likes: 7
  },
  {
    recipientUsername: 'youssef_mobile',
    body: 'What state management do you use in Flutter?',
    answer: null,
    status: 'pending',
    visibility: 'public',
    likes: 0
  }
];

// ─── Seed Logic ────────────────────────────────────────────

async function seed() {
  try {
    await connectDB();
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Question.deleteMany({});

    // 1. Create users with hashed passwords
    console.log('👤 Creating users...');
    const createdUsers = [];
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = await User.create({
        ...userData,
        password: hashedPassword
      });
      createdUsers.push(user);
      console.log(`   ✅ ${user.username} (${user.email})`);
    }

    // Build a lookup map: username -> userId
    const userMap = {};
    for (const user of createdUsers) {
      userMap[user.username] = user._id;
    }

    // 2. Create questions
    console.log('\n❓ Creating questions...');
    let answeredCount = 0;
    let pendingCount = 0;

    for (const q of questionsData) {
      const recipientId = userMap[q.recipientUsername];
      if (!recipientId) {
        console.log(`   ⚠️  Skipped — user "${q.recipientUsername}" not found`);
        continue;
      }

      const questionData = {
        recipient: recipientId,
        askedBy: null, // anonymous
        body: q.body,
        answer: q.answer,
        status: q.status,
        visibility: q.visibility,
        likes: q.likes || 0
      };

      // Set answeredAt for answered questions
      if (q.status === 'answered') {
        questionData.answeredAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // random time in last 7 days
        answeredCount++;
      } else {
        pendingCount++;
      }

      await Question.create(questionData);
      const statusIcon = q.status === 'answered' ? '💬' : q.status === 'pending' ? '⏳' : '🚫';
      console.log(`   ${statusIcon} → ${q.recipientUsername}: "${q.body.slice(0, 50)}..."`);
    }

    // 3. Summary
    console.log('\n─────────────────────────────────────');
    console.log('🌱 Seed completed successfully!');
    console.log(`   👤 Users created:     ${createdUsers.length}`);
    console.log(`   💬 Answered:          ${answeredCount}`);
    console.log(`   ⏳ Pending/Ignored:   ${pendingCount}`);
    console.log('─────────────────────────────────────');
    console.log('\n🔑 Login credentials (all same password):');
    console.log('   Password: Password123!');
    console.log('   Emails:');
    for (const user of createdUsers) {
      console.log(`     - ${user.email} (${user.username})`);
    }
    console.log('');

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();
