"use client";

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { useRouter } from 'next/navigation';
import { HiOutlinePencil, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

interface UserFormData {
    avatar_url: string; // Changed from string | null to string for internal state
    username: string;
    bio: string;
}

interface UserContentProps {
    avatar_url: string | null;
    username: string | null;
    bio: string | null;
    id: string;
}

export const UserContent: React.FC<UserContentProps> = ({ avatar_url, username, bio, id }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UserFormData>({
        avatar_url: avatar_url || '',
        username: username || '',
        bio: bio || '',
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const supabaseClient = useSupabaseClient();
    const router = useRouter();

    const getPublicUrl = (path: string) =>
        supabaseClient.storage.from('images').getPublicUrl(path).data.publicUrl;

    const displayAvatar = avatar_url ? getPublicUrl(avatar_url) : null;
    
    // Safety check for previewing the blob or the existing path
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
                // If there was a previous image, optionally remove it
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

            // Fix: Explicitly define the update object to avoid 'never' inference
            const updateData = {
                avatar_url: uploadedImagePath || null,
                username: formData.username || null,
                bio: formData.bio || null,
            };

   const { error } = await supabaseClient
    .from('users')
    .update({ 
        avatar_url: uploadedImagePath, 
        username: formData.username, 
        bio: formData.bio 
    } as any) // Add 'as any' here
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
        setFormData({ 
            avatar_url: avatar_url || '', 
            username: username || '', 
            bio: bio || '' 
        });
        setAvatarFile(null);
        setIsEditing(false);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            {isEditing ? (
                <div className="flex flex-col gap-5">
                    {/* ... rest of your JSX remains the same ... */}
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
                        <Input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="Username"
                        />
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

                    <div className="flex gap-3">
                        <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
                            <HiOutlineCheck size={14} />
                            {isSaving ? 'Saving…' : 'Save changes'}
                        </Button>
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                        >
                            <HiOutlineX size={14} />
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-white/10 shrink-0">
                        {displayAvatar && (
                            <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
                        )}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <p className="text-lg font-semibold text-white truncate">{username || 'No username'}</p>
                        <p className="text-sm text-neutral-400 line-clamp-2">{bio || 'No bio yet'}</p>
                    </div>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                    >
                        <HiOutlinePencil size={14} />
                        Edit
                    </button>
                </div>
            )}
        </div>
    );
};