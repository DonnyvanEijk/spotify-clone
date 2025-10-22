"use client"

import { useEffect, useState } from "react";
import { Song } from "@/types";
import MediaItem from "./media-item";
import { LikeButton } from "./like-button";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import Slider from "./slider";
import usePlayer from "@/hooks/usePlayer";
import useSound from "use-sound";
import toast from "react-hot-toast";
import { getAudioDuration, getAudioDurationInSecconds } from "@/lib/getDuration";
import PlayerSlider from "./player-slider";
import PlaylistButton from "./PlaylistButton";

interface PlayerContentProps {
    song: Song;
    songUrl: string;
}

const PlayerContent: React.FC<PlayerContentProps> = ({ song, songUrl }) => {
    const player = usePlayer();
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState<string | null>(null);
    const [durationInSeconds, setDurationInSeconds] = useState<number | null>(null);
    const [currentTime, setCurrentTime] = useState<string | null>(null);
    const [currentTimeInSeconds, setCurrentTimeInSeconds] = useState<number | null>(null);

    const [volume, setVolume] = useState<number>(() => {
        const cachedVolume = localStorage.getItem("player-volume");
        return cachedVolume ? parseFloat(cachedVolume) : 1;
    });

    const Icon = isPlaying ? BsPauseFill : BsPlayFill;
    const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

    const [play, { pause, sound }] = useSound(songUrl, {
        volume,
        onplay: () => setIsPlaying(true),
        onend: () => {
            setIsPlaying(false);
            onPlayNext();
        },
        onpause: () => setIsPlaying(false),
        format: ["mp3"]
    });

    // Global listener: stop this player if any other audio starts
    useEffect(() => {
        const stopHandler = () => {
            if (isPlaying) pause();
        };
        window.addEventListener("stopAllAudio", stopHandler);
        return () => window.removeEventListener("stopAllAudio", stopHandler);
    }, [isPlaying, pause]);

    const handlePlay = () => {
        if (!isPlaying) {
            // Pause other audio before playing
            window.dispatchEvent(new Event("stopAllAudio"));
            play();
        } else {
            pause();
        }
    };

    const toggleMute = () => setVolume(volume === 0 ? 1 : 0);

    const onPlayNext = () => {
        if (player.ids.length === 0) return;

        if (player.shuffle) {
            const randomIndex = Math.floor(Math.random() * player.ids.length);
            const randomSong = player.ids[randomIndex];
            return player.setId(randomSong);
        }

        const currentIndex = player.ids.findIndex((id) => id === player.activeId);
        const nextSong = player.ids[currentIndex + 1] || player.ids[0];
        player.setId(nextSong);
    };

    const onPlayPrevious = () => {
        if (player.ids.length === 0) return;

        const currentIndex = player.ids.findIndex((id) => id === player.activeId);
        const previousSong = player.ids[currentIndex - 1] || player.ids[player.ids.length - 1];
        player.setId(previousSong);
    };

    useEffect(() => {
        sound?.play();
        return () => sound?.unload();
    }, [sound]);

    useEffect(() => {
        if (sound) sound.volume(volume);
    }, [volume, sound]);

    const handleSeek = (value: number) => {
        sound?.seek(value);
    };

    useEffect(() => {
        if (sound) {
            const interval = setInterval(() => {
                const currentSec = sound.seek();
                const minutes = Math.floor(currentSec / 60);
                const seconds = Math.floor(currentSec % 60);
                setCurrentTime(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
                setCurrentTimeInSeconds(currentSec);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [sound]);

    useEffect(() => {
        getAudioDuration(songUrl, (formattedDuration, error) => {
            if (error) toast.error(error);
            else setDuration(formattedDuration);
        });
        getAudioDurationInSecconds(songUrl, (seconds, error) => {
            if (error) toast.error(error);
            else setDurationInSeconds(seconds);
        });
    }, [songUrl]);

    useEffect(() => {
        const interval = setInterval(() => {
            localStorage.setItem("player-volume", volume.toString());
        }, 5000);
        return () => clearInterval(interval);
    }, [volume]);

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 h-full">
            <div className="flex w-full justify-start">
                <div className="flex items-center gap-x-4 md:w-[220px] lg:w-[400px] 2xl:w-[600px] xl:w-[400px] w-[300px] lg:truncate md:truncate">
                    <MediaItem hideBackground className="border-none bg-transparent mb-2" data={song} reactive={false} isPlayer={true} isOwner={false} />
                </div>
            </div>

            <div className="flex md:hidden coll-auto w-full justify-end items-center">
                <div
                    onClick={handlePlay}
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-white cursor-pointer"
                >
                    <Icon size={30} className="text-black" />
                </div>
            </div>

            <div className="hidden h-full md:flex flex-col justify-center items-center w-full max-w-[722px] gap-x-6">
                <div className="flex items-center gap-x-6">
                    <AiFillStepBackward size={30} className="text-neutral-400 cursor-pointer hover:text-white transition" onClick={onPlayPrevious} />
                    <div
                        onClick={handlePlay}
                        className="flex items-center justify-center h-10 w-10 rounded-full bg-white p-1 cursor-pointer"
                    >
                        <Icon size={30} className="text-black" />
                    </div>
                    <AiFillStepForward size={30} className="text-neutral-400 cursor-pointer hover:text-white transition" onClick={onPlayNext} />
                </div>
                <div className="flex flex-row items-center w-full gap-2">
                    <p className="mt-2 text-center">{currentTime}</p>
                    <PlayerSlider duration={durationInSeconds} currentTime={currentTimeInSeconds} onSeek={handleSeek} />
                    <p className="mt-2 text-center">{duration}</p>
                </div>
            </div>

            <div className="hidden md:flex justify-end pr-2">
                <div className="flex flex-row gap-3 mr-5">
                    <LikeButton songId={song.id} creatorId={song.user_id} />
                    <PlaylistButton songId={song.id} />
                </div>

                <div className="flex items-center gap-x-2 w-[120px]">
                    <VolumeIcon onClick={toggleMute} className="cursor-pointer" size={34} />
                    <Slider value={volume} onChange={(v) => setVolume(v)} />
                </div>
            </div>
        </div>
    );
};

export default PlayerContent;
