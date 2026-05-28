import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { POSTS_QUERY } from "@/sanity/lib/queries";
import { posts as staticPosts } from "@/lib/blog";

export const revalidate = 60;

export const metadata = {
  title: "Blog — BizAutomatrix",
  description: "Tips, guides, and strategies to help local businesses grow their online presence and automate their marketing.",
};

export default async function BlogPage() {
  const sanityPosts = await client.fetch(POSTS_QUERY).catch(() => []);
  const hasSanityPosts = sanityPosts && sanityPosts.length > 0;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">BizAutomatrix Blog</h1>
          <p className="text-blue-100 text-lg">
            Insights on digital marketing, AI automation, software, and engineering innovation.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm font-semibold">
            <Link href="/" className="rounded-full bg-white/15 px-4 py-2 text-white hover:bg-white/25 transition-colors">
              App Home
            </Link>
            <a href="https://bizautomatrix.com" className="rounded-full bg-white/15 px-4 py-2 text-white hover:bg-white/25 transition-colors">
              Main Website
            </a>
            <a href="https://bizautomatrix.com/pricing.html" className="rounded-full bg-white/15 px-4 py-2 text-white hover:bg-white/25 transition-colors">
              Packages
            </a>
            <a href="https://bizautomatrix.com/#demo" className="rounded-full bg-white px-4 py-2 text-blue-700 hover:bg-blue-50 transition-colors">
              Free Audit
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          {hasSanityPosts ? (
            <div className="space-y-8">
              {sanityPosts.map((post: any) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug.current}`}
                  className="block bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  {post.mainImage && (
                    <div className="relative h-52 w-full">
                      <Image
                        src={urlFor(post.mainImage).width(800).height(400).url()}
                        alt={post.mainImage.alt || post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-8">
                    <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                      {post.publishedAt && (
                        <span>{new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                      )}
                      {post.estimatedReadingTime > 0 && (
                        <>
                          <span>·</span>
                          <span>{post.estimatedReadingTime} min read</span>
                        </>
                      )}
                      {post.categories?.map((cat: string) => (
                        <span key={cat} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium">{cat}</span>
                      ))}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-600 leading-relaxed">{post.excerpt}</p>
                    )}
                    <span className="inline-block mt-4 text-blue-600 font-semibold text-sm">Read more →</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {staticPosts.map((post) => (
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
                  <span className="inline-block mt-4 text-blue-600 font-semibold text-sm">Read more →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-blue-600 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to Grow Your Business?</h2>
          <p className="text-blue-100 mb-6">Get a free audit of your online presence — no credit card required.</p>
          <Link
            href="https://bizautomatrix.com/#demo"
            className="inline-block bg-white text-blue-700 font-bold px-8 py-4 rounded-full hover:bg-blue-50 transition-colors"
          >
            Book a Free Demo →
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
        <p>© {new Date().getFullYear()} BizAutomatrix · <Link href="/" className="hover:text-white">Home</Link></p>
      </footer>
    </div>
  );
}
