import { LoaderCircle, UserMinus, UserX } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../common/Avatar'
import Modal from '../common/Modal'
import { useToast } from '../../context/ToastContext'
import { DEMO_PROFILES } from '../../data/demoData'
import { followService } from '../../services/follow.service'
import { getErrorMessage } from '../../utils/errors'
import FollowButton from './FollowButton'

export default function FollowListModal({
  open,
  type,
  profileId,
  currentUserId,
  isOwner,
  isDemo,
  onClose,
  onCountChange
}) {
  const { showToast } = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState('')

  const title = type === 'followers' ? 'Followers' : 'Following'

  const loadList = useCallback(async () => {
    if (!open || !type) return
    setLoading(true)
    try {
      if (isDemo) {
        const demoItems = DEMO_PROFILES
          .filter((profile) => profile.id !== profileId)
          .map((profile) => ({
            id: `${type}-${profile.id}`,
            user: profile,
            viewerFollow: null
          }))
        setItems(demoItems)
        return
      }

      const result = type === 'followers'
        ? await followService.getFollowers(profileId)
        : await followService.getFollowing(profileId)
      setItems(result)
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to load this list.'), 'error')
    } finally {
      setLoading(false)
    }
  }, [isDemo, open, profileId, showToast, type])

  useEffect(() => { loadList() }, [loadList])

  function updateViewerFollow(userId, nextFollow) {
    setItems((current) => current.map((item) =>
      item.user.id === userId
        ? { ...item, viewerFollow: nextFollow }
        : item
    ))
  }

  async function removeItem(item) {
    if (busyId || isDemo) return

    setBusyId(item.user.id)
    try {
      if (type === 'followers') {
        await followService.removeFollower(item.user.id)
        onCountChange?.('followers', -1)
        showToast('Follower removed.')
      } else {
        await followService.removeFollowing(item.user.id)
        onCountChange?.('following', -1)
        showToast('User unfollowed.')
      }
      setItems((current) => current.filter((currentItem) => currentItem.user.id !== item.user.id))
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to update this relationship.'), 'error')
    } finally {
      setBusyId('')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="follow-list">
        {loading ? (
          <div className="follow-list__loading">
            <LoaderCircle className="spin" size={26} />
          </div>
        ) : items.length === 0 ? (
          <p className="follow-list__empty">
            {type === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
          </p>
        ) : items.map((item) => {
          const person = item.user
          const canShowFollowButton = person.id !== currentUserId && !(isOwner && type === 'following')
          const canRemove = isOwner && person.id !== currentUserId
          return (
            <article className="follow-list__item" key={item.id || person.id}>
              <Link className="follow-list__identity" to={`/profile/${person.id}`} onClick={onClose}>
                <Avatar user={person} size="md" className="follow-list__avatar" />
                <span>
                  <strong>{person.name}</strong>
                  <small>@{person.username}</small>
                </span>
              </Link>
              <div className="follow-list__actions">
                {canShowFollowButton && (
                  <FollowButton
                    profileId={person.id}
                    isPrivate={person.isPrivate}
                    initialFollow={item.viewerFollow}
                    onChange={(nextStatus, nextFollow) => {
                      if (nextStatus) updateViewerFollow(person.id, nextFollow)
                    }}
                  />
                )}
                {canRemove && (
                  <button
                    className={`button ${type === 'followers' ? 'button--quiet' : 'button--danger'} follow-list__remove`}
                    onClick={() => removeItem(item)}
                    disabled={busyId === person.id}
                  >
                    {busyId === person.id ? <LoaderCircle className="spin" size={16} /> : type === 'followers' ? <UserX size={16} /> : <UserMinus size={16} />}
                    {type === 'followers' ? 'Remove' : 'Unfollow'}
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </Modal>
  )
}
