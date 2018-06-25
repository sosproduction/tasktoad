/* eslint-disable default-case, no-shadow */
import { Schema, Model, many, fk } from 'redux-orm';
import { PropTypes } from 'react';
import propTypesMixin from 'redux-orm-proptypes';

// import constants for tasks
import {
    CREATE_TASK,
    MARK_DONE,
    DELETE_TASK,
    ADD_TAG_TO_TASK,
    REMOVE_TAG_FROM_TASK,
} from './actionTypes';

// import constants for projects
import {
    CREATE_PROJECT,
    DELETE_PROJECT
} from './actionTypes';


const ValidatingModel = propTypesMixin(Model);

export class Tag extends ValidatingModel {
    static reducer(state, action, Tag) {
        const { payload, type } = action;
        switch (type) {
        case CREATE_TASK:
            const tags = payload.tags.split(',');
            const trimmed = tags.map(name => name.trim());
            trimmed.forEach(name => Tag.create({ name }));
            break;
        case ADD_TAG_TO_TASK:
            if (!Tag.filter({ name: payload.tag }).exists()) {
                Tag.create({ name: payload.tag });
            }
            break;
        }
    }
}
Tag.modelName = 'Tag';
Tag.backend = {
    idAttribute: 'name',
};


export class Project extends ValidatingModel {
 static reducer(state, action, Project, session) {
        const { payload, type } = action;
        switch (type) {
        case CREATE_PROJECT:
            // You can pass an array of ids for many-to-many relations.
            // `redux-orm` will create the m2m rows automatically.
            const props = Object.assign({}, payload);
            Project.create(props);
            break;
     
        case DELETE_PROJECT:
            Project.withId(payload).delete();
            break;
        }
    }
}
Project.modelName = 'Project';
Project.fields = {
    tasks: fk('tasks', 'Project')
};
Project.propTypes = {
    text: PropTypes.string.isRequired
};


export class Task extends ValidatingModel {
    static reducer(state, action, Task, session) {
        const { payload, type } = action;
        switch (type) {
        case CREATE_TASK:
            // Payload includes a comma-delimited string
            // of tags, corresponding to the `name` property
            // of Tag, which is also its `idAttribute`.
            const tagIds = action.payload.tags.split(',').map(str => str.trim());

            // You can pass an array of ids for many-to-many relations.
            // `redux-orm` will create the m2m rows automatically.
            const props = Object.assign({}, payload, { tags: tagIds, done: false });
            Task.create(props);
            break;
        case MARK_DONE:
            // withId returns a Model instance.
            // Assignment doesn't mutate Model instances.
            Task.withId(payload).done = true;
            break;
        case DELETE_TASK:
            Task.withId(payload).delete();
            break;
        case ADD_TAG_TO_TASK:
            Task.withId(payload.task).tags.add(payload.tag);
            break;
        case REMOVE_TAG_FROM_TASK:
            Task.withId(payload.task).tags.remove(payload.tag);
            break;
        }
    }
}
Task.modelName = 'Task';
Task.fields = {
    tags: many('Tag', 'tasks'),
    project: fk('Project', 'tasks'),
};
Task.propTypes = {
    text: PropTypes.string.isRequired,
    done: PropTypes.bool.isRequired,
    project: PropTypes.oneOfType([
        PropTypes.instanceOf(Project),
        PropTypes.number,
    ]).isRequired,
    tags: PropTypes.arrayOf(PropTypes.oneOfType([
        PropTypes.instanceOf(Tag),
        PropTypes.string,
    ])).isRequired,
};
Task.defaultProps = {
    done: false,
};

export const schema = new Schema();
schema.register(Task, Tag, Project);

export default schema;
