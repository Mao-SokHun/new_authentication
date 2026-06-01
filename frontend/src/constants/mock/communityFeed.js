export const COMMUNITY_FEED_POSTS = [
  {
    id: '1',
    author: 'Phe Sophy',
    authorRole: 'Teacher',
    dept: 'SCIENCE DEPT',
    time: '2h ago',
    content:
      'This teacher teaching is good I like it. Implementing these collaborative experiments has completely transformed the engagement levels in my Physics lab this week. Highly recommend exploring interactive simulations!',
    fullContent:
      'This teacher teaching is good I like it. Implementing these collaborative experiments has completely transformed the engagement levels in my Physics lab this week.\n\nWe started with simple projectile motion sims and moved into interactive labs where students predict outcomes before running the model. Engagement went up noticeably within the first session.\n\nHighly recommend exploring interactive simulations — especially PhET and custom Python visualizations. Happy to share my lesson plan if anyone wants it.',
    likes: 124,
    comments: 18,
    category: 'STEM',
  },
  {
    id: '2',
    author: 'Phe Sophy',
    authorRole: 'Teacher',
    dept: 'ENGLISH LITERATURE',
    time: '5h ago',
    content:
      "New resources for the upcoming semester's reading list are now available in the shared drive. Let's discuss the modern classics during Friday's huddle.",
    fullContent:
      "New resources for the upcoming semester's reading list are now available in the shared drive.\n\nThis semester we're focusing on modern classics — Orwell, Achebe, and a few Cambodian authors in translation. PDFs and discussion guides are in the folder titled \"Spring 2026 Reading List\".\n\nLet's discuss the modern classics during Friday's huddle. Bring one passage you'd like the group to read aloud.",
    likes: 52,
    comments: 12,
    category: 'LANGUAGE',
  },
  {
    id: '3',
    author: 'Sokha Dara',
    authorRole: 'Student',
    dept: 'SCIENCE DEPT',
    time: '1d ago',
    content:
      'Just solved a tricky integration problem using integration by parts. Happy to share the solution if anyone needs help!',
    fullContent:
      'Just solved a tricky integration problem using integration by parts. Happy to share the solution if anyone needs help!\n\nThe integral was ∫ x² e^x dx. I chose u = x² and dv = e^x dx, then applied IBP twice. The trickiest part was tracking the signs on the second round.\n\nIf anyone is stuck on a similar problem, drop your attempt below and I can walk through it step by step.',
    likes: 24,
    comments: 8,
    category: 'STEM',
  },
]

export const COMMUNITY_INITIAL_COMMENTS = {
  '1': [
    { id: 'c1', author: 'Sokha Dara', time: '1h ago', content: 'The simulation link would be really helpful!' },
    { id: 'c2', author: 'Visal Roth', time: '45m ago', content: 'We tried this in our lab too — great results.' },
  ],
  '2': [
    { id: 'c3', author: 'Bopha Keo', time: '3h ago', content: 'Could you share the drive link here?' },
  ],
  '3': [
    { id: 'c4', author: 'Phe Sophy', time: '20h ago', content: 'Nice work! Integration by parts is tricky at first.' },
    { id: 'c5', author: 'Alex Johnson', time: '18h ago', content: 'Can you post your steps?' },
  ],
}

export function findCommunityPost(id) {
  return COMMUNITY_FEED_POSTS.find((p) => p.id === id) ?? null
}
