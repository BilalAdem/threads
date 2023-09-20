import ProfileHeader from "@/components/shared/ProfileHeader"
import { fetchUser, fetchUsers } from "@/lib/actions/user.actions"
import { currentUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import Image from "next/image"
import ThreadsTab from "@/components/shared/ThreadsTab"
import UserCard from "@/components/cards/UserCard"

async function page (
) {
    const user = await currentUser()
    if (!user) {
        return null
    }
    const userInfo = await fetchUser(user.id)
    if (!userInfo?.onboarded) {
        redirect("/onboarding")
        return null
    }
    const result = await fetchUsers({
        userId: user.id,
        pageNumber: 1,
        pageSize: 25,
        searchString: "",
    })
    
  return (
    <section>
        <h1 className="head-text mb-10">
            Search
        </h1>
        <div className="mt-14 flex flex-col gap-9">
            {result.users.length === 0 ? (
                <p className="no-result">No results found</p>
            ): (
                <>
                {result.users.map((user) => (
                    <UserCard key={user.id} id={user.id} name={user.name} username={user.username} imgUrl={user.image} personType='User'  />
                ))}

                </>
            )}
        </div>
    </section>

  )
}

export default page