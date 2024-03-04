import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex min-h-screen justify-center">
        <div className="w-full border-x border-b border-slate-400 md:max-w-2xl">
          {props.children}
        </div>
      </main>
    </div>
  );
};
