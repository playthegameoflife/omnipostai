import React from 'react';
import { Link } from 'react-router-dom';

const BlogPage: React.FC = () => {
  const blogPosts = [
    {
      id: 1,
      title: '10 Tips for Better Social Media Engagement',
      excerpt: 'Learn how to increase engagement on your social media posts with these proven strategies.',
      date: 'March 15, 2024',
      category: 'Strategy',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'The Best Time to Post on Social Media',
      excerpt: 'Discover the optimal posting times for each social media platform to maximize your reach.',
      date: 'March 10, 2024',
      category: 'Analytics',
      readTime: '7 min read'
    },
    {
      id: 3,
      title: 'How to Create a Content Calendar That Works',
      excerpt: 'A step-by-step guide to building and maintaining an effective content calendar for your business.',
      date: 'March 5, 2024',
      category: 'Planning',
      readTime: '8 min read'
    },
    {
      id: 4,
      title: 'AI-Powered Content Creation: The Future is Here',
      excerpt: 'Explore how artificial intelligence is revolutionizing social media content creation.',
      date: 'February 28, 2024',
      category: 'Technology',
      readTime: '6 min read'
    }
  ];

  const categories = ['All', 'Strategy', 'Analytics', 'Planning', 'Technology'];

  return (
    <div className="max-w-6xl mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Blog</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Tips, strategies, and insights to help you grow your social media presence.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {categories.map((category) => (
          <button
            key={category}
            className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white transition"
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogPosts.map((post) => (
          <article
            key={post.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
          >
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                  {post.category}
                </span>
                <span className="text-gray-500 text-sm">{post.readTime}</span>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-gray-900">{post.title}</h2>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">{post.date}</span>
                <Link
                  to={`/blog/${post.id}`}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                >
                  Read more →
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 text-center">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
          Load More Posts
        </button>
      </div>
    </div>
  );
};

export default BlogPage;

