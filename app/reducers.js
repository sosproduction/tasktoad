import { SELECT_PROJECT } from './actionTypes';

export function selectedProjectIdReducer(state = 0, action) {
    const { type, payload } = action;
    switch (type) {
    case SELECT_PROJECT:
        return payload;
    default:
        return state;
    }
}
