import { useMemo } from 'react'

import { useAccountDisplayName } from 'components/AccountDisplayName'
import useClassworkAssignmentName from 'hooks/useClassworkAssignmentName'
import useClassworkMaterialName from 'hooks/useClassworkMaterialName'
import useCourseName from 'hooks/useCourseName'

import { useAuth } from 'common/auth'
import { ConversationType } from 'graphql/generated'

const useConversationName = (roomId: string, type: ConversationType) => {
  const { $account: accountAuth } = useAuth()

  const arrId = useMemo(
    () => roomId.split(accountAuth.id),
    [accountAuth, roomId],
  )
  const targetId = useMemo(() => {
    if (type === ConversationType.Group) {
      return roomId
    }
    return arrId[0] === '' ? arrId[1] : arrId[0]
  }, [arrId, roomId, type])
  const name = useAccountDisplayName(targetId)
  const courseName = useCourseName(targetId)
  const classworkAssignmentName = useClassworkAssignmentName(targetId)
  const classworkMaterialName = useClassworkMaterialName(targetId)

  if (type === ConversationType.Single) {
    return name
  }

  if (courseName !== '') {
    return courseName
  }
  if (classworkAssignmentName !== '') {
    return classworkAssignmentName
  }
  if (classworkMaterialName !== '') {
    return classworkMaterialName
  }
  return 'Group Name'
}

export default useConversationName
