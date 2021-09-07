import { FC, useMemo } from 'react'

import {
  CardContent,
  RadioGroup,
  Radio,
  FormControlLabel,
} from '@material-ui/core'

import { SectionCard } from '@kathena/ui'
import { useQuestionQuery, useQuestionChoicesQuery } from 'graphql/generated'

export type QuestionProps = {
  id: string
  index?: number
}

const Question: FC<QuestionProps> = (props) => {
  const { id, index } = props
  const { data } = useQuestionQuery({
    variables: { id },
  })

  const { data: dataQuestionChoice } = useQuestionChoicesQuery({
    variables: { questionId: id },
  })

  const question = useMemo(() => data?.question, [data])
  const questionChoices = useMemo(
    () => dataQuestionChoice?.questionChoices?.questionChoices ?? [],
    [dataQuestionChoice],
  )
  const idRight = useMemo(
    () => dataQuestionChoice?.questionChoices?.idRight,
    [dataQuestionChoice],
  )
  return (
    <SectionCard
      maxContentHeight={false}
      gridItem={{ xs: 12 }}
      title={`Câu hỏi ${index || index === 0 ? index + 1 : ''}: ${
        question?.title
      } (${question?.scores} điểm)`}
    >
      <CardContent>
        <RadioGroup value={idRight}>
          {questionChoices.map((item) => (
            <FormControlLabel
              value={item.id}
              disabled
              control={<Radio />}
              label={item.title}
            />
          ))}
        </RadioGroup>
      </CardContent>
    </SectionCard>
  )
}

export default Question
