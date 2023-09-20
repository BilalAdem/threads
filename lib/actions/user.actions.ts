"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { FilterQuery, SortOrder } from "mongoose";
import Thread from "../models/thread.model";

interface Params {
    userId : string;
    username : string;
    name : string;
    image : string;
    bio : string;
    path : string;
}

export async  function updateUser(
{    userId ,
    username ,
    name ,
    image ,
    bio ,
    path,
} : Params): Promise<void> {
    connectToDB();
    try{
        await User.findOneAndUpdate({id : userId} , { username: username.toLowerCase(), name , image , bio  , onboarded : true} , {upsert : true});
        if(path === '/profile/edit'){
            revalidatePath(path)
        }
    }catch(err: any){
        throw new Error(`Error updating user ${err.message}`)
    }

}
    
export const fetchUser = async (userId : string) => {
    connectToDB();
    try{
        const user = await User.findOne({id : userId});
        //     {
        //     path : 'communities',
        //     model: Commuinty
        // }
        return user;
    }catch(err: any){
        throw new Error(`Error fetching user ${err.message}`)
    }
}


export const fetchUsers = async ({userId , pageNumber=1 , pageSize=20 , searchString='' , sortBy='desc'} : {userId : string , pageNumber? : number , pageSize? : number , searchString? : string , sortBy? : SortOrder}) => {
    connectToDB();
    try{
        const skipAmount = (pageNumber - 1) * pageSize;
        const regex = new RegExp(searchString , 'i');
        const query: FilterQuery<typeof User> = {
            id: {$ne: userId},}

        if(searchString.trim() !== ''){
            query.$or = [
                {username: {$regex: regex}},
                {name: {$regex: regex}}
            ]
        }
        const sortOptions = { createdAt: sortBy };
        const usersQuery = User.find(query).sort(sortOptions).skip(skipAmount).limit(pageSize);
        const totalUserCount = await User.countDocuments(query);
        const users = await usersQuery.exec();
        const isNext = totalUserCount > skipAmount + users.length;
        return {users , isNext};
    }catch(err: any){
        throw new Error(`Error fetching users ${err.message}`)
    }
}

export async function getActivity(usrId: string){
    connectToDB();
    try{
        const userThreads = Thread.find({author : usrId})
        const childThreadIds = (await userThreads).reduce((acc : string[] , userThread) => {
            return acc.concat(userThread.childThreadIds)
        } , [])
        const replies = await Thread.find({_id : {$in : childThreadIds} , author : {$ne : usrId}}).populate({path: 'author', model: User , select: '_id name image'})
        return replies;

    }catch(err: any){
        throw new Error(`Error fetching activity ${err.message}`)
    }
}