"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    await connectToDB();
    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    });

    // Update user model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });
  } catch (error: any) {
    throw new Error(`Error creating thread ${error.message}`);
  }

  revalidatePath(path);
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  await connectToDB();

  // Calculate the number of posts to skip
  const skipAmount = (pageNumber - 1) * pageSize;

  // Fetch the posts that have no parents (top level threads)
  const postQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: "author", model: User })
    .populate({
      path: "children",
      populate: {
        path: "author",
        model: User,
        select: "_id name parentId image",
      },
    });

  const totalPostsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  });

  const posts = await postQuery.exec();

  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}

export async function fetchThreadById(id: string) {
  await connectToDB();

  try {
    // TODO: Populate community
    const thread = await Thread.findById(id)
      .populate({ path: "author", model: User, select: "_id id name image" })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name image",
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name image",
            },
          },
        ],
      })
      .exec();

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
  await connectToDB();
  try {
    // Add a comment
    // find origal thread by its ID

    const originalThread = await Thread.findById(threadId);
    if (!originalThread) {
      throw new Error("Thread not found");
    }

    // Create a new thread with the comment text

    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId
    })

    // save the new thread
    const savedCommentThread = await commentThread.save();

    // Update the original thread to include the new thread
    originalThread.children.push(savedCommentThread._id);

    // Save the original thread
    await originalThread.save();

    revalidatePath(path);
  } catch (err: any) {
    throw new Error(`Error adding comment to thread ${err.message}`);
  }
}
