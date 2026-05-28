import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { PortableText } from "@portabletext/react";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { POST_QUERY, POST_SLUGS_QUERY } from "@/sanity/lib/queries";
import { getPost } from "@/lib/blog";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await client.fetch(POST_SLUGS_QUERY).catch(() => []);
  return slugs.map((s: { slug: string }) => ({ slug: s.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await client.fetch(POST_QUERY, { slug }).catch(() => null);
  if (post) return { title: `${post.title} — BizAutomatrix`, description: post.excerpt };
  const staticPost = getPost(slug);
  if (staticPost) return { title: `${staticPost.title} — BizAutomatrix`, description: staticPost.description };
  return {};
}

const portableTextComponents = {
  block: {
    h2: ({ children }: any) => <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">{children}</h3>,
    normal: ({ children }: any) => <p className="text-gray-700 leading-relaxed mb-5">{children}</p>,
    blockquote: ({ children }: any) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-6">{children}</blockquote>,
  },
  list: {
    bullet: ({ children }: any) => <ul className="list-disc list-inside space-y-2 mb-5 text-gray-700">{children}</ul>,
    number: ({ children }: any) => <ol className="list-decimal list-inside space-y-2 mb-5 text-gray-700">{children}</ol>,
  },
  marks: {
    strong: ({ children }: any) => <strong className="font-bold text-gray-900">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
    link: ({ value, children }: any) => (
      <a href={value?.href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>
    ),
  },
};

function BlogReturnLinks() {
  return (
    <div className="mb-8 flex flex-wrap gap-2 text-sm font-semibold">
      <Link href="/blog" className="rounded-full bg-blue-50 px-4 py-2 text-blue-700 hover:bg-blue-100 transition-colors">
        Back to Blog
      </Link>
      <Link href="/" className="rounded-full bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 transition-colors">
        App Home
      </Link>
      <a href="https://bizautomatrix.com" className="rounded-full bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 transition-colors">
        Main Website
      </a>
      <a href="https://bizautomatrix.com/pricing.html" className="rounded-full bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 transition-colors">
        Packages
      </a>
      <a href="https://bizautomatrix.com/#demo" className="rounded-full bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors">
        Free Audit
      </a>
    </div>
  );
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const sanityPost = await client.fetch(POST_QUERY, { slug }).catch(() => null);

  if (sanityPost) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <article className="max-w-3xl mx-auto px-4 py-16">
          <BlogReturnLinks />

          <div className="flex items-center gap-3 text-sm text-gray-400 mb-4 flex-wrap">
            {sanityPost.publishedAt && (
              <span>{new Date(sanityPost.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            )}
            {sanityPost.estimatedReadingTime > 0 && (
              <><span>·</span><span>{sanityPost.estimatedReadingTime} min read</span></>
            )}
            {sanityPost.author && <><span>·</span><span>by {sanityPost.author}</span></>}
            {sanityPost.categories?.map((cat: string) => (
              <span key={cat} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium">{cat}</span>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">{sanityPost.title}</h1>

          {sanityPost.mainImage && (
            <div className="relative h-72 w-full rounded-2xl overflow-hidden mb-10">
              <Image
                src={urlFor(sanityPost.mainImage).width(900).height(500).url()}
                alt={sanityPost.mainImage.alt || sanityPost.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="prose-content">
            <PortableText value={sanityPost.body} components={portableTextComponents} />
          </div>

          <div className="mt-16 bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Want help implementing this?</h3>
            <p className="text-gray-600 mb-6">Book a free demo and we'll show you exactly what we can do for your business.</p>
            <Link href="https://bizautomatrix.com/#demo" className="inline-block bg-blue-600 text-white font-bold px-8 py-4 rounded-full hover:bg-blue-700 transition-colors">
              Book a Free Demo →
            </Link>
          </div>
        </article>

        <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
          <p>© {new Date().getFullYear()} BizAutomatrix · <Link href="/" className="hover:text-white">Home</Link></p>
        </footer>
      </div>
    );
  }

  // Fallback to static posts
  const staticPost = getPost(slug);
  if (!staticPost) notFound();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <article className="max-w-3xl mx-auto px-4 py-16">
        <BlogReturnLinks />
        <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
          <span>{staticPost.date}</span>
          <span>·</span>
          <span>{staticPost.readTime}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">{staticPost.title}</h1>
        <p className="text-lg text-gray-600 mb-10 leading-relaxed border-l-4 border-blue-500 pl-4">{staticPost.description}</p>
        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
          dangerouslySetInnerHTML={{ __html: staticPost.content }}
        />
        <div className="mt-16 bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Want help implementing this?</h3>
          <p className="text-gray-600 mb-6">Book a free demo and we'll show you exactly what we can do for your business.</p>
          <Link href="https://bizautomatrix.com/#demo" className="inline-block bg-blue-600 text-white font-bold px-8 py-4 rounded-full hover:bg-blue-700 transition-colors">
            Book a Free Demo →
          </Link>
        </div>
      </article>
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
        <p>© {new Date().getFullYear()} BizAutomatrix · <Link href="/" className="hover:text-white">Home</Link></p>
      </footer>
    </div>
  );
}
