// Author/User info interface reused everywhere
export interface BlogAuthor {
  _id: string;
  name: string;
}

// Blog summary used in blog lists
export interface Blog {
  _id: string;
  title: string;
  banner?: string;
  author: BlogAuthor;
  likesCount: number;
  createdAt: string; // ISO string
}

// Response for fetching all blogs
export interface BlogsApiResponse {
  status: boolean;
  blogs: Blog[];
}

// Interface for an admin reply on a comment
export interface CommentReply {
  _id: string;
  adminId: string;
  replyText: string;
  createdAt: string;
}

// Blog comment interface
export interface BlogComment {
  _id: string;
  blogId: string;
  userId: BlogAuthor;  // reused interface here
  comment: string;
  replies: CommentReply[]; 
  createdAt: string;
  updatedAt: string;
}

// Blog details interface for single blog page
export interface BlogDetails {
  _id: string;
  title: string;
  content: string;
  banner?: string;
  author: BlogAuthor;  // reused interface here
  likesCount: number;
  likedUsers: string[]; 
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// API response for blog details plus comments
export interface BlogDetailsApiResponse {
  status: boolean;
  blog: BlogDetails;
  comments: BlogComment[];
}

// API response when posting a comment
export interface AddCommentResponse {
  status: boolean;
  message: string;
  comment: BlogComment;
}

// API response for toggling blog like
export interface BlogLikeResponse {
  status: boolean;
  liked: boolean;
  likesCount: number;
}