import { schema } from './models';
import { createSelector } from 'reselect';

// Selects the state managed by Redux-ORM.
export const ormSelector = state => state.orm;

// Redux-ORM selectors work with reselect. To feed input
// selectors to a Redux-ORM selector, we use the reselect `createSelector`.
export const tasks = createSelector(
    // The first input selector should always be the orm selector.
    // Behind the scenes, `schema.createSelector` begins a Redux-ORM
    // session with the state selected by `ormSelector` and passes
    // that Session instance as an argument instead.
    // So, `orm` is a Session instance.
    ormSelector,
    state => state.selectedProjectId,
    schema.createSelector((orm, projectId) => {
        console.log('Running tasks selector');

        // We could also do orm.Project.withId(projectId).tasks.map(...)
        // but this saves a query on the Project table.
        //
        // `.withRefs` means that the next operation (in this case filter)
        // will use direct references from the state instead of Model instances.
        // If you don't need any Model instance methods, you should use withRefs.
        return orm.Task.withRefs.filter({ project: projectId }).map(task => {
            // `task.ref` is a direct reference to the state,
            // so we need to be careful not to mutate it.
            //
            // We want to add a denormalized `tags` attribute
            // to each of our tasks, so we make a shallow copy of `task.ref`.
            const obj = Object.assign({}, task.ref);
            obj.tags = task.tags.withRefs.map(tag => tag.name);

            return obj;
        });
    })
);

export const project = createSelector(
    ormSelector,
    state => state.selectedProjectId,
    schema.createSelector((orm, selectedProjectId) => {
        console.log('Running project selector');
        // .ref returns a reference to the plain
        // JavaScript object in the store.
        return orm.Project.withId(selectedProjectId).ref;
    })
);

export const projects = createSelector(
    ormSelector,
    schema.createSelector(orm => {
        console.log('Running projects selector');

        // `.toRefArray` returns a new Array that includes
        // direct references to each Project object in the state.
        return orm.Project.all().toRefArray();
    })
);
