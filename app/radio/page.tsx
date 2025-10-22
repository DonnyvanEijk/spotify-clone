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
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Header image={avatarImage || ""}>
        <div className="mt-10 px-6 md:px-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <h1 className="text-white text-3xl font-semibold text-center sm:text-left">
              Radio stations
            </h1>
            <CreateExistingRadioButton />
          </div>
        </div>
      </Header>

   

      <div className="ml-20">
        <RadioGrid radios={radios} />
      </div>
    </div>
  );
};

export default RadioPage;
