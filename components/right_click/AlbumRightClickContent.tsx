import React from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { HiChevronRight } from "react-icons/hi";
import { FaTrashAlt } from "react-icons/fa";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useUser } from "@/hooks/useUser";
import { TbDownload, TbDownloadOff } from "react-icons/tb";
import toast from "react-hot-toast";
import JSZip from "jszip";
import { useEditAlbumModal } from "@/hooks/useEditAlbumModal";
import { useDeleteAlbumModal } from "@/hooks/useDeleteAlbumModal";
import { Album } from "@/types";

interface AlbumRightClickContentProps {
	isOwner: boolean;
	album: Album
}

const AlbumRightClickContent: React.FC<AlbumRightClickContentProps> = ({ isOwner, album }) => {
	const supabaseClient = useSupabaseClient();
	const editAlbumModal = useEditAlbumModal();
	const deleteAlbumModal = useDeleteAlbumModal();
	const { subscription } = useUser();

	const handleDownload = async () => {
		const { data: SData, error: SError } = await supabaseClient
			.from('songs')
			.select('*')
			.eq('album_id', album.id);

		if (SError) {
			console.error('Error fetching songs:', SError);
			toast.error('Error fetching songs');
			return;
		}

		const songs = SData.map((song) => song);

		const zip = new JSZip();
		const folder = zip.folder(album.name);

		if (album.image_path) {
			const { data: imageData, error: imageError } = await supabaseClient.storage.from('images').download(album.image_path);

			if (imageError) {
				console.error('Error downloading album image:', imageError);
				toast.error('Error downloading album image');
				return;
			}

			if (folder) {
				folder.file(`${album.name}.png`, imageData);
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
		a.download = `${album.name}.zip`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		toast.success('Album downloaded successfully');
	}

	const handleDeleteAlbum = async () => {
		deleteAlbumModal.onOpen(album.id);
	}

	const handleEditAlbum = async () => {
		editAlbumModal.onOpen(album.id);
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
							Download Album
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
								Edit album
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
										onClick={handleEditAlbum}
									>
										<div className="absolute left-0 inline-flex w-[25px] items-center justify-center">
											<MdOutlineModeEditOutline />
										</div>
										Edit Album
									</ContextMenu.Item>
									{/* <ContextMenu.Separator className="m-[5px] h-px bg-neutral-700" />
									<ContextMenu.Item className="relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[5px] text-[13px] leading-none text-purple-600 o
									utline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-purple-500 data-[disabled]:text-mauve8 data-[highlighted]:text-violet1"
										onClick={handleAddLyrics}
									>
										<div className="absolute left-0 inline-flex w-[25px] items-center justify-center">
											<CiTextAlignCenter />
										</div>
										Add lyrics
									</ContextMenu.Item> */}
								</ContextMenu.SubContent>
							</ContextMenu.Portal>
						</ContextMenu.Sub>

						<ContextMenu.Item
							className="group relative flex h-[25px] select-none items-center rounded-[3px] pl-[25px] pr-[5px] text-[13px] leading-none text-purple-600 
						outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-purple-500 data-[disabled]:text-mauve8 data-[highlighted]:text-violet1"
							onClick={handleDeleteAlbum}
						>
							<div className="absolute left-0 inline-flex w-[25px] items-center justify-center">
								<FaTrashAlt />
							</div>
							Delete Album
						</ContextMenu.Item>
					</>
				)}
			</ContextMenu.Content>
		</ContextMenu.Portal>
	);
};

export default AlbumRightClickContent;