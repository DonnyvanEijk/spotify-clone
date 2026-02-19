"use client"

import { useEffect, useRef, useState } from "react";
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
import { MdAudiotrack, MdClose, MdLoop } from "react-icons/md";
import AudioVisualizer from "./Visualizer";

interface PlayerContentProps {
    song: Song;
    songUrl: string;
}

const PlayerContent: React.FC<PlayerContentProps> = ({ song, songUrl }) => {
    const player = usePlayer();

    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [duration, setDuration] = useState<string | null>(null);
    const [durationInSeconds, setDurationInSeconds] = useState<number | null>(null);
    const [currentTime, setCurrentTime] = useState<string | null>(null);
    const [currentTimeInSeconds, setCurrentTimeInSeconds] = useState<number | null>(null);
    const [showVisualizer, setShowVisualizer] = useState(false);

    const cachedVolume = localStorage.getItem("player-volume");
    const initialVolume = cachedVolume ? parseFloat(cachedVolume) : 1;

    const [volume, setVolume] = useState<number>(initialVolume);
    const [lastVolume, setLastVolume] = useState<number>(initialVolume);
    const showVisualizerRef = useRef(showVisualizer);


    const isLooping = player.loop;
    const toggleLoop = player.toggleLoop;

    const Icon = isPlaying ? BsPauseFill : BsPlayFill;
    const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

    const [play, { pause, sound }] = useSound(songUrl, {
        volume,
        onload: () => setIsLoading(false),
        onplay: () => setIsPlaying(true),
        onpause: () => setIsPlaying(false),
        format: ["mp3"]
    });

    const handleVisualizerToggle = () => {
  setShowVisualizer(prev => {
    showVisualizerRef.current = !prev; 
    return !prev;
  });
};

    const handleSongEnd = () => {
        if (isLooping) {
            sound?.seek(0);
            play();
        } else {
            onPlayNext();
        }
    };
    //@ts-expect-error This works and errors beecause it wants me to return
    useEffect(() => {
        if (!sound) return;
        sound.on("end", handleSongEnd);
        return () => sound.off("end", handleSongEnd);
    }, [sound, isLooping]);

    useEffect(() => {
        const stopHandler = () => {
            if (isPlaying) pause();
        };
        window.addEventListener("stopAllAudio", stopHandler);
        return () => window.removeEventListener("stopAllAudio", stopHandler);
    }, [isPlaying, pause]);

    const handlePlay = () => {
        if (isLoading) return;
        if (!isPlaying) {
            window.dispatchEvent(new Event("stopAllAudio"));
            play();
        } else {
            pause();
        }
    };

    const toggleMute = () => {
        if (volume === 0) {
            setVolume(lastVolume);
        } else {
            setLastVolume(volume);
            setVolume(0);
        }
    };

    const onPlayNext = () => {
        if (player.ids.length === 0) return;
        if (isLooping) {
            pause();
            sound?.seek(0);
            play();
            return;
        }
        if (player.shuffle) {
            const randomIndex = Math.floor(Math.random() * player.ids.length);
            player.setId(player.ids[randomIndex]);
            return;
        }
        const currentIndex = player.ids.findIndex((id) => id === player.activeId);
        const nextSong = player.ids[currentIndex + 1] || player.ids[0];
        player.setId(nextSong);
    };

    const onPlayPrevious = () => {
        if (player.ids.length === 0) return;
        if (isLooping) {
            pause();
            sound?.seek(0);
            play();
            return;
        }
        const currentIndex = player.ids.findIndex((id) => id === player.activeId);
        const previousSong = player.ids[currentIndex - 1] || player.ids[player.ids.length - 1];
        player.setId(previousSong);
    };

    //@ts-expect-error works but expects void?
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
        let raf: number;
        const update = () => {
            if (sound) {
                const currentSec = sound.seek();
                setCurrentTimeInSeconds(currentSec);
                const minutes = Math.floor(currentSec / 60);
                const seconds = Math.floor(currentSec % 60);
                setCurrentTime(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
                raf = requestAnimationFrame(update);
            }
        };
        if (isPlaying) raf = requestAnimationFrame(update);
        return () => cancelAnimationFrame(raf);
    }, [isPlaying, sound]);

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

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isTyping =
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable;
            if (isTyping) return;
            if (e.code === "Space") {
                e.preventDefault();
                handlePlay();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handlePlay, isLoading, isPlaying]);

    return (
        <div className="relative w-full">
            <div className="grid grid-cols-2 md:grid-cols-3 h-full">
                <div className="flex w-full justify-start">
                    <div className="flex items-center gap-x-4 md:w-[220px] lg:w-[400px] 2xl:w-[600px] xl:w-[400px] w-[300px] lg:truncate md:truncate">
                        <MediaItem hideBackground className="border-none bg-transparent mb-2" data={song} reactive={false} isPlayer={true} isOwner={false} />
                    </div>
                </div>

                <div className="flex md:hidden coll-auto w-full justify-end items-center">
                    <div onClick={handlePlay} className="h-10 w-10 flex items-center justify-center rounded-full bg-white cursor-pointer">
                        {isLoading ? (
                            <div className="loader w-5 h-5 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
                        ) : (
                            <Icon size={30} className="text-black" />
                        )}
                    </div>
                </div>

                <div className="hidden h-full md:flex flex-col justify-center items-center w-full max-w-[722px] gap-x-6">
                    <div className="flex items-center gap-x-6">
                        <AiFillStepBackward size={30} className="text-neutral-400 cursor-pointer hover:text-white transition" onClick={onPlayPrevious} />
                        <div onClick={handlePlay} className="flex items-center justify-center h-10 w-10 rounded-full bg-white p-1 cursor-pointer">
                            {isLoading ? (
                                <div className="loader w-5 h-5 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
                            ) : (
                                <Icon size={30} className="text-black" />
                            )}
                        </div>
                        <AiFillStepForward size={30} className="text-neutral-400 cursor-pointer hover:text-white transition" onClick={onPlayNext} />
                        <button onClick={toggleLoop} className={`p-2 rounded-full transition ${isLooping ? "bg-white text-black" : "bg-gray-700 text-gray-300"}`}>
                            <MdLoop />
                        </button>
                        {
                          !showVisualizer && (
                          <button onClick={() => setShowVisualizer(true)} className="p-2 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition">
                            <MdAudiotrack />
                        </button>
                          )

                        }
                       
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

{showVisualizer && (
  <div className="fixed inset-0 z-50 flex items-center justify-end px-4 pointer-events-none">
    <div className="relative  bg-neutral-900 lg:mr-[16vw] 2xl:mr-[10vw] rounded-xl p-4 w-[100px] sm:hidden lg:block lg:w-[200px] 2xl:w-[550px] flex flex-col items-center pointer-events-auto">
      <button
        onClick={handleVisualizerToggle}
        className="absolute top-2 right-2 text-white text-xl"
      >
        <MdClose />
      </button>
      <AudioVisualizer isPlaying={isPlaying} height={50} />
    </div>
  </div>
)}



        </div>
    );
};

export default PlayerContent;
