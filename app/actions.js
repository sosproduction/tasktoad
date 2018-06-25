// Project action types
import {
    SELECT_PROJECT,
    CREATE_PROJECT,
    DELETE_PROJECT
} from './actionTypes';

export const selectProject = id => {
    return {
        type: SELECT_PROJECT,
        payload: id,
    };
};

export const createProject = props => {
    return {
        type: CREATE_PROJECT,
        payload: props
    };
}

export const deleteProject = id => {
    return {
        type: DELETE_PROJECT,
        payload: id,
    };
};


// Task action types
import {
    CREATE_TASK,
    MARK_DONE,
    DELETE_TASK,
    ADD_TAG_TO_TASK,
    REMOVE_TAG_FROM_TASK,
} from './actionTypes';


export const createTask = props => {
    return {
        type: CREATE_TASK,
        payload: props,
    };
};

export const markDone = id => {
    return {
        type: MARK_DONE,
        payload: id,
    };
};

export const deleteTask = id => {
    return {
        type: DELETE_TASK,
        payload: id,
    };
};

export const addTagToTask = (task, tag) => {
    return {
        type: ADD_TAG_TO_TASK,
        payload: {
            task,
            tag,
        },
    };
};

export const removeTagFromTask = (task, tag) => {
    return {
        type: REMOVE_TAG_FROM_TASK,
        payload: {
            task,
            tag,
        },
    };
};
