import { fetchUserPosts } from '@/lib/actions/thread.actions'
import { redirect } from 'next/navigation'
import React from 'react'
import ThreadCard from '../cards/ThreadCard'

const ThreadsTab = async (
    {currentUserId, accountId, accountType}: {currentUserId: string, accountId: string, accountType: string}
) => {
  let results = await fetchUserPosts(accountId)
  if(!results) {
      redirect('/')
      return null
  }
  return (
    <section className="mt-9 flex flex-col gap-10">
        {results.threads.map((thread: any) => (
                <ThreadCard key={thread._id} id={thread._id} currentUserId={currentUserId } parentId={thread.parentId}  
                content={thread.text} author={accountType === 'User' ? {name: results.name, image: results.image, id: results._id} : {name: thread.author.name, image: thread.author.image, id: thread.author._id}}
                community = {thread.communtiy} createdAt={thread.createdAt} comments={thread.children} />

        ))}
    </section>
  )
}

export default ThreadsTab