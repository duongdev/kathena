import { FC, useEffect, useMemo, useState } from 'react'

import {
  CardContent,
  RadioGroup,
  Radio,
  FormControlLabel,
  withStyles,
  Checkbox,
  CheckboxProps,
} from '@material-ui/core'

import { ANY } from '@kathena/types'
import { SectionCard, Spinner } from '@kathena/ui'
import {
  useQuestionQuery,
  useQuestionChoicesQuery,
  Maybe,
} from 'graphql/generated'

export type QuestionProps = {
  id: string
  index?: number
  quizSubmit:
    | {
        id: string
        quizId: string
        scores: number
        startTime?: ANY
        questionIds?: Maybe<string[]> | undefined
        questionChoiceIds?: Maybe<string[]> | undefined
        createdByAccountId: string
      }
    | undefined
  isSubmited?: boolean
}

const CheckboxGreen = withStyles({
  root: {
    color: 'green',
    '&$checked': {
      color: 'green',
    },
  },
  checked: {},
  // eslint-disable-next-line react/jsx-props-no-spreading
})((props: CheckboxProps) => <Checkbox color="default" {...props} />)

const CheckBoxRed = withStyles({
  root: {
    color: 'red',
    '&$checked': {
      color: 'red',
    },
  },
  checked: {},
  // eslint-disable-next-line react/jsx-props-no-spreading
})((props: CheckboxProps) => <Checkbox color="default" {...props} />)

const Question: FC<QuestionProps> = (props) => {
  const { id, index, quizSubmit, isSubmited } = props
  const { data, loading } = useQuestionQuery({
    variables: { id },
  })
  const [defaultValue, setDefaultValue] = useState('')
  const { data: dataQuestionChoice, loading: loadingChoice } =
    useQuestionChoicesQuery({
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

  useEffect(() => {
    if (quizSubmit && quizSubmit.questionIds && quizSubmit.questionChoiceIds) {
      const i = quizSubmit.questionIds?.findIndex((item) => item === id)
      if (i > -1) {
        setDefaultValue(quizSubmit.questionChoiceIds[i])
      }
    }
    // eslint-disable-next-line
  }, [id, quizSubmit])

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
        <RadioGroup defaultValue={defaultValue}>
          {isSubmited
            ? questionChoices.map((item) => (
                <FormControlLabel
                  disabled
                  value={item.id}
                  control={
                    item.isRight ? (
                      <CheckboxGreen disabled checked />
                    ) : (
                      <>
                        {defaultValue === item.id ? (
                          <CheckBoxRed disabled checked />
                        ) : (
                          <Checkbox disabled />
                        )}
                      </>
                    )
                  }
                  label={item.title}
                />
              ))
            : questionChoices.map((item) => (
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
