import { FC, useMemo } from 'react'

import {
  CardContent,
  RadioGroup,
  Radio,
  FormControlLabel,
} from '@material-ui/core'

import { SectionCard, Spinner } from '@kathena/ui'
import { useQuestionQuery, useQuestionChoicesQuery } from 'graphql/generated'

export type QuestionProps = {
  id: string
  index?: number
}

const Question: FC<QuestionProps> = (props) => {
  const { id, index } = props
  const { data, loading } = useQuestionQuery({
    variables: { id },
  })

  const { data: dataQuestionChoice, loading: loadingChoice } =
    useQuestionChoicesQuery({
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
  if (loading || loadingChoice) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          margin: 20,
        }}
      >
        <Spinner />
      </div>
    )
  }

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
