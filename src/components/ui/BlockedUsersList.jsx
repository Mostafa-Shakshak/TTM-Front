import { LoaderCircle, ShieldOff } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../common/Avatar'
import { useToast } from '../../context/ToastContext'
import { usersService } from '../../services/users.service'
import { getErrorMessage } from '../../utils/errors'

export default function BlockedUsersList() {
  const { showToast } = useToast()
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')

  const loadBlockedUsers = useCallback(async () => {
    setLoading(true)
    try {
      const blockedUsers = await usersService.getBlockedUsers()
      setBlocks(blockedUsers)
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to load blocked users.'), 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { loadBlockedUsers() }, [loadBlockedUsers])

  async function unblock(block) {
    const user = block.blocked
    if (busyId) return

    setBusyId(user.id)
    try {
      await usersService.unblock(user.id)
      setBlocks((current) => current.filter((item) => item.blocked.id !== user.id))
      showToast('User unblocked.')
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to unblock this user.'), 'error')
    } finally {
      setBusyId('')
    }
  }

  if (loading) {
    return (
      <div className="blocked-users__loading">
        <LoaderCircle className="spin" size={24} />
      </div>
    )
  }

  if (blocks.length === 0) {
    return <p className="blocked-users__empty">You have not blocked anyone.</p>
  }

  return (
    <div className="blocked-users">
      {blocks.map((block) => {
        const user = block.blocked
        return (
          <article className="blocked-users__item" key={block.id}>
            <Link className="blocked-users__identity" to={`/profile/${user.id}`}>
              <Avatar user={user} size="md" className="blocked-users__avatar" />
              <span>
                <strong>{user.name}</strong>
                <small>@{user.username}</small>
              </span>
            </Link>
            <button className="button button--secondary blocked-users__button" onClick={() => unblock(block)} disabled={busyId === user.id}>
              {busyId === user.id ? <LoaderCircle className="spin" size={16} /> : <ShieldOff size={16} />}
              Unblock
            </button>
          </article>
        )
      })}
    </div>
  )
}
