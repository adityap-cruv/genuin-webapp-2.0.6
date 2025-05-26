import { TOP_BAR_HEIGHT } from "src/lib/constants";
import { SideBar } from "src/organisms/side-bar";
import { TopBar } from "src/organisms/top-bar";
import { Feed } from "src/templates/feed";
import { useWindowSize } from "usehooks-ts";

export function Home() {
  const { height } = useWindowSize();
  return (
    <div
      className="gencl:h-full gencl:w-full gencl:mx-auto"
      style={{ maxWidth: 1440 }}
    >
      <TopBar className="gencl:border-b gencl:border-secondary-150" />
      <main className="gencl:flex gencl:h-full">
        <SideBar style={{ height: height - TOP_BAR_HEIGHT }} />
        <Feed feedType="HOME" className="gencl:px-6" />
      </main>
    </div>
  );
}
