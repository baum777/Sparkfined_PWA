export type ViewState = 'empty' | 'loading' | 'error' | 'result'

export interface ViewStateProps {
  state: ViewState
  error?: string
}
