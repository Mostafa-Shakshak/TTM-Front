import api from './api'

export const followService = {
  async follow(userId) {
    const { data } = await api.post(`/follow/${userId}`)
    return data.follow
  },

  async accept(followId) {
    const { data } = await api.patch(`/follow/${followId}/accept`)
    return data.follow
  },

  async reject(followId) {
    const { data } = await api.patch(`/follow/${followId}/reject`)
    return data.follow
  },

  async unfollow(followId) {
    const { data } = await api.delete(`/follow/${followId}`)
    return data
  },

  async getStatus(userId) {
    const { data } = await api.get(`/follow/status/${userId}`)
    return data.follow
  },

  async getRequests() {
    const { data } = await api.get('/follow/requests')
    return data.requests
  },

  async getFollowers(userId) {
    const { data } = await api.get(`/follow/${userId}/followers`)
    return data.followers
  },

  async getFollowing(userId) {
    const { data } = await api.get(`/follow/${userId}/following`)
    return data.following
  },

  async getCounts(userId) {
    const { data } = await api.get(`/follow/${userId}/counts`)
    return data.counts
  },

  async removeFollower(followerUserId) {
    const { data } = await api.delete(`/follow/followers/${followerUserId}`)
    return data
  },

  async removeFollowing(followingUserId) {
    const { data } = await api.delete(`/follow/following/${followingUserId}`)
    return data
  }
}
