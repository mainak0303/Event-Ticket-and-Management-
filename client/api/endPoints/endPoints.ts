export const endPoints = {
  auth: {
    login: `/user/auth/login`,
    register: `/user/auth/register`,
    verify: `/user/auth/verify`,
    profile: `/user/auth/profile`,
    forgotpw: `/user/auth/forgot-password`,
    resetpw: `/user/auth/reset-password`,
    updatepw: `/user/auth/update-password`,
  },
  cms: {
    eventlist: `/user/events`,
    eventdetails: `/user/events`,
    usertickets:`/user/tickets`,
    purchase:`/user/purchase`,
    createOrder: `/user/create-order`,      
    verifyPayment: `/user/verify-payment`
    
  },
  blogs: {
    blogslist: `/blogs`,
    blogsdetails: `/blogs`,
    comment: `/blogs/comments`,
    like:  `/blogs/like`
  }
}