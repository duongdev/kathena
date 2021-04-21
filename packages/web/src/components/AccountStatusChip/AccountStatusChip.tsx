import { FC } from 'react'

import { SemanticColor } from '@kathena/theme'
import { StatusChip, StatusChipProps, withComponentHocs } from '@kathena/ui'
import { AccountStatus } from 'graphql/generated'

export type AccountStatusChipProps = {
  status: AccountStatus
} & StatusChipProps

const colorMap: { [status in AccountStatus]: keyof SemanticColor } = {
  [AccountStatus.Active]: 'green',
  [AccountStatus.Pending]: 'yellow',
  [AccountStatus.Deactivated]: 'smoke',
}

const statusLocaleMap: { [status in AccountStatus]: string } = {
  [AccountStatus.Active]: 'Đang hoạt động',
  [AccountStatus.Pending]: 'Đang chờ',
  [AccountStatus.Deactivated]: 'Dừng hoạt động',
}

const AccountStatusChip: FC<AccountStatusChipProps> = (props) => {
  const { status, ...rest } = props

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <StatusChip color={colorMap[status]} {...rest}>
      {statusLocaleMap[status]}
    </StatusChip>
  )
}

export default withComponentHocs(AccountStatusChip)
