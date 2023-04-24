import { component$, Resource } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

import type {
  DocumentHead,
  StaticGenerateHandler,
} from '@builder.io/qwik-city';
import type { Post } from '~/types';

import md from 'markdown-it';

import { fetchPosts, findPostBySlug } from '~/utils/posts';

export const useGetPostBySlug = routeLoader$(
  async ({ params, status }): Promise<Post> => {
    const post = await findPostBySlug(params.slug);

    if (!post) {
      status(404);
    }

    return post as Post;
  },
);

export default component$(() => {
  const data = useGetPostBySlug();

  return (
    <Resource
      value={data}
      onPending={() => <div>Loading...</div>}
      onRejected={() => <div>Error</div>}
      onResolved={(post: Post) => (
        <section class="mx-auto py-8 sm:py-16 lg:py-20">
          <article>
            <header class={post?.image ? 'text-center' : ''}>
              <p class="mx-auto max-w-3xl px-4 sm:px-6">
                <time dateTime={String(post.publishDate.getTime())}>
                  {post.publishDate.toLocaleDateString('en-us', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    timeZone: 'UTC',
                  })}
                </time>
                {/* ~{" "} {Math.ceil(post.readingTime)} min read */}
              </p>
              <h1 class="leading-tighter font-heading mx-auto mb-8 max-w-3xl px-4 text-4xl font-bold tracking-tighter sm:px-6 md:text-5xl">
                {post.title}
              </h1>
              {post.image ? (
                <img
                  src={post.image}
                  class="mx-auto mt-4 mb-6 max-w-full bg-gray-400 dark:bg-slate-700 sm:rounded-md lg:max-w-6xl"
                  sizes="(max-width: 900px) 400px, 900px"
                  alt={post.excerpt}
                  loading="eager"
                  width={900}
                  height={480}
                />
              ) : (
                <div class="mx-auto max-w-3xl px-4 sm:px-6">
                  <div class="border-t dark:border-slate-700" />
                </div>
              )}
            </header>
            <div
              class="prose-md prose-headings:font-heading prose-headings:leading-tighter container prose prose-lg mx-auto mt-8 max-w-3xl px-6 prose-headings:font-bold prose-headings:tracking-tighter prose-a:text-primary-600 prose-img:rounded-md prose-img:shadow-lg dark:prose-invert dark:prose-headings:text-slate-300 dark:prose-a:text-primary-400 sm:px-6 lg:prose-xl"
              dangerouslySetInnerHTML={md({
                html: true,
              }).render(post.content)}
            />
          </article>
        </section>
      )}
    />
  );
});

export const onStaticGenerate: StaticGenerateHandler = async () => {
  const posts = await fetchPosts();

  return {
    params: posts.map(({ slug }) => ({ slug })),
  };
};

export const head: DocumentHead = ({ resolveValue }) => {
  const post = resolveValue(useGetPostBySlug);

  return {
    title: `${post.title} — ₹ewards11`,
    meta: [
      {
        name: 'description',
        content: post?.excerpt,
      },
    ],
  };
};
