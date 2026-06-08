"use client";

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { useRouter } from 'next/navigation';
import { HiOutlinePencil, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import { PresenceBadge } from '@/components/PresenceBadge';
import { useSessionContext } from '@/hooks/useSessionContext';
import useCustomStatus from '@/hooks/useCustomStatus';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import usePlayer from '@/hooks/usePlayer';

interface UserFormData {
    avatar_url: string;
    username: string;
    bio: string;
}

interface UserContentProps {
    avatar_url: string | null;
    username: string | null;
    bio: string | null;
    id: string;
    presence?: string;
}

export const UserContent: React.FC<UserContentProps> = ({ avatar_url, username, bio, id, presence: initialPresence = 'offline' }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UserFormData>({
        avatar_url: avatar_url || '',
        username: username || '',
        bio: bio || '',
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [livePresence, setLivePresence] = useState(initialPresence);

    // Custom status state
    const { customStatus, setCustomStatus, clearCustomStatus } = useCustomStatus();
    const [statusOpen, setStatusOpen] = useState(false);
    const [emojiInput, setEmojiInput] = useState('');
    const [textInput, setTextInput] = useState('');
    const [isSavingStatus, setIsSavingStatus] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    const supabaseClient = useSupabaseClient();
    const { supabaseClient: realtimeClient } = useSessionContext();
    const player = usePlayer();
    const router = useRouter();

    // Close emoji picker on outside click
    useEffect(() => {
        if (!pickerOpen) return;
        const handler = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setPickerOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [pickerOpen]);

    // Seed inputs from stored custom status when opening
    useEffect(() => {
        if (statusOpen && customStatus) {
            const spaceIdx = customStatus.indexOf(' ');
            if (spaceIdx === -1) {
                setEmojiInput(customStatus);
                setTextInput('');
            } else {
                setEmojiInput(customStatus.slice(0, spaceIdx));
                setTextInput(customStatus.slice(spaceIdx + 1));
            }
        }
    }, [statusOpen]);

    // Subscribe to own presence changes in realtime
    useEffect(() => {
        const channel = realtimeClient
            .channel(`account-presence-${id}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${id}` },
                (payload: { new: { presence?: string } }) => {
                    if (payload.new.presence !== undefined) {
                        setLivePresence(payload.new.presence);
                    }
                }
            )
            .subscribe();

        return () => { realtimeClient.removeChannel(channel); };
    }, [id, realtimeClient]);

    const getPublicUrl = (path: string) =>
        supabaseClient.storage.from('images').getPublicUrl(path).data.publicUrl;

    const displayAvatar = avatar_url ? getPublicUrl(avatar_url) : null;
    const previewAvatar = formData.avatar_url.startsWith('blob:')
        ? formData.avatar_url
        : formData.avatar_url ? getPublicUrl(formData.avatar_url) : null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setAvatarFile(file);
            setFormData(prev => ({ ...prev, avatar_url: URL.createObjectURL(file) }));
        }
    };

    const sanitizeFileName = (name: string) => name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    const handleSave = async () => {
        setIsSaving(true);
        try {
            let uploadedImagePath: string = formData.avatar_url;
            if (avatarFile) {
                if (avatar_url && !avatar_url.startsWith('blob:')) {
                    await supabaseClient.storage.from('images').remove([avatar_url]);
                }
                const sanitizedFileName = sanitizeFileName(avatarFile.name);
                const uniqueID = `${id}-${Date.now()}`;
                const { data, error: uploadError } = await supabaseClient.storage
                    .from('images')
                    .upload(`avatars/${sanitizedFileName}-${uniqueID}`, avatarFile, {
                        cacheControl: '3600',
                        upsert: false
                    });
                if (uploadError) throw uploadError;
                uploadedImagePath = data?.path || '';
            }

            const { error } = await supabaseClient
                .from('users')
                .update({
                    avatar_url: uploadedImagePath,
                    username: formData.username,
                    bio: formData.bio
                } as any)
                .eq('id', id);

            if (error) throw error;
            toast.success('Profile updated');
            setIsEditing(false);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({ avatar_url: avatar_url || '', username: username || '', bio: bio || '' });
        setAvatarFile(null);
        setIsEditing(false);
    };


    const handleSaveStatus = async () => {
        if (!emojiInput.trim()) {
            toast.error('Add an emoji first');
            return;
        }
        setIsSavingStatus(true);
        try {
            const statusValue = textInput.trim()
                ? `${emojiInput} ${textInput.trim()}`
                : emojiInput;
            setCustomStatus(statusValue);
            // Also write to DB so others see it right away (usePresence will sync it too, but let's be instant)
            await supabaseClient
                .from('users')
                .update({ presence: `custom:${statusValue}` } as any)
                .eq('id', id);
            toast.success('Status set');
            setStatusOpen(false);
        } catch (e: any) {
            toast.error(e.message || 'Failed to set status');
        } finally {
            setIsSavingStatus(false);
        }
    };

    const handleClearStatus = () => {
        clearCustomStatus();
        setEmojiInput('');
        setTextInput('');
        setStatusOpen(false);
        // usePresence re-evaluates via its customStatus effect and writes
        // the correct state (listening:... if a song is playing, else online)
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
            {isEditing ? (
                <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 rounded-full overflow-hidden bg-white/10">
                                {previewAvatar && (
                                    <img src={previewAvatar} alt="avatar" className="w-full h-full object-cover" />
                                )}
                            </div>
                            <label className="absolute -bottom-1 -right-1 cursor-pointer bg-white text-black rounded-full p-1">
                                <HiOutlinePencil size={12} />
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium text-white">Profile photo</p>
                            <p className="text-xs text-neutral-400">Click the pencil to change</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Username</label>
                        <Input type="text" name="username" value={formData.username} onChange={handleInputChange} placeholder="Username" />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder="Tell people about yourself"
                            rows={3}
                            className="w-full bg-neutral-700/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 resize-none focus:outline-none focus:border-white/30 transition-colors"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 flex-1 sm:flex-none justify-center">
                            <HiOutlineCheck size={14} />
                            {isSaving ? 'Saving…' : 'Save changes'}
                        </Button>
                        <button
                            onClick={handleCancel}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex-1 sm:flex-none"
                        >
                            <HiOutlineX size={14} />
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Profile row */}
                    <div className="flex items-start gap-4">
                        <div className="relative shrink-0">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-white/10">
                                {displayAvatar && (
                                    <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
                                )}
                            </div>
                            <span className="absolute bottom-0.5 right-0.5 p-0.5 bg-neutral-900 rounded-full">
                                <PresenceBadge presence={livePresence} showText={false} />
                            </span>
                        </div>
                        <div className="flex flex-col gap-1 min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-base sm:text-lg font-semibold text-white truncate">{username || 'No username'}</p>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                                >
                                    <HiOutlinePencil size={13} />
                                    <span className="hidden sm:inline">Edit</span>
                                </button>
                            </div>
                            <PresenceBadge
                                presence={livePresence}
                                showText={true}
                                truncate={true}
                                onPlay={(songId) => {
                                    if (player.activeId === songId) {
                                        window.dispatchEvent(new Event("restartCurrentSong"));
                                    } else {
                                        player.insertAfterCurrent(songId);
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Bio — full width below avatar row */}
                    <p className="text-sm text-neutral-400 line-clamp-3">{bio || 'No bio yet'}</p>

                    {/* Custom status row */}
                    <div className="border-t border-white/5 pt-3">
                        {!statusOpen ? (
                            <div className="flex items-center gap-3">
                                {customStatus ? (
                                    <>
                                        <span className="text-sm text-neutral-300 flex-1">{customStatus}</span>
                                        <button
                                            onClick={() => setStatusOpen(true)}
                                            className="text-xs text-neutral-500 hover:text-white transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={handleClearStatus}
                                            className="text-xs text-neutral-500 hover:text-red-400 transition-colors"
                                        >
                                            Clear
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setStatusOpen(true)}
                                        className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
                                    >
                                        + Set a custom status
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Custom status</p>
                                <div className="flex items-center gap-2">
                                    {/* Emoji picker button */}
                                    <div className="relative shrink-0" ref={pickerRef}>
                                        <button
                                            type="button"
                                            onClick={() => setPickerOpen(v => !v)}
                                            className="w-11 h-10 flex items-center justify-center text-xl bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-colors"
                                        >
                                            {emojiInput || '😊'}
                                        </button>
                                        {pickerOpen && (
                                            <div className="absolute top-full left-0 mt-2 z-50">
                                                <EmojiPicker
                                                    theme={Theme.DARK}
                                                    lazyLoadEmojis
                                                    onEmojiClick={(data) => {
                                                        setEmojiInput(data.emoji);
                                                        setPickerOpen(false);
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    {/* Status text */}
                                    <input
                                        value={textInput}
                                        onChange={e => setTextInput(e.target.value.slice(0, 40))}
                                        placeholder="What's your vibe?"
                                        maxLength={40}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveStatus}
                                        disabled={isSavingStatus || !emojiInput}
                                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-white text-black hover:bg-neutral-200 disabled:opacity-40 transition-all"
                                    >
                                        <HiOutlineCheck size={13} />
                                        {isSavingStatus ? 'Saving…' : 'Set'}
                                    </button>
                                    <button
                                        onClick={() => setStatusOpen(false)}
                                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                                    >
                                        <HiOutlineX size={13} />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
