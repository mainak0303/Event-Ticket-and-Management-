import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {  fetchAllBlogs,  fetchBlogDetails,  postBlogComment,  toggleBlogLike} from '@/api/functions/blogs.api';
import {  BlogsApiResponse,  BlogDetailsApiResponse,  AddCommentResponse,  BlogLikeResponse} from '@/typescript/blogs.typescript';

// Hook to get all blogs
export function useBlogs() {
  return useQuery<BlogsApiResponse, Error>({
    queryKey: ['blogs'],
    queryFn: fetchAllBlogs
  });
}

// Hook to get blog details and comments by blog id
export function useBlogDetails(blogId: string) {
  return useQuery<BlogDetailsApiResponse, Error>({
    queryKey: ['blogDetails', blogId],
    queryFn: () => fetchBlogDetails(blogId),
    enabled: !!blogId // only run if blogId is truthy
  });
}

export function usePostComment() {
  const queryClient = useQueryClient();
  return useMutation<AddCommentResponse, Error, { blogId: string; comment: string }>({
    mutationFn: ({ blogId, comment }) => postBlogComment(blogId, comment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blogDetails', variables.blogId] });
    }
  });
}


export function useToggleLike() {
  const queryClient = useQueryClient();
  return useMutation<BlogLikeResponse, Error, string>({
    mutationFn: (blogId: string) => toggleBlogLike(blogId),
    onSuccess: (_, blogId) => {
      
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      
      queryClient.invalidateQueries({ queryKey: ['blogDetails', blogId] });
    }
  });
}

