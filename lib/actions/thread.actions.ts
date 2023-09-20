"use server"

import { connectToDB } from "../mongoose";

import Thread from "../models/thread.model";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";
interface Params {
   text: string;
   author: string;
   communityId: string | null;
   path: string;
}


export async function createThread({ text, author, communityId, path }: Params) {
   await connectToDB();
   try{
    const thread = await Thread.create({
        text,
        author,
        community: null,
        path,
     });
     //upadte user model
     await User.findByIdAndUpdate(author, {
          $push: { threads: thread._id },
      });
      revalidatePath(path);
   }
    catch(err: any){
        throw new Error(`Error creating thread ${err.message}`)
    }



}
 


export async function fetchPosts(pageNumber = 1, pageSize = 20) {
    connectToDB();
  
    // Calculate the number of posts to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;
  
    // Create a query to fetch the posts that have no parent (top-level threads) (a thread that is not a comment/reply).
    const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({
        path: "author",
        model: User,
      })
      .populate({
        path: "children", // Populate the children field
        populate: {
          path: "author", // Populate the author field within children
          model: User,
          select: "_id name parentId image", // Select only _id and username fields of the author
        },
      });
  
    // Count the total number of top-level posts (threads) i.e., threads that are not comments.
    const totalPostsCount = await Thread.countDocuments({
      parentId: { $in: [null, undefined] },
    }); // Get the total count of posts
  
    const posts = await postsQuery.exec();
  
    const isNext = totalPostsCount > skipAmount + posts.length;
  
    return { posts, isNext };
  }

export async function fetchThreadById(id: string) {
    connectToDB();
  
    try {
      const thread = await Thread.findById(id)
        .populate({
          path: "author",
          model: User,
          select: "_id id name image",
        })
        .populate(
      {   path: "children",
          populate: [
            {
              path: "author",
              model: User,
              select: "_id id name image parentId",
            },
            {
              path: "children",
              model: Thread,
              populate: {
                path: "author",
                model: User,
                select: "_id id name image parentId",
              }
            }
          ]}
        )
        .exec();

  
      if (!thread) {
        throw new Error("Thread not found");
      }
  
      return thread;
    } catch (err: any) {
      throw new Error(`Error fetching thread ${err.message}`);
    }

  }


  export async function addCommentToThread(
    threadId: string,
    commentText: string,
    userId: string,
    path: string
  ) {
    connectToDB();
  
    try {
      // Find the original thread by its ID
      const originalThread = await Thread.findById(threadId);
  
      if (!originalThread) {
        throw new Error("Thread not found");
      }
  
      // Create the new comment thread
      const commentThread = new Thread({
        text: commentText,
        author: userId,
        parentId: threadId, // Set the parentId to the original thread's ID
      });
  
      // Save the comment thread to the database
      const savedCommentThread = await commentThread.save();
  
      // Add the comment thread's ID to the original thread's children array
      originalThread.children.push(savedCommentThread._id);
  
      // Save the updated original thread to the database
      await originalThread.save();
  
      revalidatePath(path);
    } catch (err) {
      console.error("Error while adding comment:", err);
      throw new Error("Unable to add comment");
    }
  }


export async function fetchCommentThreadsByParentId(parentId: string){
    connectToDB();
    try{
        const commentThreads = await Thread.find({parentId})
        .populate({
            path: "author",
            model: User,
            select: "_id id name image parentId",
          })
          .populate(
        {   path: "children",
            populate: [
              {
                path: "author",
                model: User,
                select: "_id id name image parentId",
              },
              {
                path: "children",
                model: Thread,
                populate: {
                  path: "author",
                  model: User,
                  select: "_id id name image parentId",
                }
              }
            ]}
          )
          .exec();
          return commentThreads;
    }
    catch(err: any){
        throw new Error(`Error fetching comment threads ${err.message}`)
    }
}

export async function fetchUserPosts(userId : string){
    connectToDB();
    try{
        const threads = await User.findOne({_id: userId})
        .populate({
            path: "threads",
            model: Thread,
            populate: {
                path: "children",
                model: Thread,
                populate: {
                    path: "author",
                    model: User,
                    select: " name image id",
                }
              }
        })
        .exec();
        return threads;
    
    }
    catch(err: any){
        throw new Error(`Error fetching user posts ${err.message}`)
    }
}