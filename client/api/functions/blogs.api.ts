import axiosInstance from "../axios/axios";
import { endPoints } from "../endPoints/endPoints";
import {  BlogsApiResponse,  BlogDetailsApiResponse,  AddCommentResponse,  BlogLikeResponse} from "@/typescript/blogs.typescript";

// Fetch all blogs
export async function fetchAllBlogs(): Promise<BlogsApiResponse> {
  const { data } = await axiosInstance.get<BlogsApiResponse>(endPoints.blogs.blogslist);
  return data;
}

// Fetch blog details by ID including comments
export async function fetchBlogDetails(id: string): Promise<BlogDetailsApiResponse> {
  const { data } = await axiosInstance.get<BlogDetailsApiResponse>(`${endPoints.blogs.blogsdetails}/${id}`);
  return data;
}

// Post a comment on a blog, requires authentication
export async function postBlogComment(blogId: string, comment: string): Promise<AddCommentResponse> {
  const requestData = { comment };
  const { data } = await axiosInstance.post<AddCommentResponse>(`${endPoints.blogs.comment}/${blogId}`, requestData);
  return data;
}

// Toggle like/unlike a blog, requires authentication
export async function toggleBlogLike(blogId: string): Promise<BlogLikeResponse> {
  const { data } = await axiosInstance.post<BlogLikeResponse>(`${endPoints.blogs.like}/${blogId}`);
  return data;
}
