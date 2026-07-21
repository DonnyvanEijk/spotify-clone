import { Header } from "@/components/header";
import SpotifyContent from "./components/SpotifyContent";

const SpotifyPage = () => {
  return (
    <div className="h-full w-full overflow-hidden overflow-y-auto">
      <Header>
        <div className="mt-20 px-6 md:px-12">
          <p className="text-neutral-400 text-sm font-medium uppercase tracking-widest mb-1">
            Connect
          </p>
          <h1 className="text-white text-3xl font-bold">Spotify</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Link your Spotify account to browse and search its catalog inside DonBeat.
          </p>
        </div>
      </Header>

      <div className="px-6 md:px-12 mt-6 pb-24">
        <SpotifyContent />
      </div>
    </div>
  );
};

export default SpotifyPage;
