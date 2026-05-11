"use client";
import { TopBar } from "@components/layouts/desktop/top-bar";

export function WalletLayout(props: any) {
  return (
    <>
      <main className="bg-monochrome-11 absolute inset-0 flex h-full w-full flex-col items-center overflow-clip">
        <TopBar />
        <section className="h-body container flex max-w-4xl gap-4 overflow-clip">
          <section className="relative w-full overflow-auto">{props.children}</section>
        </section>
      </main>
    </>
  );
}
