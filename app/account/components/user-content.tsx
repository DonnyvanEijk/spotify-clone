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
    const supabaseClient = useSupabaseClient();
    const router = useRouter();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        const { error: supabaseError } = await supabaseClient
            .from('users') // Update the 'users' table
            .update({
                avatar_url: formData.avatar_url,
                username: formData.username,
                bio: formData.bio,
            })
            .eq('id', id); // Match the user by ID

        if (supabaseError) {
            return toast.error(supabaseError.message);
        }

        toast.success('User updated successfully!');
        setIsEditing(false); // Exit editing mode
        router.refresh();
    };

    if (!avatar_url || !username || isEditing) {
        return (
            <div className="flex flex-col gap-5">
                <h2 className="text-xl ml-5 font-semibold">{isEditing ? 'Edit User Info' : 'Complete Your Profile!'}</h2>
                <form className="flex flex-col gap-4 rounded w-1/3 p-5">
                    <div>
                        <label>
                            Avatar URL:
                            <Input
                                type="text"
                                name="avatar_url"
                                value={formData.avatar_url || ''}
                                onChange={handleInputChange}
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
            <img className='rounded-full mb-5' src={avatar_url || ''} alt="User Avatar" style={{ width: 100, height: 100 }} />
            <h2 className='text-2xl font-semibold '>Welcome, {username}!</h2>
            <p className='text-neutral-400 text-light'>Biography: {bio}</p>
            <Button className='w-1/4' onClick={() => setIsEditing(true)}>Edit User Info</Button>
        </div>
    );
};