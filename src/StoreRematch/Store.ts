import { init, RematchDispatch, RematchRootState } from '@rematch/core'
import {models, RootModel} from './models'


export const store = init({
	models,
	// plugins: [persistPlugin],
})

export type Dispatch = RematchDispatch<RootModel>;
export type RootState = RematchRootState<RootModel>;
