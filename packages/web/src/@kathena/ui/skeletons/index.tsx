import { PageContainerSkeleton as PageContainer } from '../PageContainer/PageContainer'

export { default as ContentSkeleton } from './ContentSkeleton'

export const PageContainerSkeleton = PageContainer
// ? Tempo fix a weird react warning
export const pageContainerSkeleton = PageContainerSkeleton ? (
  <PageContainerSkeleton />
) : null
