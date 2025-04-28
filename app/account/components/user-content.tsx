"use client"
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
    const [formData, setFormData] = useState<User>({ avatar_url: avatar_url || '', username: username || '', bio: bio || '' });
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
    
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setFormData((prev) => ({ ...prev, avatar_url: previewUrl }));
        }
    };
    

    const sanitizeFileName = (name: string) => {
        return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    };

    const handleSave = async () => {
        try {
            let uploadedImagePath = formData.avatar_url;
    
            if (avatarFile) {
                // Delete the previous avatar if it exists and is not a temporary preview URL
                if (avatar_url && !avatar_url.startsWith('blob:')) {
                    const { error: deleteError } = await supabaseClient
                        .storage
                        .from('images')
                        .remove([avatar_url]);
    
                    if (deleteError) {
                        throw new Error(deleteError.message);
                    }
                }
    
                const sanitizedFileName = sanitizeFileName(avatarFile.name);
                const uniqueID = `${id}-${Date.now()}`;
    
                const { data, error: uploadError } = await supabaseClient
                    .storage
                    .from('images')
                    .upload(`avatars/${sanitizedFileName}-${uniqueID}`, avatarFile, {
                        cacheControl: '3600',
                        upsert: false,
                    });
    
                if (uploadError) {
                    throw new Error(uploadError.message);
                }
    
                uploadedImagePath = data?.path || '';
            }
    
            const { error: supabaseError } = await supabaseClient
                .from('users') // Update the 'users' table
                .update({
                    avatar_url: uploadedImagePath,
                    username: formData.username,
                    bio: formData.bio,
                })
                .eq('id', id); // Match the user by ID
    
            if (supabaseError) {
                throw new Error(supabaseError.message);
            }
    
            toast.success('User updated successfully!');
            setIsEditing(false); // Exit editing mode
            router.refresh();
        } catch (error) {
            toast.error('Something went wrong');
        }
    };
    
    

    const getPublicUrl = (path: string) => {
        return supabaseClient.storage.from('images').getPublicUrl(path).data.publicUrl;
    };

    if (!avatar_url || !username || isEditing) {
        return (
            <div className="flex flex-col gap-5">
                <h2 className="text-xl ml-5 font-semibold">{isEditing ? 'Edit User Info' : 'Complete Your Profile!'}</h2>
                <form className="flex flex-col gap-4 rounded w-1/3 p-5">
                <div>
    <label>
        <div className='flex flex-row gap-5 items-center mb-2'>
            <p>Avatar: </p>
            {formData.avatar_url && !formData.avatar_url.startsWith('blob:') && (
                <span className="text-sm text-neutral-500">Avatar already set. Upload a new one to replace it.</span>
            )}
        </div>
        <Input
            type="file"
            name="avatar"
            accept="image/*"
            onChange={handleFileChange}
        />
    </label>
</div>

                    <div>
                        <label>
                            Username:
                            <Input
                                type="text"
                                name="username"
                                value={formData.username || ''}
                                onChange={handleInputChange}
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Bio:
                            <textarea
                                name="bio"
                                value={formData.bio || ''}
                                onChange={handleInputChange}
                                className="border rounded p-2 w-full"
                                rows={4}
                            />
                        </label>
                    </div>
                    <Button onClick={handleSave}>
                        Save
                    </Button>
                </form>
            </div>
        );
    }

    return (
        <div className='flex flex-col m-5 gap-3'>
            <img
                className='rounded-full mb-5'
                src={getPublicUrl(avatar_url || '')}
                alt="User Avatar"
                style={{ width: 100, height: 100 }}
            />
            <h2 className='text-2xl font-semibold '>Welcome, {username}!</h2>
            <p className='text-neutral-400 text-light'>Biography: {bio}</p>
            <Button className='w-1/4' onClick={() => setIsEditing(true)}>Edit User Info</Button>
        </div>
    );
};
