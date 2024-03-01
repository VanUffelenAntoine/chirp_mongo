import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Head from "next/head";
import Image from "next/image";

import { type RouterOutputs, api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="flex gap-8">
      <Image
        src={user.imageUrl}
        alt="Profile picture"
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <input placeholder="Type Some emojis!" className="grow bg-transparent" />
    </div>
  );
};

type PostWithUser = RouterOutputs["post"]["getAll"][number];
const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <div className="align-center flex gap-8 border-b border-slate-400 p-4">
      <Image
        src={author.imageUrl}
        alt="Profile picture"
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex gap-1">
          <span className="font-bold">{`@ ${author.username} `}</span>
          <span className="font-thin">{` · ${dayjs(post.createdAt).fromNow()}`}</span>
        </div>
        <span>{post.content}</span>
      </div>
    </div>
  );
};

export default function Home() {
  const { data, isLoading } = api.post.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;

  if (!data)
    return <div>Something went wrong, please try refreshing the page</div>;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
          <div className="border-b border-slate-400 p-4 ">
            <div className="flex justify-center">
              <SignedIn>
                {/* Mount the UserButton component */}
                <UserButton />
              </SignedIn>
              <SignedOut>
                {/* Signed out users get sign in button */}
                <SignInButton />
              </SignedOut>
            </div>
          </div>
          <div className="border-b border-slate-400 p-4 ">
            <CreatePostWizard />
          </div>
          <div>
            {[...data, ...data]?.map((fullPost) => (
              <PostView {...fullPost} key={fullPost.post.id} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
