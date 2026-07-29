// ============================================
// Motivational Quotes Database
// From the world's best books on discipline,
// habits, and peak performance
// ============================================

const QUOTES = [
  // Atomic Habits — James Clear
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear", book: "Atomic Habits" },
  { text: "Every action you take is a vote for the type of person you wish to become.", author: "James Clear", book: "Atomic Habits" },
  { text: "The task of breaking a bad habit is like uprooting a powerful oak within us.", author: "James Clear", book: "Atomic Habits" },
  { text: "Habits are the compound interest of self-improvement.", author: "James Clear", book: "Atomic Habits" },
  { text: "Be the designer of your world and not merely the consumer of it.", author: "James Clear", book: "Atomic Habits" },
  { text: "Success is the product of daily habits — not once-in-a-lifetime transformations.", author: "James Clear", book: "Atomic Habits" },
  { text: "You should be far more concerned with your current trajectory than with your current results.", author: "James Clear", book: "Atomic Habits" },
  { text: "The most effective way to change your habits is to focus not on what you want to achieve, but on who you wish to become.", author: "James Clear", book: "Atomic Habits" },

  // Deep Work — Cal Newport
  { text: "A deep life is a good life, any way you look at it.", author: "Cal Newport", book: "Deep Work" },
  { text: "If you don't produce, you won't thrive — no matter how skilled or talented you are.", author: "Cal Newport", book: "Deep Work" },
  { text: "Clarity about what matters provides clarity about what does not.", author: "Cal Newport", book: "Deep Work" },
  { text: "The ability to perform deep work is becoming increasingly rare and increasingly valuable.", author: "Cal Newport", book: "Deep Work" },
  { text: "Two core abilities for thriving: the ability to quickly master hard things, and the ability to produce at an elite level.", author: "Cal Newport", book: "Deep Work" },

  // Can't Hurt Me — David Goggins
  { text: "You are in danger of living a life so comfortable and soft, that you will die without ever realizing your true potential.", author: "David Goggins", book: "Can't Hurt Me" },
  { text: "We don't rise to the level of our expectations, we fall to the level of our training.", author: "David Goggins", book: "Can't Hurt Me" },
  { text: "The only person who was going to turn my life around was me.", author: "David Goggins", book: "Can't Hurt Me" },
  { text: "When you think you're done, you're only at 40% of your potential.", author: "David Goggins", book: "Can't Hurt Me" },
  { text: "Suffering is a test. That's all it is. Suffering is the true test of life.", author: "David Goggins", book: "Can't Hurt Me" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "David Goggins", book: "Can't Hurt Me" },

  // The Power of Habit — Charles Duhigg
  { text: "Change might not be fast and it isn't always easy. But with time and effort, almost any habit can be reshaped.", author: "Charles Duhigg", book: "The Power of Habit" },
  { text: "Champions don't do extraordinary things. They do ordinary things, but they do them without thinking.", author: "Charles Duhigg", book: "The Power of Habit" },

  // Grit — Angela Duckworth
  { text: "Enthusiasm is common. Endurance is rare.", author: "Angela Duckworth", book: "Grit" },
  { text: "Our potential is one thing. What we do with it is quite another.", author: "Angela Duckworth", book: "Grit" },
  { text: "Grit is about working on something you care about so much that you're willing to stay loyal to it.", author: "Angela Duckworth", book: "Grit" },

  // Flow — Mihaly Csikszentmihalyi
  { text: "The best moments in our lives are not the passive, receptive, relaxing times. The best moments usually occur if a person's body or mind is stretched to its limits.", author: "Mihaly Csikszentmihalyi", book: "Flow" },
  { text: "People who learn to control inner experience will be able to determine the quality of their lives.", author: "Mihaly Csikszentmihalyi", book: "Flow" },

  // The 7 Habits — Stephen Covey
  { text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.", author: "Stephen Covey", book: "The 7 Habits" },
  { text: "Begin with the end in mind.", author: "Stephen Covey", book: "The 7 Habits" },
  { text: "Most of us spend too much time on what is urgent and not enough time on what is important.", author: "Stephen Covey", book: "The 7 Habits" },

  // The War of Art — Steven Pressfield
  { text: "The more important a call or action is to our soul's evolution, the more Resistance we will feel toward pursuing it.", author: "Steven Pressfield", book: "The War of Art" },
  { text: "The amateur believes he must first overcome his fear; then he can do his work. The professional knows that fear can never be overcome.", author: "Steven Pressfield", book: "The War of Art" },
  { text: "Are you paralyzed with fear? That's a good sign. Fear is good. Like self-doubt, fear is an indicator.", author: "Steven Pressfield", book: "The War of Art" },

  // Mindset — Carol Dweck
  { text: "Becoming is better than being. The fixed mindset does not allow people the luxury of becoming.", author: "Carol Dweck", book: "Mindset" },
  { text: "No matter what your ability is, effort is what ignites that ability and turns it into accomplishment.", author: "Carol Dweck", book: "Mindset" },

  // Thinking Fast and Slow — Daniel Kahneman
  { text: "Nothing in life is as important as you think it is, while you are thinking about it.", author: "Daniel Kahneman", book: "Thinking, Fast and Slow" },

  // Discipline Equals Freedom — Jocko Willink
  { text: "Discipline equals freedom.", author: "Jocko Willink", book: "Discipline Equals Freedom" },
  { text: "Don't expect to be motivated every day. Don't count on motivation. Count on discipline.", author: "Jocko Willink", book: "Discipline Equals Freedom" },

  // Man's Search for Meaning — Viktor Frankl
  { text: "When we are no longer able to change a situation, we are challenged to change ourselves.", author: "Viktor Frankl", book: "Man's Search for Meaning" },
  { text: "He who has a Why to live for can bear almost any How.", author: "Viktor Frankl", book: "Man's Search for Meaning" },

  // Meditations — Marcus Aurelius
  { text: "You have power over your mind — not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius", book: "Meditations" },
  { text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius", book: "Meditations" },
  { text: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius", book: "Meditations" },
];

export function getRandomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

export function getDailyQuote() {
  // Deterministic daily quote based on date
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  return QUOTES[dayOfYear % QUOTES.length];
}

export { QUOTES };

// Modern leverage quotes

