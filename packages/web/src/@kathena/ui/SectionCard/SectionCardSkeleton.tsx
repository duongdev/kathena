import React from 'react'

import { Card, CardContent, CardHeader, Skeleton } from '@material-ui/core'

import { ContentSkeleton } from '../skeletons'
import Typography from '../Typography'

export type SectionCardSkeletonProps = {}

export const SectionCardSkeleton: React.FC<SectionCardSkeletonProps> = () => (
  <Card>
    <CardHeader
      title={
        <Skeleton>
          <Typography variant="h6">Sample card header</Typography>
        </Skeleton>
      }
    />
    <CardContent>
      <ContentSkeleton />
    </CardContent>
  </Card>
)
