import Image from 'next/image';

interface Props {
    id: string;
    currentUserId: string;
    parentId: string | null;
    content: string;
}

const ProfileHeader = (
    {
        accountId,
        authUserId,
        username,
        name,
        imagUrl,
        bio,
    } : {
        accountId: string;
        authUserId: string;
        username: string;
        name: string;
        imagUrl: string;
        bio: string;
    } 
    ) => {
  return (
    <div className='flex flex-col w-full justify-start'>
        <div className='flex item-center justify-between'>
            <div className='flex items-center gap-3'>
                <div className='relative w-20 h-20 gap-3'>
                   <Image src={imagUrl} fill className='rounded-full object-cover shadow-2xl' alt='profile image' />
                </div>
                <div className=' flex-1'>
                    <h2 className='text-left text-heading text-light-1'>
                        {name}
                    </h2>
                    <p className='text-base-medium text-gray-1'>
                        @{username}
                    </p>
                </div>
            </div>
            {/* TODO: Community */}
            
        </div>
            <p className='mt-6 max-w-lg text-base-regular text-light-2'>
                {bio}
            </p>
            <div className='mt-12 h-0.5 w-full bg-dark-3' />
    </div>
  )
}

export default ProfileHeader