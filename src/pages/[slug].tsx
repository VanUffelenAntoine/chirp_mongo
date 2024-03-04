import Head from "next/head";
import Image from "next/image";

import { api } from "~/utils/api";
import { LoadingPage } from "~/components/loading";
import { PageLayout } from "~/components/Layout";
import { PostView } from "~/components/PostView";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.post.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage />;
  if (!data || data.length === 0) return <div>User has not posted</div>;

  return (
    <div className="flex flex-col">
      {data.map((post) => (
        <PostView key={post.post.id} {...post} />
      ))}
    </div>
  );
};

export default function ProfilePage({
  username,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { data } = api.profile.getUserByUsername.useQuery({
    username: username,
  });

  if (!data) return <div>404</div>;

  console.log(data);
  return (
    <>
      <Head>
        <title>{data.username}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <div className="relative h-36 border-b border-slate-400 bg-slate-600">
          <Image
            src={data.imageUrl}
            alt={`${data.username}'s profile picture`}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-2 border-black bg-black"
            width={128}
            height={128}
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="border-b border-slate-400 p-4 text-2xl font-bold">{`@${data.username}`}</div>
        <div className="w-full border-b border-slate-400">
          <ProfileFeed userId={data.id} />
        </div>
      </PageLayout>
    </>
  );
}

import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { db } from "~/server/db";
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";

export async function getStaticProps(
  context: GetStaticPropsContext<{ slug: string }>,
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { db, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") {
    throw new Error("No slug");
  }

  const username = slug.replace("@", "");

  await helpers.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      //Shapes the data to be sent to the client
      trpcState: helpers.dehydrate(),
      username,
    },
    revalidate: 1,
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};
