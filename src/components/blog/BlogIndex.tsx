/**
 * Blog listing React island — client-side load-more pagination
 * Replaces Gatsby's blog.js template
 */
import { useState } from 'react';
import { theme } from '@/lib/theme';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  link: string;
  featuredImageUrl: string;
  featuredImageAlt: string;
}

interface Props {
  posts: BlogPost[];
}

function stripHtml(html: string): string {
  return html.replace(/(<([^>]+)>)/gi, '');
}

function truncate(text: string, maxLength: number): string {
  const stripped = stripHtml(text);
  if (stripped.length <= maxLength) return stripped;
  return stripped.substring(0, maxLength) + '...';
}

export default function BlogIndex({ posts }: Props) {
  const initialCount  = 5;
  const postsToAdd    = 4;
  const [counter, setCounter] = useState(initialCount);

  if (!posts || posts.length === 0) return null;

  const featured      = posts[0];
  const featuredBlurb = truncate(featured.excerpt, 200);
  const gridPosts     = posts.slice(1, counter);
  const showLoadMore  = counter < posts.length;

  const readArticleClasses =
    theme.text_links.BASE_STYLING +
    theme.text_links.STD +
    theme.text_links.FWD_BASE +
    theme.text_links.ARW_FWD_BLACK +
    theme.text_links.HOVER_ARW_FWD_GREEN +
    theme.text_links.HOVER_GREEN +
    'w-max';

  return (
    <>
      {/* Featured post */}
      <section className="bg-white mt-20">
        <div className="container">
          <article className="featured md:flex">
            {featured.featuredImageUrl && (
              <a href={featured.link} className="w-full md:w-3/5 block">
                <img
                  src={featured.featuredImageUrl}
                  alt={featured.featuredImageAlt}
                  className="w-full object-cover"
                  loading="lazy"
                />
              </a>
            )}
            <div className="w-full md:ml-[5%] md:w-[35%]">
              <h2 className={theme.text.H5 + 'mb-6'}>
                <a href={featured.link} className="hover:text-rm-green">
                  {featured.title}
                </a>
              </h2>
              <p
                className={theme.text.P_STD + 'mb-6'}
                dangerouslySetInnerHTML={{ __html: featuredBlurb }}
              />
              <a href={featured.link} className={readArticleClasses}>
                READ ARTICLE
              </a>
            </div>
          </article>

          {/* Divider */}
          <div
            className="h-px border-b-2 border-b-rm-grey w-full border-solid mt-7 md:mt-20 opacity-20"
            aria-hidden="true"
          />

          {/* Grid posts */}
          <div className="flex flex-wrap flex-row mt-7 md:mt-20 lg:w-[90%] justify-between">
            {gridPosts.map((post) => {
              const blurb = truncate(post.excerpt, 200);
              return (
                <article
                  key={post.id}
                  className="w-full md:w-[45%] lg:mx-[2.5%] flex flex-col mb-7 lg:mb-20"
                >
                  {post.featuredImageUrl && (
                    <a href={post.link}>
                      <img
                        src={post.featuredImageUrl}
                        alt={post.featuredImageAlt}
                        className="object-cover h-[200px] w-full"
                        loading="lazy"
                      />
                    </a>
                  )}
                  <h3 className={theme.text.H4 + 'mt-6'}>
                    <a href={post.link} className="hover:text-rm-green"
                      dangerouslySetInnerHTML={{ __html: post.title }}
                    />
                  </h3>
                  <p
                    className={theme.text.P_STD + 'mt-2 mb-6'}
                    dangerouslySetInnerHTML={{ __html: blurb }}
                  />
                  <a href={post.link} className={readArticleClasses}>
                    READ ARTICLE
                  </a>
                </article>
              );
            })}
          </div>

          {/* Load More button */}
          {showLoadMore && (
            <div className="block ml-auto mr-auto my-20 text-center">
              <button
                type="button"
                onClick={() => setCounter(counter + postsToAdd)}
                className={
                  theme.button.BASE_STYLING + theme.button.GHOST_GREEN_HOVER_DARK
                }
              >
                LOAD MORE
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
