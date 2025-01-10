import React, { useEffect, useState } from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { HiChevronRight } from "react-icons/hi";
import { FaTrashAlt } from "react-icons/fa";
import { MdOutlineModeEditOutline, MdPlaylistAdd, MdPlaylistAddCheck } from "react-icons/md";
import { Song } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useUser } from "@/hooks/useUser";
import { TbDownload, TbDownloadOff, TbMicrophone } from "react-icons/tb";
import { useCreatePlaylistModal } from "@/hooks/useCreatePlaylistModal";
import { useAddToPlaylistModal } from "@/hooks/useAddToPlaylistModal";
import { useAuthModal } from "@/hooks/useAuthModal";
import toast from "react-hot-toast";
import { CiTextAlignCenter } from "react-icons/ci";
import { useDeleteSong } from "@/hooks/useDeleteSongModal";
import { useEditSongModal } from "@/hooks/useEditSongModal";
import { useAddLyricsModal } from "@/hooks/useAddLyricsModal";
import { useRouter } from "next/navigation";


interface SongRightClickContentProps {
	isOwner: boolean;
	song: Song
}

const SongRightClickContent: React.FC<SongRightClickContentProps> = ({ isOwner, song }) => {
	const supabaseClient = useSupabaseClient();
	const authModal = useAuthModal();
	const createPlaylistModal = useCreatePlaylistModal();
	const addToPlaylistModal = useAddToPlaylistModal();
	const editSongModal = useEditSongModal();
	const deleteSongModal = useDeleteSong();
	const addLyricsModal = useAddLyricsModal();
	const { user, subscription } = useUser();
	const router = useRouter();

	const [isInPlaylist, setIsInPlaylist] = useState(false);
	const [userHasPlaylist, setUserHasPlaylist] = useState(false);

	useEffect(() => {
		if (!user?.id) {
			return;
		}

		const checkUserPlaylist = async () => {
			const { data, error } = await supabaseClient
				.from("playlists")
				.select("id")
				.eq("user_id", user.id);

			if (error || !data) {
				console.log(error, "data: ", data);
				// toast.error("You need to create a playlist first!");
			}

			if (data) {
				setUserHasPlaylist(true);
			}
		};

		checkUserPlaylist();

		const fetchData = async () => {
			const { data, error } = await supabaseClient
				.from("playlist_songs")
				.select("playlist_id")
				.eq("song_id", song.id)
				.eq("user_id", user.id)

			if (error) {
				console.error("Error fetching playlist song: ", error, "soingId: ", song.id);
			}

			if (!error && data) {
				if (data.length !== 0) {
					setIsInPlaylist(true);
				}
			}
		};

		fetchData();
	}, [song.id, supabaseClient, user?.id]);

	const Icon = isInPlaylist ? MdPlaylistAddCheck : MdPlaylistAdd;

	const handleDownload = async () => {
		const { data, error } = await supabaseClient
			.storage
			.from('songs')
			.download(song.song_path);

		if (error) {
			console.error('Error downloading file:', error);
			return;
		}

		const url = URL.createObjectURL(data);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${song.title}.mp3`;
		document.body.appendChild(a);
		a.click();
		a.remove();
	}

	const handleAddToPlaylist = async () => {
		if (!user) {
			return authModal.onOpen();
		}

		// if (!subscription) {
		// 	return subscribeModal.onOpen();
		// }
		// console.log("userHasPLaylist: ", userHasPLaylist);

		if (!userHasPlaylist) {
			toast.error("You need to create a playlist first!");
			return createPlaylistModal.onOpen();
		}
		// console.log("Opening addToPlaylistModal with song.id: ", song.id);
		addToPlaylistModal.onOpen(song.id);
	}

	const handleDeleteSong = async () => {
		deleteSongModal.onOpen(song.id);
	}

	const handleEditSong = async () => {
		editSongModal.onOpen(song.id);
	}

	const handleAddLyrics = async () => {
		addLyricsModal.onOpen(song.id);
	}

	return (
		<ContextMenu.Portal>
			<ContextMenu.Content
				className="min-w-[220px] overflow-hidden rounded-md p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] bg-neutral-950"
			>
				<ContextMenu.Item  className="group relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[5px] text-[13px] leading-none text-green-600 
				outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-green-500 data-[disabled]:text-mauve8 data-[highlighted]:text-violet1"
					onClick={handleDownload}
					disabled={!subscription}
				>
					<div className="absolute left-0 inline-flex w-[25px] items-center justify-center">
						{!subscription ? (
							<TbDownloadOff />
						) : (
							<TbDownload />
						)}
					</div>
					{!subscription ? (
						<p>Upgrade to pro to Download</p>
					) : (
						<p>
							Download Song
						</p>
					)}
				</ContextMenu.Item>
				<ContextMenu.Item className="group relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[5px] text-[13px] leading-none text-green-600 
				outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-green-500 data-[disabled]:text-mauve8 data-[highlighted]:text-violet1"
					onClick={handleAddToPlaylist}
					disabled={!user}
				>
					<div className="absolute left-0 inline-flex w-[25px] items-center justify-center">
						<Icon />
					</div>
					{!user ? (
						<p>Login to add To Playlist</p>
					) : (
						<p>
							Add To Playlist
						</p>
					)}

				</ContextMenu.Item>

				<ContextMenu.Item className="group relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[5px] text-[13px] leading-none text-green-600 
				outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-green-500 data-[disabled]:text-mauve8 data-[highlighted]:text-violet1"
					onClick={() => router.push(`/lyrics/${song.id}`)}
					disabled={!user}
				>
					<div className="absolute left-0 inline-flex w-[25px] items-center justify-center">
						<TbMicrophone/>
					</div>
				
						<p>
							View lyrics
						</p>

				</ContextMenu.Item>


				{isOwner && (
					<>

						<ContextMenu.Separator className="m-[5px] h-px bg-neutral-700" />

						<ContextMenu.Sub>
							<ContextMenu.SubTrigger className="group relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[5px] text-[13px] leading-none text-green-600 
							utline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-green-500 data-[highlighted]:data-[state=open]:bg-green-500 data-[state=open]:bg-green-300 data-[disabled]:text-mauve8 
							data-[highlighted]:data-[state=open]:text-violet1 data-[highlighted]:text-violet1 data-[state=open]:text-green-600"
							>
								<div className="absolute left-0 inline-flex w-[25px] items-center justify-center">
									<MdOutlineModeEditOutline />
								</div>
								Edit song
								<div className="ml-auto pl-5 text-mauve11 group-data-[disabled]:text-mauve8 group-data-[highlighted]:text-white">
									<HiChevronRight />
								</div>
							</ContextMenu.SubTrigger>
							<ContextMenu.Portal>
								<ContextMenu.SubContent
									className="min-w-[220px] overflow-hidden rounded-md bg-neutral-800 p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]"
									sideOffset={2}
									alignOffset={-5}
								>
									<ContextMenu.Item className="relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[5px] text-[13px] leading-none text-green-600 
									outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-green-500 data-[disabled]:text-mauve8 data-[highlighted]:text-violet1"
										onClick={handleEditSong}
									>
										<div className="absolute left-0 inline-flex w-[25px] items-center justify-center">
											<MdOutlineModeEditOutline />
										</div>
										Edit Song
									</ContextMenu.Item>
									<ContextMenu.Separator className="m-[5px] h-px bg-neutral-700" />
									<ContextMenu.Item className="relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[5px] text-[13px] leading-none text-green-600 o
									utline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-green-500 data-[disabled]:text-mauve8 data-[highlighted]:text-violet1"
										onClick={handleAddLyrics}
									>
										<div className="absolute left-0 inline-flex w-[25px] items-center justify-center">
											<CiTextAlignCenter />
										</div>
										Add lyrics
									</ContextMenu.Item>
								</ContextMenu.SubContent>
							</ContextMenu.Portal>
						</ContextMenu.Sub>

						<ContextMenu.Item
							className="group relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[5px] text-[13px] leading-none text-green-600 
						outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-green-500 data-[disabled]:text-mauve8 data-[highlighted]:text-violet1"
							onClick={handleDeleteSong}
						>
							<div className="absolute left-0 inline-flex w-[25px] items-center justify-center">
								<FaTrashAlt />
							</div>
							Delete Song
						</ContextMenu.Item>
					</>
				)}
			</ContextMenu.Content>
		</ContextMenu.Portal>
	);
};

export default SongRightClickContent;