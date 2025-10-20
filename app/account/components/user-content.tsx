"use client";

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';

interface User {
    avatar_url: string | null;
    username: string | null;
    bio: string | null;
}

interface UserContentProps {
    avatar_url: string | null;
    username: string | null;
    bio: string | null;
    id: string;
}

export const UserContent: React.FC<UserContentProps> = ({ avatar_url, username, bio, id }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<User>({
        avatar_url: avatar_url || '',
        username: username || '',
        bio: bio || ''
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const supabaseClient = useSupabaseClient();
    const router = useRouter();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setAvatarFile(file);
        if (file) setFormData((prev) => ({ ...prev, avatar_url: URL.createObjectURL(file) }));
    };

    const sanitizeFileName = (name: string) => name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    const handleSave = async () => {
        try {
            let uploadedImagePath = formData.avatar_url;

            if (avatarFile) {
                if (avatar_url && !avatar_url.startsWith('blob:')) {
                    const { error: deleteError } = await supabaseClient.storage.from('images').remove([avatar_url]);
                    if (deleteError) throw new Error(deleteError.message);
                }

                const sanitizedFileName = sanitizeFileName(avatarFile.name);
                const uniqueID = `${id}-${Date.now()}`;

                const { data, error: uploadError } = await supabaseClient
                    .storage
                    .from('images')
                    .upload(`avatars/${sanitizedFileName}-${uniqueID}`, avatarFile, { cacheControl: '3600', upsert: false });

                if (uploadError) throw new Error(uploadError.message);
                uploadedImagePath = data?.path || '';
            }

            const { error: supabaseError } = await supabaseClient
                .from('users')
                .update({ avatar_url: uploadedImagePath, username: formData.username, bio: formData.bio })
                .eq('id', id);

            if (supabaseError) throw new Error(supabaseError.message);
            toast.success('User updated successfully!');
            setIsEditing(false);
            router.refresh();
        } catch {
            toast.error('Something went wrong');
        }
    };

    const getPublicUrl = (path: string) => supabaseClient.storage.from('images').getPublicUrl(path).data.publicUrl;

    return (
        <div className="flex flex-col gap-4 bg-white/10 backdrop-blur-[20px] border border-white/20 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
            {avatar_url && !isEditing && (
                <img
                    src={getPublicUrl(avatar_url)}
                    alt="User Avatar"
                    className="w-24 h-24 rounded-full mb-3 object-cover shadow-inner shadow-white/20"
                />
            )}

            <h2 className="text-2xl font-semibold text-white">{isEditing ? 'Edit Profile' : `Welcome, ${username}!`}</h2>

            {isEditing ? (
                <div className="flex flex-col gap-4">
                    <Input type="file" name="avatar" accept="image/*" onChange={handleFileChange} />
                    <Input type="text" name="username" value={formData?.username ?? ""} onChange={handleInputChange} placeholder="Username" />
                    <textarea name="bio" value={formData?.bio ?? "no bio"} onChange={handleInputChange} className="rounded p-2 w-full" rows={4} placeholder="Bio" />
                    <Button onClick={handleSave}>Save</Button>
                </div>
            ) : (
                <>
                    <p className="text-neutral-300">Bio: {bio}</p>
                    <Button className="w-1/4 mt-2" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                </>
            )}
        </div>
    );
};
