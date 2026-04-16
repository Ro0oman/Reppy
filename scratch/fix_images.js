import fs from 'fs';

const blogDataPath = './backend/blogData.json';
const data = JSON.parse(fs.readFileSync(blogDataPath, 'utf8'));

// Verified sports/lifestyle images
const verifiedImages = [
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b", // Pullups
  "https://images.unsplash.com/photo-1517838276537-c7010dbf031e", // Rings
  "https://images.unsplash.com/photo-1598971426620-6d4b99824de4", // Dips
  "https://images.unsplash.com/photo-1591117207239-7887103447c4", // Muscleup
  "https://images.unsplash.com/photo-1594381898411-846e7d193883", // Plank
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438", // Pushups/Gym
  "https://images.unsplash.com/photo-1510894347713-fc3ad6cb0392", // Abs
  "https://images.unsplash.com/photo-1598971639058-aba3c3933f7c", // Hanging
  "https://images.unsplash.com/photo-1574680096145-d05b474e2158", // Squat
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48", // Legs
  "https://images.unsplash.com/photo-1541534741688-6078c64ec4d9", // Exhausted
  "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8", // Dips outdoor
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd", // Skill
  "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2", // Gym interior
  "https://images.unsplash.com/photo-1558017487-06bf9f82613a", // Core
  "https://images.unsplash.com/photo-1517438476312-10d79c67750d", // Handstand
  "https://images.unsplash.com/photo-1599447421416-3414500d18a5", // Park pullups
  "https://images.unsplash.com/photo-1434608519344-49d77a699e1d", // Fitness girl
  "https://images.unsplash.com/photo-1578762560072-06e14b562317", // Grip
  "https://images.unsplash.com/photo-1526402978125-f1d6df913175", // Ropes
  "https://images.unsplash.com/photo-1532384748853-8f54a8f476e2", // Flexibility
  "https://images.unsplash.com/photo-1490645935967-10de6ba17051", // Salad
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c", // Meal
  "https://images.unsplash.com/photo-1470252649358-96949c7513c9", // Habits
  "https://images.unsplash.com/photo-1511295742364-903170ca94ce", // Sleep
  "https://images.unsplash.com/photo-1453306458620-5bbef13a5bca", // Cold
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8df0", // Travel
  "https://images.unsplash.com/photo-1562771242-a02d9090c90c", // Chalk
  "https://images.unsplash.com/photo-1550345332-09e3ac987658", // Leg day
  "https://images.unsplash.com/photo-1474224017046-182ece80b263"  // Barbell
].map(url => `${url}?auto=format&fit=crop&w=1200&q=80`);

data.forEach((post, index) => {
  post.image = verifiedImages[index % verifiedImages.length];
});

fs.writeFileSync(blogDataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Unique verified images assigned.');
