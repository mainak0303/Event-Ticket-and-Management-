import React, { useState } from "react";
import Head from "next/head";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  TextField,
  Alert,
} from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/router";
import { useBlogDetails, usePostComment, useToggleLike } from "@/customHooks/query/blogs.query";
import { useUserStore } from "@/utils/store/store";


const BlogDetailsPage = () => {
  const router = useRouter();
  const blogId = router.query.id as string;
  const { data, isPending, isError, error } = useBlogDetails(blogId);
  const user = useUserStore(state => state.user);
  const postComment = usePostComment();
  const toggleLike = useToggleLike();

  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");

  if (isPending)
    return (
      <Box textAlign="center" mt={8}>
        <CircularProgress />
      </Box>
    );

  if (isError)
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {error?.message || "Failed to load blog."}
      </Alert>
    );

  if (!data?.blog)
    return (
      <Typography variant="h5" mt={4} textAlign="center">
        Blog not found.
      </Typography>
    );

  const { blog, comments } = data;

  const handleLikeClick = () => {
    if (!user) {
      alert("Please log in to like the blog.");
      return;
    }
    toggleLike.mutate(blog._id);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError("");
    if (!user) {
      setCommentError("You must be logged in to comment.");
      return;
    }
    if (!commentText.trim()) {
      setCommentError("Comment cannot be empty.");
      return;
    }
    postComment.mutate(
      { blogId: blog._id, comment: commentText },
      {
        onSuccess: () => {
          setCommentText("");
        },
        onError: () => {
          setCommentError("Failed to post comment. Please try again.");
        },
      }
    );
  };

  return (
    <>
      <Head>
        <title>{blog.title} - Blog Details</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", bgcolor: "#fcf2e3" }}>
        <Button variant="outlined" onClick={() => router.push("/cms/blogs")}>
          Back to Blogs
        </Button>

        <Typography variant="h3" fontWeight="bold" mt={3} mb={2}>
          {blog.title}
        </Typography>

        {blog.banner && (
          <Box sx={{ position: "relative", height: 350, borderRadius: 3, overflow: "hidden", mb: 3 }}>
            <Image
              src={`http://localhost:5000${blog.banner}`}
              alt={blog.title}
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </Box>
        )}

        <Typography variant="subtitle1" color="text.secondary" mb={2}>
          By: {blog.author.name} | {new Date(blog.createdAt).toLocaleDateString()}
        </Typography>

        <Typography
          variant="body1"
          sx={{ whiteSpace: "pre-line", mb: 4 }}
        >
          {blog.content}
        </Typography>

        {/* Like Section */}
        <Box sx={{ mb: 4 }}>
          <Button
            variant={blog.likedUsers.includes(user?.id || "") ? "contained" : "outlined"}
            onClick={handleLikeClick}
            disabled={!user || toggleLike.isPending}
          >
            {toggleLike.isPending ? "Processing..." : `Like (${blog.likesCount})`}
          </Button>
        </Box>

        {/* Comments Section */}
        <Typography variant="h5" mb={2}>
          Comments ({comments.length})
        </Typography>

        {comments.length === 0 && (
          <Typography color="text.secondary" mb={2}>
            No comments yet.
          </Typography>
        )}

        <Box mb={3}>
  {comments.map(comment => (
    <Paper
      key={comment._id}
      sx={{ mb: 2, p: 2, bgcolor: "#fffaf3", borderRadius: 2 }}
    >
      <Typography fontWeight="bold" mb={1}>
        {comment.userId.name}
      </Typography>
      <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
        {comment.comment}
      </Typography>
      <Typography variant="caption" color="text.secondary" mt={0.5}>
        {new Date(comment.createdAt).toLocaleString()}
      </Typography>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <Box sx={{ mt: 2, pl: 3, borderLeft: "3px solid #e7dda9" }}>
          <Typography variant="subtitle2" fontWeight="bold" color="primary" mb={1}>
            Admin Replies:
          </Typography>
          {comment.replies.map(reply => (
            <Box key={reply._id} sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                {reply.replyText}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(reply.createdAt).toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
      
    </Paper>
  ))}
</Box>


        {/* Comment form */}
        {user ? (
          <Box
            component="form"
            onSubmit={handleCommentSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 600 }}
          >
            <TextField
              label="Add a comment"
              multiline
              rows={4}
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              error={!!commentError}
              helperText={commentError}
              variant="outlined"
            />
            <Button type="submit" variant="contained" disabled={postComment.isPending}>
              {postComment.isPending ? "Posting..." : "Post Comment"}
            </Button>
          </Box>
        ) : (
          <Typography color="text.secondary">
            Please log in to post comments.
          </Typography>
        )}
      </Box>
    </>
  );
};

export default BlogDetailsPage;
