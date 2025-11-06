import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  readTime: string;
  author?: string;
}

const BlogPostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // In a real app, this would fetch from an API or CMS
  // For now, using mock data
  const blogPosts: Record<string, BlogPost> = {
    '1': {
      id: 1,
      title: '10 Tips for Better Social Media Engagement',
      excerpt: 'Learn how to increase engagement on your social media posts with these proven strategies.',
      content: `
        <h2>Introduction</h2>
        <p>Social media engagement is crucial for building a strong online presence. In this comprehensive guide, we'll explore 10 proven strategies to boost your engagement rates across all platforms.</p>
        
        <h2>1. Post at Optimal Times</h2>
        <p>Timing is everything when it comes to social media. Research shows that posting during peak hours when your audience is most active can significantly increase engagement. Use analytics to identify your best posting times.</p>
        
        <h2>2. Use High-Quality Visuals</h2>
        <p>Visual content receives 2.3 times more engagement than text-only posts. Invest in high-quality images, videos, and graphics that capture attention and convey your message effectively.</p>
        
        <h2>3. Ask Questions</h2>
        <p>Engage your audience by asking thought-provoking questions. Questions encourage comments and create conversations around your content.</p>
        
        <h2>4. Respond to Comments</h2>
        <p>Building relationships with your audience requires active participation. Respond to comments promptly and authentically to show that you value their input.</p>
        
        <h2>5. Use Relevant Hashtags</h2>
        <p>Hashtags help your content reach a wider audience. Research and use relevant hashtags that your target audience follows.</p>
        
        <h2>6. Share User-Generated Content</h2>
        <p>Showcase content created by your followers. This not only builds community but also provides authentic social proof.</p>
        
        <h2>7. Create Polls and Interactive Content</h2>
        <p>Interactive content like polls, quizzes, and stories encourage participation and increase engagement rates.</p>
        
        <h2>8. Post Consistently</h2>
        <p>Maintain a consistent posting schedule to keep your audience engaged and your content visible in their feeds.</p>
        
        <h2>9. Tell Stories</h2>
        <p>People connect with stories. Share behind-the-scenes content, personal experiences, and narratives that resonate with your audience.</p>
        
        <h2>10. Analyze and Optimize</h2>
        <p>Regularly review your analytics to understand what works. Use data-driven insights to refine your content strategy and improve engagement over time.</p>
        
        <h2>Conclusion</h2>
        <p>Improving social media engagement is an ongoing process. By implementing these strategies consistently, you'll build a more engaged and loyal following across all your social media platforms.</p>
      `,
      date: 'March 15, 2024',
      category: 'Strategy',
      readTime: '5 min read',
      author: 'OmniPost Team'
    },
    '2': {
      id: 2,
      title: 'The Best Time to Post on Social Media',
      excerpt: 'Discover the optimal posting times for each social media platform to maximize your reach.',
      content: `
        <h2>Introduction</h2>
        <p>Posting at the right time can make or break your social media strategy. Each platform has unique peak hours, and understanding these can dramatically improve your content's performance.</p>
        
        <h2>Facebook Best Times</h2>
        <p>Research shows that Facebook engagement is highest on weekdays between 9 AM and 3 PM. Wednesday and Thursday typically see the best engagement rates.</p>
        
        <h2>Instagram Best Times</h2>
        <p>Instagram users are most active between 11 AM and 1 PM, and again in the evening from 7 PM to 9 PM. Tuesday through Thursday tend to be the best days.</p>
        
        <h2>Twitter/X Best Times</h2>
        <p>Twitter sees peak engagement during weekday mornings (8-10 AM) and lunch hours (12-1 PM). Wednesday and Friday are particularly strong days.</p>
        
        <h2>LinkedIn Best Times</h2>
        <p>LinkedIn is a professional platform, so weekdays during business hours (8 AM to 5 PM) see the most engagement. Tuesday through Thursday are optimal.</p>
        
        <h2>Pinterest Best Times</h2>
        <p>Pinterest users are most active in the evening, particularly between 8 PM and 11 PM. Saturday mornings also see high engagement.</p>
        
        <h2>How to Find Your Best Times</h2>
        <p>Use platform analytics to identify when your specific audience is most active. Test different posting times and track engagement metrics to find your optimal schedule.</p>
      `,
      date: 'March 10, 2024',
      category: 'Analytics',
      readTime: '7 min read',
      author: 'OmniPost Team'
    },
    '3': {
      id: 3,
      title: 'How to Create a Content Calendar That Works',
      excerpt: 'A step-by-step guide to building and maintaining an effective content calendar for your business.',
      content: `
        <h2>Introduction</h2>
        <p>A well-structured content calendar is the foundation of successful social media marketing. It helps you plan, organize, and maintain consistency across all platforms.</p>
        
        <h2>Why You Need a Content Calendar</h2>
        <p>Content calendars help you maintain consistency, plan ahead, avoid last-minute stress, and ensure you're covering all important topics and events.</p>
        
        <h2>Step 1: Define Your Goals</h2>
        <p>Start by identifying your content marketing objectives. Are you looking to increase brand awareness, drive sales, or build community? Your goals will shape your content strategy.</p>
        
        <h2>Step 2: Know Your Audience</h2>
        <p>Understand who your audience is, what they care about, and when they're most active. This information will guide your content topics and posting schedule.</p>
        
        <h2>Step 3: Choose Your Platforms</h2>
        <p>Focus on platforms where your audience is most active. Don't try to be everywhere—quality over quantity is key.</p>
        
        <h2>Step 4: Plan Your Content Mix</h2>
        <p>Create a balanced mix of content types: educational, entertaining, promotional, and community-building posts. Follow the 80/20 rule—80% valuable content, 20% promotional.</p>
        
        <h2>Step 5: Set Up Your Calendar</h2>
        <p>Use a calendar tool (digital or physical) to map out your content. Include dates, platforms, content topics, captions, and hashtags.</p>
        
        <h2>Step 6: Batch Create Content</h2>
        <p>Set aside dedicated time to create multiple pieces of content at once. This improves efficiency and ensures consistency.</p>
        
        <h2>Step 7: Schedule and Automate</h2>
        <p>Use social media management tools to schedule your posts in advance. This saves time and ensures consistent posting.</p>
        
        <h2>Step 8: Review and Adjust</h2>
        <p>Regularly review your calendar's performance and adjust based on what's working. Stay flexible and adapt to trends and audience feedback.</p>
      `,
      date: 'March 5, 2024',
      category: 'Planning',
      readTime: '8 min read',
      author: 'OmniPost Team'
    },
    '4': {
      id: 4,
      title: 'AI-Powered Content Creation: The Future is Here',
      excerpt: 'Explore how artificial intelligence is revolutionizing social media content creation.',
      content: `
        <h2>Introduction</h2>
        <p>Artificial intelligence is transforming how we create, distribute, and optimize social media content. From AI-generated captions to intelligent scheduling, the future of social media marketing is here.</p>
        
        <h2>The Rise of AI in Content Creation</h2>
        <p>AI tools are becoming increasingly sophisticated, capable of generating high-quality content that resonates with audiences. These tools can analyze trends, generate ideas, and even create full posts.</p>
        
        <h2>AI Content Generation</h2>
        <p>Modern AI can generate engaging social media posts, suggest hashtags, and adapt content for different platforms. This saves time while maintaining quality and consistency.</p>
        
        <h2>Intelligent Scheduling</h2>
        <p>AI algorithms can analyze your audience behavior and automatically schedule posts at optimal times for maximum engagement.</p>
        
        <h2>Content Optimization</h2>
        <p>AI tools can analyze your content performance and suggest improvements. They can identify what resonates with your audience and recommend similar content.</p>
        
        <h2>The Human Touch</h2>
        <p>While AI is powerful, the human element remains crucial. AI should enhance, not replace, human creativity and strategic thinking.</p>
        
        <h2>Getting Started with AI</h2>
        <p>Start by using AI for routine tasks like hashtag generation and content suggestions. As you become more comfortable, explore more advanced features like automated content creation.</p>
      `,
      date: 'February 28, 2024',
      category: 'Technology',
      readTime: '6 min read',
      author: 'OmniPost Team'
    }
  };

  const post = id ? blogPosts[id] : null;

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Post Not Found</h1>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
          <Link to="/blog" className="text-blue-600 hover:underline">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-16 px-4">
      <Link
        to="/blog"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Blog
      </Link>

      <article className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
            {post.category}
          </span>
          <span className="text-gray-500 text-sm">{post.readTime}</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">{post.title}</h1>

        <div className="flex items-center gap-4 mb-8 text-gray-600">
          <span>{post.date}</span>
          {post.author && (
            <>
              <span>•</span>
              <span>By {post.author}</span>
            </>
          )}
        </div>

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
          style={{
            lineHeight: '1.75',
          }}
        />
      </article>

      <div className="mt-12 text-center">
        <Link
          to="/blog"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Read More Posts
        </Link>
      </div>
    </div>
  );
};

export default BlogPostDetail;


