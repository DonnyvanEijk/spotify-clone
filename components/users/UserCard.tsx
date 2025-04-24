import Link from "next/link";
import { Button } from "../button";

type Props = {
    id: string;
    username?: string;
    bio?: string;
    avatar_url?: string;
    currentUser?: string;
}

export const UserCard = ({ id, username, bio, avatar_url, currentUser }: Props) => {
    const isHighlighted = currentUser === id;

    return (
        <div
            key={id}
            className={`p-4 rounded-lg shadow-md transition duration-300 cursor-pointer ${
                isHighlighted ? "bg-purple-700" : "bg-gray-900 "
            }`}
        >
            <h2 className="text-xl font-semibold flex">
                {username || "Unfinished user "} {isHighlighted && ("- This is you!")}
            
            </h2>
            <p className="text-gray-400">{bio || "No bio has been set"}</p>
            <Link href={`/users/${id}`}>
                <Button className="mt-4 text-white">
                    See more!
                </Button>
            </Link>
        </div>
    );
};