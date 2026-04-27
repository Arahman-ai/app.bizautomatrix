import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { posts, getPost } from "@/lib/blog";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — BizAutomatrix`,
    description: post.description,
  };
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <article className="max-w-3xl mx-auto px-4 py-16">
        <Link href="/blog" className="text-blue-600 text-sm hover:underline mb-6 inline-block">
          ← Back to Blog
        </Link>

        <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
          <span>{post.date}</span>
          <span>·</span>
          <span>{post.readTime}</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>

        <p className="text-lg text-gray-600 mb-10 leading-relaxed border-l-4 border-blue-500 pl-4">
          {post.description}
        </p>

        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-16 bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Want help implementing this?</h3>
          <p className="text-gray-600 mb-6">
            Get a free audit of your business and we'll show you exactly what to fix.
          </p>
          <Link
            href="/#audit"
            className="inline-block bg-blue-600 text-white font-bold px-8 py-4 rounded-full hover:bg-blue-700 transition-colors"
          >
            Get Your Free Audit →
          </Link>
        </div>
      </article>

      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
        <p>© {new Date().getFullYear()} BizAutomatrix · <Link href="/" className="hover:text-white">Home</Link></p>
      </footer>
    </div>
  );
}
