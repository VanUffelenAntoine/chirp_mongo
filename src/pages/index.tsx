import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";

import Image from "next/image";

import { type RouterOutputs, api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { PageLayout } from "~/components/Layout";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();

  const [postInput, setPostInput] = useState("");

  const ctx = api.useUtils();

  const { mutate, isLoading: isPosting } = api.post.create.useMutation({
    onSuccess: () => {
      setPostInput("");
      void ctx.post.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) toast.error(errorMessage[0]);
      else toast.error("Failed to post! Please try again later.");
    },
  });

  if (!user) return null;

  return (
    <div className="border-b border-slate-400 p-4 ">
      <div className="flex gap-8">
        <Image
          src={user.imageUrl}
          alt="Profile picture"
          className="h-14 w-14 rounded-full"
          width={56}
          height={56}
        />
        <input
          placeholder="Type Some emojis!"
          className="grow bg-transparent"
          type="text"
          value={postInput}
          onChange={(e) => setPostInput(e.target.value)}
          disabled={isPosting}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (postInput !== "") mutate({ content: postInput });
            }
          }}
        />
        {postInput !== "" && !isPosting && (
          <button
            onClick={() => mutate({ content: postInput })}
            disabled={isPosting}
          >
            Post
          </button>
        )}
        {isPosting && (
          <div className="flex items-center justify-center">
            <LoadingSpinner size={24} />
          </div>
        )}
      </div>
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
          <Link href={`/@${author.username}`}>
            <span className="font-bold">{`@${author.username} `}</span>
          </Link>
          <Link href={`/${post.id}`}>
            <span className="font-thin">{` · ${dayjs(post.createdAt).fromNow()}`}</span>
          </Link>{" "}
        </div>
        <span className="text-xl">{post.content}</span>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading } = api.post.getAll.useQuery();

  if (isLoading) return <LoadingPage />;
  if (!data)
    return <div>Something went wrong, please try refreshing the page</div>;

  return (
    <div>
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

export default function Home() {
  const { isLoaded } = useUser();
  //Fetch data early
  api.post.getAll.useQuery();

  return (
    <PageLayout>
      <div className="flex w-full flex-row justify-between border-b border-slate-400 p-4">
        <div className="flex align-middle">
          <h1 className="text-2xl font-bold">Chirp</h1>
        </div>
        <div className="flex items-center justify-end">
          <div>
            {!isLoaded ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size={16} />
              </div>
            ) : (
              <>
                <SignedIn>
                  {/* Mount the UserButton component */}
                  <UserButton />
                </SignedIn>
                <SignedOut>
                  {/* Signed out users get sign in button */}
                  <SignInButton />
                </SignedOut>
              </>
            )}
          </div>
        </div>
      </div>
      <CreatePostWizard />
      <Feed />
    </PageLayout>
  );
}
