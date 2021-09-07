import { FC } from 'react'

import { CardContent } from '@material-ui/core'

import { SectionCard } from '@kathena/ui'
// import { useQuizQuery } from 'graphql/generated'

export type QuestionProps = {
  id: string
}

const Question: FC<QuestionProps> = () => 
  // const { id } = props
  // const { data, loading } = useQuizQuery({
  //   variables: { id },
  // })

  // const quiz = useMemo(() => data?.quiz, [data])

   (
    <SectionCard maxContentHeight={false} gridItem={{ xs: 12 }} title="">
      <CardContent>
        {/* <Stack spacing={2}>
          <InfoBlock label="Tiêu đề">{quiz.title}</InfoBlock>
        </Stack> */}
      </CardContent>
    </SectionCard>
  )


export default Question
