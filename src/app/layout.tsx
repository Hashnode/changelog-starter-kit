import { Metadata, ResolvingMetadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { ReactQueryProvider } from '@/components/ReactQueryProvider';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import { PublicationQuery, usePublicationQuery } from '../../generated/graphq';
import getQueryClient from '@/utils/getQueryClient';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getAutogeneratedPublicationOG } from '@/utils/social/og';
const host = process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST as string;

config.autoAddCss = false;

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(
  parent: ResolvingMetadata
): Promise<Metadata> {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: usePublicationQuery.getKey({
      host,
    }),
    queryFn: usePublicationQuery.fetcher({
      host,
    }),
  });

  const data = queryClient.getQueryData<PublicationQuery>(
    usePublicationQuery.getKey({
      host,
    })
  );

  if (!data?.publication) return {};

  return {
    title: data.publication.author.name,
    description:
      data.publication.descriptionSEO ||
      `${data.publication.author.name}'s Blog` ||
      '',
    twitter: {
      card: 'summary_large_image',
      title:
        data.publication.displayTitle ||
        data.publication.title ||
        'Hashnode Blog Starter Kit',
      description:
        data.publication.descriptionSEO ||
        data.publication.title ||
        `${data.publication.author.name}'s Blog` ||
        '',
      images: [
        {
          url:
            data.publication.ogMetaData?.image ||
            getAutogeneratedPublicationOG(data.publication),
          width: 1200,
          height: 630,
        },
      ],
    },
    openGraph: {
      title:
        data.publication.displayTitle ||
        data.publication.title ||
        'Hashnode Blog Starter Kit',
      description:
        data.publication.descriptionSEO ||
        data.publication.title ||
        `${data.publication.author.name}'s Blog` ||
        '',
      images: [
        {
          url:
            data.publication.ogMetaData?.image ||
            getAutogeneratedPublicationOG(data.publication),
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: usePublicationQuery.getKey({
      host,
    }),
    queryFn: usePublicationQuery.fetcher({
      host,
    }),
  });

  const data = queryClient.getQueryData<PublicationQuery>(
    usePublicationQuery.getKey({
      host,
    })
  );

  if (!data?.publication)
    throw new Error('Please check the host name in your .env file');

  return (
    <html lang='en'>
      <body className={`${inter.className} bg-slate-300 dark:bg-slate-950`}>
        <ReactQueryProvider>
          <HydrationBoundary state={dehydrate(queryClient)}>
            {children}
            <Navbar />
          </HydrationBoundary>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
