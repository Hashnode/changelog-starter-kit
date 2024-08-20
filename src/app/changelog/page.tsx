'use client';
import { Container } from '@/components/Container';
import {
  useInfinitePostsQuery,
  usePostsQuery,
} from '../../../generated/graphq';
import { Post } from '@/components/Post';
import { Waypoint } from 'react-waypoint';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const host = process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST as string;

export default function Blog() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    error,
  } = useInfinitePostsQuery(
    {
      host,
      pageSize: 2,
      page: 1,
    },
    {
      queryFn: ({ pageParam }) =>
        usePostsQuery.fetcher({
          host,
          pageSize: 2,
          page: pageParam as number,
        })(),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        return lastPage.publication?.postsViaPage.pageInfo.nextPage ?? null;
      },
    }
  );

  const onEnter = () => {
    if (!isFetching && data && hasNextPage) fetchNextPage();
  };

  if (!data || error) throw error;

  const posts =
    data.pages.flatMap((page) => page.publication?.postsViaPage.nodes) || [];

  return (
    <Container>
      <div className='flex flex-col gap-5 py-6 text-slate-950 dark:text-zinc-300'>
        <div className='flex flex-col gap-5'>
          <h1 className='text-3xl font-bold md:text-4xl dark:text-zinc-100'>
            Hashnode Changelog
          </h1>
          <p className='font-light md:w-[560px]'>
            Explore the latest updates, improvements, and bug fixes with
            Hashnode Changelogs. Stay informed about the evolving features and
            enhancements to enhance your coding experience.
          </p>
        </div>
        {posts.length === 0 && (
          <p className='flex w-full flex-1 items-center justify-center gap-3 text-lg font-semibold'>
            <ExclamationTriangleIcon className='h-8 w-8' />
            No posts found
          </p>
        )}
        {posts.length > 0 && (
          <div className='relative flex flex-col gap-20 border-slate-200 sm:border-l dark:border-slate-800'>
            {posts.map((post, index) => (
              <>
                {index === 0 && (
                  <div className='absolute -left-2 -top-1 hidden aspect-square w-4 bg-white sm:block dark:bg-slate-800' />
                )}
                <Post key={post?.id} postInfo={post} />
              </>
            ))}
            {isFetchingNextPage && (
              <div className='flex items-center justify-center'>
                <p className='text-lg font-semibold'>Loading...</p>
              </div>
            )}
            <Waypoint onEnter={onEnter} />
          </div>
        )}
      </div>
    </Container>
  );
}
