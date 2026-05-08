import { defineQuery } from "next-sanity";

export const POSTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    mainImage,
    "excerpt": array::join(string::split((pt::text(body)), "")[0..200], "") + "...",
    "categories": categories[]->title,
    "author": author->name,
    "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180)
  }
`);

export const POST_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    publishedAt,
    mainImage,
    body,
    "categories": categories[]->title,
    "author": author->name,
    "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180)
  }
`);

export const POST_SLUGS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)] { "slug": slug.current }
`);
