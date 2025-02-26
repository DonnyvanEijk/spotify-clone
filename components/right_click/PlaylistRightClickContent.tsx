import React from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { HiChevronRight } from "react-icons/hi";
import { FaTrashAlt } from "react-icons/fa";
import { RiPlayListFill } from "react-icons/ri";
import { MdOutlineModeEditOutline, MdPlaylistAdd } from "react-icons/md";
import { Playlist } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useUser } from "@/hooks/useUser";
import { TbDownload, TbDownloadOff } from "react-icons/tb";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useSubscribeModal } from "@/hooks/useSubscribeModal";
import { useDeletePlaylist } from "@/hooks/useDeletePlaylistModal";
import { useEditPlaylistModal } from "@/hooks/useEditPlaylistModal";
import { useBatchAddToPlaylistModal } from "@/hooks/useBatchAddToPlaylistModal";
import { useClonePlaylistModal } from "@/hooks/useClonePlaylistModal";
import toast from "react-hot-toast";
import JSZip from "jszip";

interface PlaylistRightClickContentProps {
	isOwner: boolean;
	playlist: Playlist
}

const PlaylistRightClickContent: React.FC<PlaylistRightClickContentProps> = ({ isOwner, playlist }) => {
	const supabaseClient = useSupabaseClient();
	const authModal = useAuthModal();
	const subscribeModal = useSubscribeModal();
	const editPlaylistModal = useEditPlaylistModal();
	const deletePlaylistModal = useDeletePlaylist();
	const batchAddToPlaylistModal = useBatchAddToPlaylistModal();
	const clonePlaylistModal = useClonePlaylistModal();
	const { user, subscription } = useUser();

	const handleDownload = async () => {
		const { data: PsData, error: PsError } = await supabaseClient
			.from('playlist_songs')
			.select('song_id')
			.eq('playlist_id', playlist.id);

		if (PsError) {
			console.error('Error fetching playlist songs:', PsError);
			toast.error('Error fetching playlist songs');
			return;
		}

		const songIds = PsData.map((song) => song.song_id);

		const { data: SData, error: SError } = await supabaseClient
			.from('songs')
			.select('*')
			.in('id', songIds);

		if (SError) {
			console.error('Error fetching songs:', SError);
			toast.error('Error fetching songs');
			return;
		}

		const songs = SData.map((song) => song);

		const zip = new JSZip();
		const folder = zip.folder(playlist.name);

		if (playlist.image_path) {
			const { data: imageData, error: imageError } = await supabaseClient.storage.from('images').download(playlist.image_path);

			if (imageError) {
				console.error('Error downloading playlist image:', imageError);
				toast.error('Error downloading playlist image');
				return;
			}

			if (folder) {
				folder.file(`${playlist.name}.png`, imageData);
			} else {
				console.error('Folder is null');
				toast.error('Folder is not available');
				return;
			}
		}

		for (const song of songs) {
			const { data, error } = await supabaseClient.storage.from('songs').download(song.song_path);

			if (error) {
				console.error('Error downloading file:', error);
				toast.error('Error downloading file');
				return;
			}

			if (folder) {
				folder.file(`${song.title}.mp3`, data);
			} else {
				console.error('Folder is null');
				toast.error('Folder is not available');
				return;
			}
		}

		const content = await zip.generateAsync({ type: "blob" });
		const url = URL.createObjectURL(content);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${playlist.name}.zip`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		toast.success('Playlist downloaded successfully');
	}

	const handleClonePlaylist = async () => {
		if (!user) {
			authModal.onOpen();
			return;
		}

		if (!subscription) {
			subscribeModal.onOpen();
			return;
		}

		const { data, error } = await supabaseClient
			.from('playlist_songs')
			.select('song_id')
			.eq('playlist_id', playlist.id);

		if (error) {
			console.error('Error fetching playlist songs:', error);
			return;
		}

		const songIds = data.map((song) => song.song_id);

		clonePlaylistModal.onOpen(songIds, playlist.id);
	}

	const handleBatchAddToPlaylist = async () => {
		const { data, error } = await supabaseClient
			.from('playlist_songs')
			.select('song_id')
			.eq('playlist_id', playlist.id);

		if (error) {
			console.error('Error fetching playlist songs:', error);
			return;
		}

		const songIds = data.map((song) => song.song_id);

		batchAddToPlaylistModal.onOpen(songIds, playlist.id);
	}

	const handleDeletePlaylist = async () => {
		deletePlaylistModal.onOpen(playlist.id);
	}

	const handleEditPlaylist = async () => {
		editPlaylistModal.onOpen(playlist.id);
	}

	return (
		<ContextMenu.Portal>
			<ContextMenu.Content
				className="min-w-[220px] overflow-hidden rounded-md p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] bg-neutral-950"
			>
				<ContextMenu.Item className="group relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[5px] text-[13px] leading-none text-purple-600 
				outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-purple-500 data-[disabled]:text-mauve8 data-[highlighted]:text-violet1"
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
							Download Playlist
						</p>
					)}
				</ContextMenu.Item>
				<ContextMenu.Item className="group relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[5px] text-[13px] leading-none text-purple-600 
				outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-purple-500 data-[disabled]:text-mauve8 data-[highlighted]:text-violet1"
					onClick={handleBatchAddToPlaylist}
					disabled={!user}
				>
					<div className="absolute left-0 inline-flex w-[25px] items-center justify-center">
						<MdPlaylistAdd />
					</div>
					{!user ? (
						<p>Login to add to other Playlist</p>
					) : (
						<p>
							Add to other Playlist
						</p>
					)}

				</ContextMenu.Item>
				<ContextMenu.Item className="group relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[5px] text-[13px] leading-none text-purple-600 
				outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-purple-500 data-[disabled]:text-mauve8 data-[highlighted]:text-violet1"
					onClick={handleClonePlaylist}
					disabled={!subscription}
				>
					<div className="absolute left-0 inline-flex w-[25px] items-center justify-center">
						<RiPlayListFill />
					</div>
					{!subscription ? (
						<p>Upgrade to pro to clone Playlist</p>
					) : (
						<p>
							Clone Playlist
						</p>
					)}

				</ContextMenu.Item>


				{isOwner && (
					<>

						<ContextMenu.Separator className="m-[5px] h-px bg-neutral-700" />

						<ContextMenu.Sub>
							<ContextMenu.SubTrigger className="group relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[5px] text-[13px] leading-none text-purple-600 
							utline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-purple-500 data-[highlighted]:data-[state=open]:bg-purple-500 data-[state=open]:bg-purple-300 data-[disabled]:text-mauve8 
							data-[highlighted]:data-[state=open]:text-violet1 data-[highlighted]:text-violet1 data-[state=open]:text-purple-600"
							>
								<div className="absolute left-0 inline-flex w-[25px] items-center justify-center">
									<MdOutlineModeEditOutline />
								</div>
								Edit playlist
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
									<ContextMenu.Item className="relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[5px] text-[13px] leading-none text-purple-600 
									outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-purple-500 data-[disabled]:text-mauve8 data-[highlighted]:text-violet1"
										onClick={handleEditPlaylist}
									>
										<div className="absolute left-0 inline-flex w-[25px] items-center justify-center">
											<MdOutlineModeEditOutline />
										</div>
										Edit Playlist
									</ContextMenu.Item>
								
								</ContextMenu.SubContent>
							</ContextMenu.Portal>
						</ContextMenu.Sub>

						<ContextMenu.Item
							className="group relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[5px] text-[13px] leading-none text-purple-600 
						outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-purple-500 data-[disabled]:text-mauve8 data-[highlighted]:text-violet1"
							onClick={handleDeletePlaylist}
						>
							<div className="absolute left-0 inline-flex w-[25px] items-center justify-center">
								<FaTrashAlt />
							</div>
							Delete Playlist
						</ContextMenu.Item>
					</>
				)}
			</ContextMenu.Content>
		</ContextMenu.Portal>
	);
};

export default PlaylistRightClickContent;