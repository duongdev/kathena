import { FC, useMemo } from 'react'

import { SemanticColor } from '@kathena/theme'
import { StatusChip, StatusChipProps } from '@kathena/ui'
import { Publication } from 'graphql/generated'

const colorMap: { [p in Publication]: keyof SemanticColor } = {
  Draft: 'blue',
  Published: 'green',
}

export type PublicationChipProps = {
  publication: Publication
  variant?: StatusChipProps['variant']
  size?: StatusChipProps['size']
}

const PublicationChip: FC<PublicationChipProps> = (props) => {
  const { publication, variant, size } = props

  const color = useMemo(() => colorMap[publication], [publication])

  return (
    <StatusChip variant={variant} color={color} size={size}>
      {publication}
    </StatusChip>
  )
}

export default PublicationChip
