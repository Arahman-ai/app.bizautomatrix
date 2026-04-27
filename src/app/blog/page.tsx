import Link from "next/link";
import Navbar from "@/components/Navbar";
import { posts } from "@/lib/blog";

export const metadata = {
  title: "Blog — BizAutomatrix",
  description: "Tips, guides, and strategies to help local businesses grow their online presence and automate their marketing.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Local Business Marketing Blog</h1>
          <p className="text-blue-100 text-lg">
            Practical tips to help you get more customers, more reviews, and more revenue.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                  <span>{post.date}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-600 leading-relaxed">{post.description}</p>
                <span className="inline-block mt-4 text-blue-600 font-semibold text-sm">
                  Read more →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blue-600 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to Grow Your Business?</h2>
          <p className="text-blue-100 mb-6">Get a free audit of your online presence — no credit card required.</p>
          <Link
            href="/#audit"
            className="inline-block bg-white text-blue-700 font-bold px-8 py-4 rounded-full hover:bg-blue-50 transition-colors"
          >
            Get Your Free Audit →
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
        <p>© {new Date().getFullYear()} BizAutomatrix · <Link href="/" className="hover:text-white">Home</Link></p>
      </footer>
    </div>
  );
}
