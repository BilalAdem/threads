import ProfileHeader from "@/components/shared/ProfileHeader"
import { fetchUser } from "@/lib/actions/user.actions"
import { currentUser } from "@clerk/nextjs"
import { Tabs, TabsList, TabsTrigger , TabsContent
 } from "@/components/ui/tabs"
import { redirect } from "next/navigation"
import { profileTabs } from "@/constants"
import Image from "next/image"
import ThreadsTab from "@/components/shared/ThreadsTab"

async function Page (
    {params}: {params: {id: string}}
) {
    const user = await currentUser()
    if (!user) {
        return null
    }
    const userInfo = await fetchUser(params.id)
    if (!userInfo?.onboarded) {
        redirect("/onboarding")
        return null
    }

  return (
    <section className="relative">
        <ProfileHeader accountId={userInfo._id} authUserId={user.id} name={userInfo.name} username={userInfo.username} imagUrl={userInfo.image} bio={userInfo.bio} />
        <div className='mt-9'>
            <Tabs defaultValue="threads" className='w-full'>
                <TabsList className='tab'>
                    {profileTabs.map((tab) => (
                        <TabsTrigger key={tab.label} value={tab.value} className='tab'>
                            <Image src={tab.icon} alt={tab.label} width={24} height={24} />
                            <p className='max-sm:hidden'>
                                {tab.label}
                            </p>
                            {tab.label === 'Threads' && (
                                <p className='ml-1 rounde bg-light-4 px-2 py-1 !text-tiny-medium text-light-2'>
                                    {userInfo.threads.length}
                                </p>
                            )
                                
                                }

                        </TabsTrigger>
                    ))}

                    
                </TabsList>

                {profileTabs.map((tab) => (
                    <TabsContent key={`tab-${tab.label}`} value={tab.value} className='w-full text-light-1'>
                        <ThreadsTab currentUserId={user.id} accountId={userInfo._id} accountType="User"/>
                    </TabsContent>
                ))}

            </Tabs>
        </div>
    </section>
  )
}

export default Page