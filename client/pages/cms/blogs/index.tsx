import React, { useMemo, useState } from "react";
import Head from "next/head";
import {  Box,  Typography,  Paper,  CircularProgress,  Button,} from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/router";
import { useBlogs } from "@/customHooks/query/blogs.query"; // Your blogs query hook
import { motion } from "framer-motion";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const AllBlogsPage = () => {
  const router = useRouter();
  const { data, isLoading } = useBlogs();
  const blogs = data?.blogs ?? [];

  // Example search filter for blog titles
  const [searchText, setSearchText] = useState("");

  // Filter blogs by search text
  const filteredBlogs = useMemo(() => {
    const lwr = searchText.toLowerCase();
    return blogs.filter(blog =>
      blog.title.toLowerCase().includes(lwr) ||
      blog.author.name.toLowerCase().includes(lwr)
    );
  }, [blogs, searchText]);

  return (
    <>
      <Head>
        <title>All Blogs</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", bgcolor: "#fcf2e3" }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          All Blogs
        </Typography>

        <Box sx={{ mb: 3 }}>
          <input
            type="text"
            placeholder="Search blogs by title or author"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{
              width: "100%",
              maxWidth: 400,
              padding: "8px 12px",
              fontSize: 16,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
        </Box>

        {isLoading ? (
          <Box textAlign="center" mt={8}>
            <CircularProgress />
          </Box>
        ) : filteredBlogs.length === 0 ? (
          <Typography variant="h6" color="text.secondary" textAlign="center" mt={5}>
            No blogs found.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 3,
              px: 1,
              overflow: "hidden",
            }}
          >
            {filteredBlogs.map(blog => (
              <motion.div
                key={blog._id}
                initial="initial"
                animate="animate"
                variants={fadeInUp}
                style={{
                  cursor: "pointer",
                  flex: "1 1 calc(25% - 24px)",
                  maxWidth: "calc(25% - 24px)",
                  minWidth: 250,
                  display: "flex",
                  flexDirection: "column",
                }}
                onClick={() => router.push(`/cms/blogs/${blog._id}`)}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${blog.title}`}
              >
                <Paper
                  sx={{
                    bgcolor: "#fffaf3",
                    borderRadius: 3,
                    boxShadow: 3,
                    border: "1px solid #f1deb5",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": { boxShadow: 7 },
                  }}
                >
                  <Box sx={{ position: "relative", height: 180 }}>
                    {blog.banner ? (
                      <Image
                        src={`http://localhost:5000${blog.banner}`}
                        alt={blog.title}
                        fill
                        style={{ objectFit: "cover" }}
                        priority
                      />
                    ) : (
                      <Box
                        sx={{
                          width: "100%",
                          height: "100%",
                          backgroundColor: "#ddd",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          color: "#555",
                          fontStyle: "italic",
                        }}
                      >
                        No Image
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ p: 2, flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold" noWrap>
                      {blog.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      By: {blog.author.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          bgcolor: "text.primary",
                          color: "background.paper",
                          fontWeight: 600,
                          "&:hover": { bgcolor: "text.secondary"},
                        }}
                        onClick={e => {
                          e.stopPropagation();
                          router.push(`/cms/blogs/${blog._id}`);
                        }}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            ))}
          </Box>
        )}
      </Box>
    </>
  );
};

export default AllBlogsPage;
