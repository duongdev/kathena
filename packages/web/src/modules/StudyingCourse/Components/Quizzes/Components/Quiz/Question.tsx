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
  const questionChoices = useMemo(() => {
    if (dataQuestionChoice?.questionChoices?.questionChoices) {
      let list = [...dataQuestionChoice?.questionChoices?.questionChoices]
      list = list.sort(() => Math.random() - 0.5)
      return list
    }
    return []
  }, [dataQuestionChoice])

  return (
    <SectionCard
      maxContentHeight={false}
      gridItem={{ xs: 12 }}
      title={`Câu hỏi ${index || index === 0 ? index + 1 : ''}: ${
        question?.title
      } (${question?.scores} điểm)`}
    >
      <CardContent>
        <RadioGroup>
          {questionChoices.map((item) => (
            <FormControlLabel
              value={item.id}
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
