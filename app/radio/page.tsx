import getUser from "@/actions/getUser";
import { getUserById } from "@/actions/getUsers";
import { Header } from "@/components/header";
import { getImage } from "@/lib/getImage";
import { CreateExistingRadioButton } from "./components/CreateExistingButton";
import getRadios from "@/actions/getRadios";
import RadioGrid from "./components/RadioGrid";

const RadioPage = async () => {
  const currentUser = await getUser();
  const user = currentUser ? await getUserById(currentUser.id) : null;
  const avatarImage = user?.avatar_url ? await getImage(user.avatar_url) : "";
  const radios = await getRadios();

  return (
    <div className="h-full w-full overflow-hidden overflow-y-auto">
      <Header image={avatarImage || ""}>
        <div className="mt-20 px-6 md:px-12">
          <p className="text-neutral-400 text-sm font-medium uppercase tracking-widest mb-1">Broadcast</p>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-white text-3xl font-bold">Radio</h1>
            <CreateExistingRadioButton />
          </div>
          <p className="text-neutral-400 text-sm mt-1">{radios.length} {radios.length === 1 ? "station" : "stations"} available</p>
        </div>
      </Header>

      <div className="px-6 md:px-12 mt-6 pb-24">
        <RadioGrid radios={radios} />
      </div>
    </div>
  );
};

export default RadioPage;
