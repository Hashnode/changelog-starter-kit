import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/utils/consts/format-date';
import { ImagePlaceholder } from './ImagePlaceholder';
import { resizeImage } from '@/utils/image';
import { getBlurDataUrl } from '@/utils/getBlurDataUrl';
import { useEffect, useState } from 'react';
import { useEmbeds } from '../../hooks/useEmbeds';
import { loadIframeResizer } from '@/utils/services/embed';
import { triggerCustomWidgetEmbed } from '@/utils/trigger-custom-widget-embed';
import handleMathJax from '@/utils/handle-math-jax';
import { MarkdownToHtml } from './MarkdownToHtml';

interface PostProps {
  postInfo:
    | {
        __typename?: 'Post';
        id: string;
        url: string;
        slug: string;
        title: string;
        subtitle?: string | null;
        brief: string;
        publishedAt: any;
        hasLatexInPost: boolean;
        tags?: Array<{
          __typename?: 'Tag';
          id: string;
          name: string;
          slug: string;
        }> | null;
        author: {
          __typename?: 'User';
          name: string;
          username: string;
          profilePicture?: string | null;
        };
        coverImage?: {
          __typename?: 'PostCoverImage';
          url: string;
        } | null;
        content: {
          __typename?: 'Content';
          html: string;
          markdown: string;
        };
      }
    | undefined;
}

export const Post = (props: PostProps) => {
  const { postInfo } = props;

  const [canLoadEmbeds, setCanLoadEmbeds] = useState(false);
  const [, setMobMount] = useState(false);
  useEmbeds({ enabled: canLoadEmbeds });

  useEffect(() => {
    if (screen.width <= 425) {
      setMobMount(true);
    }

    if (!postInfo) return;
    (async () => {
      await loadIframeResizer();
      triggerCustomWidgetEmbed(postInfo.id.toString());
      setCanLoadEmbeds(true);
    })();
  }, [postInfo]);

  const postImageSrc = postInfo?.coverImage?.url
    ? resizeImage(postInfo.coverImage.url, {
        w: 1040,
        h: 585,
        c: 'cover',
      })
    : undefined;

  const blurDataURL = postImageSrc && getBlurDataUrl(postImageSrc);

  if (postInfo && postInfo.hasLatexInPost) {
    setTimeout(() => {
      handleMathJax(true);
    }, 500);
  }

  if (!postInfo) return null;
  return (
    <div className='relative flex w-full flex-col px-2 sm:px-0 sm:pl-20'>
      <div className='absolute -left-2 top-3 hidden aspect-square w-4 rounded-full bg-slate-300 sm:block dark:bg-slate-700'></div>
      <Link
        href={`/preview/${postInfo.slug}`}
        className='mb-5 w-full text-3xl font-semibold dark:text-zinc-100'
      >
        {postInfo.title}
      </Link>
      <div className='mb-5 flex flex-row items-center gap-3'>
        <a
          href={`https://hashnode.com/@${postInfo.author?.username}`}
          target='_blank'
          className='flex flex-row items-center gap-3'
        >
          <div className='flex aspect-square w-9'>
            <Image
              src={postInfo.author?.profilePicture || ''}
              alt='Profile Picture'
              width={36}
              height={36}
              className='flex-1 rounded-full'
            />
          </div>
          <p className='font-semibold dark:text-zinc-100'>
            {postInfo.author?.name}
          </p>
        </a>
        &#183;
        <time className='text-slate-800 dark:text-zinc-300'>
          {formatDate(postInfo.publishedAt)}
        </time>
      </div>
      <div className='mb-6 flex aspect-video w-full overflow-hidden rounded-lg'>
        {postInfo.coverImage?.url ? (
          <Image
            src={postImageSrc}
            alt='Post Image'
            width={1040}
            height={585}
            className='flex-1'
            placeholder='blur'
            blurDataURL={blurDataURL}
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>
      {postInfo.content.markdown && (
        <MarkdownToHtml contentMarkdown={postInfo.content.markdown} />
      )}
    </div>
  );
};
