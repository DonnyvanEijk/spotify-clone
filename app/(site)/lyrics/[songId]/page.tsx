'use client';

import { use, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { MdFullscreen, MdFullscreenExit } from 'react-icons/md';
import { BsPauseFill, BsPlayFill } from 'react-icons/bs';
import { AiFillStepBackward, AiFillStepForward } from 'react-icons/ai';
import { HiSpeakerWave, HiSpeakerXMark } from 'react-icons/hi2';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import getSongsLyricsById from '@/actions/getSongLyricsById';
import getSongById from '@/actions/getSongById';
import useLoadImage from '@/hooks/useLoadImage';
import { Header } from '@/components/header';
import usePlayer from '@/hooks/usePlayer';
import Slider from '@/components/slider';
import * as RadixSlider from '@radix-ui/react-slider';
import { Song } from '@/types';

interface Props {
    params: Promise<{
        songId: string;
    }>;
}

interface Lyrics {
    id: string;
    lyrics: string;
}

const FADE_MS = 400;

const LyricsPage: React.FC<Props> = ({ params }) => {
    const { songId } = use(params);
    const supabaseClient = useSupabaseClient();
    const activeId = usePlayer((state) => state.activeId);
    const isPlaying = usePlayer((state) => state.isPlaying);
    const volume = usePlayer((state) => state.volume);
    const currentTime = usePlayer((state) => state.currentTime);
    const duration = usePlayer((state) => state.duration);

    // Follow the currently playing song; fall back to the URL song on first load.
    const effectiveSongId = activeId ?? songId;

    const [lyrics, setLyrics] = useState<Lyrics[]>([]);
    const [song, setSong] = useState<Song | null>(null);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [fsShown, setFsShown] = useState(false);
    const firstLoadRef = useRef(true);
    const fsScrollRef = useRef<HTMLDivElement>(null);
    const pageRef = useRef<HTMLDivElement>(null);
    const lastVolumeRef = useRef(1);

    const imageUrl = useLoadImage(song);
    const isNowPlaying = activeId === effectiveSongId && !!activeId;

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!firstLoadRef.current) {
                setVisible(false);
                await new Promise((resolve) => setTimeout(resolve, FADE_MS));
                if (cancelled) return;
            }

            const [lyricsData, songData] = await Promise.all([
                getSongsLyricsById(supabaseClient, effectiveSongId),
                getSongById(supabaseClient, effectiveSongId),
            ]);
            if (cancelled) return;

            if (!(lyricsData instanceof Error)) {
                //@ts-expect-error Its working so dont touch hehehe
                setLyrics(lyricsData);
            } else {
                setLyrics([]);
            }

            if (!(songData instanceof Error) && songData.length > 0) {
                setSong(songData[0]);
            } else {
                setSong(null);
            }

            setLoading(false);
            firstLoadRef.current = false;

            requestAnimationFrame(() => {
                if (cancelled) return;
                setVisible(true);
                pageRef.current?.closest('main')?.scrollTo({ top: 0 });
                window.scrollTo({ top: 0 });
                fsScrollRef.current?.scrollTo({ top: 0 });
            });
        };

        load();

        if (typeof window !== 'undefined' && effectiveSongId !== songId) {
            window.history.replaceState(null, '', `/lyrics/${effectiveSongId}`);
        }

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supabaseClient, effectiveSongId]);

    const enterFullscreen = () => {
        setFullscreen(true);
        const el = document.documentElement;
        if (el.requestFullscreen) {
            el.requestFullscreen().catch(() => {
            });
        }
    };

    const exitFullscreen = () => {
        setFullscreen(false);
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        }
    };

    useEffect(() => {
        if (!fullscreen) {
            setFsShown(false);
            return;
        }

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') exitFullscreen();
        };
        const onFullscreenChange = () => {
            if (!document.fullscreenElement) setFullscreen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        document.addEventListener('fullscreenchange', onFullscreenChange);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const raf = requestAnimationFrame(() => setFsShown(true));

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('fullscreenchange', onFullscreenChange);
            document.body.style.overflow = previousOverflow;
            cancelAnimationFrame(raf);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fullscreen]);

    const renderLyricLines = (sizeClass: string) =>
        lyrics.map((data) =>
            data.lyrics.split('\n').map((line, index) => (
                <p
                    className={`${sizeClass} font-bold leading-snug wrap-break-words transition-colors ${
                        line.trim()
                            ? 'bg-linear-to-b from-white to-purple-200/80 bg-clip-text text-transparent hover:from-white hover:to-purple-100'
                            : ''
                    }`}
                    key={`${data.id}-${index}`}
                >
                    {line || ' '}
                </p>
            ))
        );

    const fmtTime = (seconds: number) => {
        const s = Math.max(0, Math.floor(seconds || 0));
        const m = Math.floor(s / 60);
        const r = s % 60;
        return `${m}:${r < 10 ? '0' : ''}${r}`;
    };

    const handleSeek = (value: number) => {
        usePlayer.getState().setCurrentTime(value);
        window.dispatchEvent(new CustomEvent('playerSeek', { detail: value }));
    };

    const handleVolumeChange = (value: number) => {
        if (value > 0) lastVolumeRef.current = value;
        window.dispatchEvent(new CustomEvent('playerSetVolume', { detail: value }));
    };

    const toggleMute = () => {
        if (volume > 0) {
            lastVolumeRef.current = volume;
            handleVolumeChange(0);
        } else {
            handleVolumeChange(lastVolumeRef.current || 1);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[80vh] text-purple-200/80 animate-pulse">
                Loading...
            </div>
        );
    }

    const hasLyrics = Array.isArray(lyrics) && lyrics.length > 0;

    return (
        <div ref={pageRef} className="relative flex flex-col w-full p-6 gap-6 mb-20">
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-105 w-[min(90%,720px)] rounded-full bg-purple-600/25 blur-[120px]" />

            <Header className="relative bg-white/10 backdrop-blur-[18px] rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] ring-1 ring-white/15 overflow-hidden">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/50 to-transparent" />
                <div className="flex items-center justify-between gap-4">
                    <h2 className="font-semibold text-3xl bg-linear-to-b from-white to-purple-300 bg-clip-text text-transparent">
                        Lyrics
                    </h2>
                    <button
                        onClick={enterFullscreen}
                        aria-label="Enter fullscreen"
                        title="Fullscreen"
                        className="group hidden lg:inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-purple-100 backdrop-blur-md ring-1 ring-inset ring-white/10 transition hover:bg-white/20 hover:text-white"
                    >
                        <MdFullscreen size={22} className="transition-transform group-hover:scale-110" />
                        <span className="hidden sm:inline">Fullscreen</span>
                    </button>
                </div>
            </Header>

            <div
                className={`relative flex flex-col gap-6 transition-all duration-400 ease-out ${
                    visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`}
            >
                {song && (
                    <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-linear-to-br from-white/15 via-white/5 to-transparent backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/15 to-transparent" />
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/60 to-transparent" />

                        <div className="relative flex flex-col sm:flex-row items-center gap-6 p-6">
                            <div className="relative shrink-0">
                                {imageUrl && (
                                    <div
                                        className="absolute -inset-3 rounded-3xl opacity-60 blur-2xl"
                                        style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                    />
                                )}
                                <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden ring-1 ring-white/25 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)]">
                                    {imageUrl ? (
                                        <Image
                                            fill
                                            sizes="144px"
                                            src={imageUrl}
                                            alt={song.title}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-white/10" />
                                    )}
                                    <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-transparent via-white/10 to-white/25" />
                                </div>
                            </div>

                            <div className="flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
                                {isNowPlaying && (
                                    <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-100 ring-1 ring-inset ring-purple-400/40">
                                        <span className="relative flex h-2 w-2">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-300 opacity-75" />
                                            <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-300" />
                                        </span>
                                        Now playing
                                    </span>
                                )}
                                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-linear-to-b from-white via-white to-purple-200 bg-clip-text text-transparent drop-shadow-sm">
                                    {song.title}
                                </h1>
                                {song.author && (
                                    <p className="text-lg font-medium text-purple-200/80">{song.author}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {hasLyrics ? (
                    <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-linear-to-b from-white/10 to-white/3 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/50 to-transparent" />
                        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/5 to-transparent" />
                        <div className="relative flex flex-col gap-4 p-8">
                            {renderLyricLines('text-[2rem]')}
                        </div>
                    </div>
                ) : (
                    <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-linear-to-b from-white/10 to-white/3 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] flex justify-center items-center h-[40vh]">
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/50 to-transparent" />
                        <p className="text-center font-semibold text-[1.5rem] text-purple-200/80">
                            This song has no lyrics.
                        </p>
                    </div>
                )}
            </div>

            {fullscreen && (
                <div
                    className={`fixed inset-0 z-70 flex bg-black/80 backdrop-blur-3xl transition-opacity duration-300 ${
                        fsShown ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    {imageUrl && (
                        <div
                            className="pointer-events-none absolute inset-0 opacity-40 blur-[140px] scale-125"
                            style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/40 via-black/20 to-black/70" />

                    <button
                        onClick={exitFullscreen}
                        aria-label="Exit fullscreen"
                        title="Exit fullscreen (Esc)"
                        className="group absolute top-6 right-6 z-10 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-purple-100 backdrop-blur-md ring-1 ring-inset ring-white/10 transition hover:bg-white/20 hover:text-white"
                    >
                        <MdFullscreenExit size={22} className="transition-transform group-hover:scale-110" />
                        <span>Exit</span>
                    </button>

                    <div className="relative flex w-full max-w-md shrink-0 flex-col items-center justify-center gap-8 p-10">
                        <div
                            className={`flex flex-col items-center gap-8 transition-all duration-400 ease-out ${
                                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                            }`}
                        >
                            <div className="relative">
                                {imageUrl && (
                                    <div
                                        className="absolute -inset-4 rounded-4xl opacity-60 blur-3xl"
                                        style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                    />
                                )}
                                <div className="relative aspect-square w-64 overflow-hidden rounded-3xl ring-1 ring-white/25 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)]">
                                    {imageUrl ? (
                                        <Image fill sizes="256px" src={imageUrl} alt={song?.title ?? 'Artwork'} className="object-cover" />
                                    ) : (
                                        <div className="h-full w-full bg-white/10" />
                                    )}
                                    <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-transparent via-white/10 to-white/25" />
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-2 text-center">
                                {isNowPlaying && (
                                    <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-100 ring-1 ring-inset ring-purple-400/40">
                                        <span className="relative flex h-2 w-2">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-300 opacity-75" />
                                            <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-300" />
                                        </span>
                                        Now playing
                                    </span>
                                )}
                                <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-b from-white to-purple-200 bg-clip-text text-transparent">
                                    {song?.title ?? 'Lyrics'}
                                </h1>
                                {song?.author && (
                                    <p className="text-lg font-medium text-purple-200/80">{song.author}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex w-full items-center gap-3">
                            <span className="w-10 shrink-0 text-right text-xs tabular-nums text-purple-200/70">
                                {fmtTime(currentTime)}
                            </span>
                            <RadixSlider.Root
                                className="relative flex grow items-center select-none touch-none h-10"
                                value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
                                onValueChange={(value) => handleSeek((value[0] / 100) * (duration || 0))}
                                max={100}
                                step={0.1}
                                aria-label="Seek"
                            >
                                <RadixSlider.Track className="bg-neutral-600 relative grow rounded-full h-0.75">
                                    <RadixSlider.Range className="absolute bg-white rounded-full h-full" />
                                </RadixSlider.Track>
                                <RadixSlider.Thumb className="block h-3 w-3 rounded-full bg-white shadow transition hover:scale-110 focus:outline-none" />
                            </RadixSlider.Root>
                            <span className="w-10 shrink-0 text-xs tabular-nums text-purple-200/70">
                                {fmtTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-8">
                            <button
                                onClick={() => window.dispatchEvent(new Event('playerPrevious'))}
                                aria-label="Previous"
                                className="text-neutral-300 transition hover:scale-110 hover:text-white"
                            >
                                <AiFillStepBackward size={34} />
                            </button>
                            <button
                                onClick={() => window.dispatchEvent(new Event('playerTogglePlay'))}
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                                className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black shadow-lg transition hover:scale-105"
                            >
                                {isPlaying ? <BsPauseFill size={34} /> : <BsPlayFill size={34} className="translate-x-0.5" />}
                            </button>
                            <button
                                onClick={() => window.dispatchEvent(new Event('playerNext'))}
                                aria-label="Next"
                                className="text-neutral-300 transition hover:scale-110 hover:text-white"
                            >
                                <AiFillStepForward size={34} />
                            </button>
                        </div>

                        <div className="flex w-full max-w-[16rem] items-center gap-3">
                            <button
                                onClick={toggleMute}
                                aria-label={volume === 0 ? 'Unmute' : 'Mute'}
                                className="shrink-0 text-neutral-300 transition hover:text-white"
                            >
                                {volume === 0 ? <HiSpeakerXMark size={22} /> : <HiSpeakerWave size={22} />}
                            </button>
                            <Slider value={volume} onChange={handleVolumeChange} />
                        </div>
                    </div>

                    <div ref={fsScrollRef} className="relative flex-1 overflow-y-auto px-8 lg:px-14 py-20">
                        <div
                            className={`min-h-full transition-all duration-400 ease-out ${
                                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                            }`}
                        >
                            {hasLyrics ? (
                                <div className="flex max-w-3xl flex-col gap-5 lg:gap-6">
                                    {renderLyricLines('text-4xl lg:text-5xl xl:text-6xl')}
                                </div>
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <p className="text-center font-semibold text-2xl text-purple-200/80">
                                        This song has no lyrics.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LyricsPage;
